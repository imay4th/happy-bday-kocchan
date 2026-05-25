import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeCharge } from '../hooks/useSwipeCharge';
import { HAPPY_BIRTHDAY_LETTERS, SWIPE_THRESHOLD_PER_LETTER } from '../assets/constants';
import { useSpeed } from '../contexts/SpeedContext';
import './ChargeScreen.css';

interface ChargeScreenProps {
  onPhaseChange: () => void;
}

interface FloatingLetter {
  id: number;
  char: string;
  x: number; // viewport px
  y: number; // viewport px
  color: string;
}

const LETTER_COLORS = ['var(--yk-pink-deep)', 'var(--yk-lavender)', 'var(--yk-mint)'];

export default function ChargeScreen({ onPhaseChange }: ChargeScreenProps) {
  const { chargeAmount, bindHandlers } = useSwipeCharge();
  const speed = useSpeed();
  const [letters, setLetters] = useState<FloatingLetter[]>([]);
  const [isFullyCharged, setIsFullyCharged] = useState(false);
  const letterCountRef = useRef(0);
  const letterIdRef = useRef(0);
  const completedRef = useRef(false);

  // ハート中心座標
  const heartRef = useRef<HTMLDivElement>(null);
  const [heartCenter, setHeartCenter] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateCenter = () => {
      if (heartRef.current) {
        const rect = heartRef.current.getBoundingClientRect();
        setHeartCenter({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }
    };
    updateCenter();
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
  }, []);

  // 100% 達成時に発光エフェクト → フェーズ遷移（D）
  useEffect(() => {
    if (chargeAmount >= 1 && !completedRef.current) {
      completedRef.current = true;
      setIsFullyCharged(true);
      const timer = setTimeout(() => {
        onPhaseChange();
      }, 1000 * speed);
      return () => clearTimeout(timer);
    }
  }, [chargeAmount, onPhaseChange, speed]);

  // 累積距離に応じて文字を出現させる
  const totalDistance = chargeAmount * 8000;
  const expectedLetterCount = Math.floor(totalDistance / SWIPE_THRESHOLD_PER_LETTER);
  const prevExpectedRef = useRef(0);

  useEffect(() => {
    if (expectedLetterCount > prevExpectedRef.current) {
      const diff = expectedLetterCount - prevExpectedRef.current;
      prevExpectedRef.current = expectedLetterCount;

      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;

      setLetters((prev) => {
        const next = [...prev];
        for (let i = 0; i < diff; i++) {
          const idx = letterCountRef.current % HAPPY_BIRTHDAY_LETTERS.length;
          const char = HAPPY_BIRTHDAY_LETTERS[idx];
          letterCountRef.current++;
          const id = letterIdRef.current++;

          // 画面端寄りに出現（10〜90%、ハート付近を避けるためそのまま全域）
          const xPct = 10 + Math.random() * 80;
          const yPct = 10 + Math.random() * 80;
          const x = xPct * vw / 100;
          const y = yPct * vh / 100;

          const color = LETTER_COLORS[Math.floor(Math.random() * LETTER_COLORS.length)];
          next.push({ id, char, x, y, color });
        }
        return next;
      });
    }
  }, [expectedLetterCount]);

  // ゲージの色計算（0→ピンク、50→ラベンダー、100→ミント）
  function getGaugeColor(amount: number): string {
    if (amount < 0.5) {
      const t = amount * 2;
      return `hsl(${330 - t * 30}, ${100 - t * 10}%, ${70 + t * 5}%)`;
    } else {
      const t = (amount - 0.5) * 2;
      return `hsl(${300 + t * 80}, 90%, 75%)`;
    }
  }

  const gaugeColor = getGaugeColor(chargeAmount);

  // ふち輝き: chargeAmount に応じて強くなる
  const strokeOpacity = 0.6 + chargeAmount * 0.4;
  const strokeWidth = 4 + chargeAmount * 4;
  const glowStrength = 8 + chargeAmount * 24;

  return (
    <motion.div
      className="charge-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      {...bindHandlers}
      style={{ touchAction: 'none' }}
    >
      {/* 浮かぶ文字エフェクト（ハートへ吸い込まれる） */}
      <AnimatePresence>
        {letters.map((letter) => {
          const targetX = heartCenter.x - letter.x;
          const targetY = heartCenter.y - letter.y;
          return (
            <motion.span
              key={letter.id}
              className="charge-letter"
              style={{
                left: letter.x,
                top: letter.y,
                color: letter.color,
              }}
              initial={{ scale: 1.5, opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
              animate={{
                scale: 0.2,
                opacity: 0,
                x: targetX,
                y: targetY,
                filter: 'blur(8px)',
              }}
              exit={{}}
              transition={{ duration: 1.2, ease: 'easeIn' }}
              onAnimationComplete={() => {
                setLetters((prev) => prev.filter((l) => l.id !== letter.id));
              }}
            >
              {letter.char === ' ' ? ' ' : letter.char}
            </motion.span>
          );
        })}
      </AnimatePresence>

      {/* 中央の指示テキスト（C: 改行） */}
      <div className="charge-hint">
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          スワイプしてバースデーパワーを<br />チャージしよう！
        </motion.p>
      </div>

      {/* ハート型ゲージ（画面中央やや上） */}
      <div className="charge-gauge-wrap" ref={heartRef}>
        {/* D: 100% 達成時の発光リング3連 */}
        {isFullyCharged && (
          <div className="charge-burst-container">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="charge-burst-ring"
                initial={{ scale: 0.4, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.15 }}
              />
            ))}
          </div>
        )}

        <motion.div
          animate={
            isFullyCharged
              ? { scale: [1, 1.15, 1] }
              : { scale: 1 }
          }
          transition={
            isFullyCharged
              ? { duration: 0.4, ease: 'easeOut' }
              : {}
          }
        >
          <svg
            className="charge-gauge-svg"
            viewBox="0 0 200 180"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: isFullyCharged
                ? `drop-shadow(0 8px 20px rgba(255, 111, 168, 0.4)) drop-shadow(0 0 ${glowStrength}px white) drop-shadow(0 0 40px white)`
                : `drop-shadow(0 8px 20px rgba(255, 111, 168, 0.4)) drop-shadow(0 0 ${glowStrength}px white)`,
            }}
          >
            <defs>
              <clipPath id="heart-clip">
                <path d="M100 160 C60 130 20 100 20 65 C20 35 45 15 70 15 C83 15 93 22 100 30 C107 22 117 15 130 15 C155 15 180 35 180 65 C180 100 140 130 100 160 Z" />
              </clipPath>
              <linearGradient id="gauge-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gaugeColor} stopOpacity="0.9" />
                <stop offset="100%" stopColor={gaugeColor} stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* ハート背景 */}
            <path
              d="M100 160 C60 130 20 100 20 65 C20 35 45 15 70 15 C83 15 93 22 100 30 C107 22 117 15 130 15 C155 15 180 35 180 65 C180 100 140 130 100 160 Z"
              fill="rgba(255,255,255,0.3)"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="3"
            />

            {/* 塗り（下から）*/}
            <rect
              x="0"
              y={180 - chargeAmount * 180}
              width="200"
              height={chargeAmount * 180}
              fill="url(#gauge-fill)"
              clipPath="url(#heart-clip)"
            />

            {/* ハート枠（輝き） */}
            <path
              d="M100 160 C60 130 20 100 20 65 C20 35 45 15 70 15 C83 15 93 22 100 30 C107 22 117 15 130 15 C155 15 180 35 180 65 C180 100 140 130 100 160 Z"
              fill="none"
              stroke={`rgba(255,255,255,${strokeOpacity})`}
              strokeWidth={strokeWidth}
            />

            {/* パーセント表示 */}
            <text
              x="100"
              y="95"
              textAnchor="middle"
              className="charge-gauge-text"
              fill="white"
            >
              {Math.round(chargeAmount * 100)}%
            </text>
          </svg>
        </motion.div>

        <p className="charge-gauge-label">チャージ中♡</p>
      </div>

      {/* 背景デコ */}
      <div className="charge-bg-deco" aria-hidden="true">
        {['✦', '♡', '✨', '✦', '♡'].map((s, i) => (
          <span key={i} className={`charge-deco charge-deco--${i}`}>{s}</span>
        ))}
      </div>
    </motion.div>
  );
}
