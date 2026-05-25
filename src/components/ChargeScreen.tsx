import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeCharge } from '../hooks/useSwipeCharge';
import { HAPPY_BIRTHDAY_LETTERS, SWIPE_THRESHOLD_PER_LETTER } from '../assets/constants';
import './ChargeScreen.css';

interface ChargeScreenProps {
  onPhaseChange: () => void;
}

interface FloatingLetter {
  id: number;
  char: string;
  x: number;
  y: number;
  color: string;
}

const LETTER_COLORS = ['var(--yk-pink-deep)', 'var(--yk-lavender)', 'var(--yk-mint)'];

export default function ChargeScreen({ onPhaseChange }: ChargeScreenProps) {
  const { chargeAmount, bindHandlers } = useSwipeCharge();
  const [letters, setLetters] = useState<FloatingLetter[]>([]);
  const letterCountRef = useRef(0);
  const letterIdRef = useRef(0);
  const completedRef = useRef(false);

  // 100% 達成時にフェーズ遷移
  useEffect(() => {
    if (chargeAmount >= 1 && !completedRef.current) {
      completedRef.current = true;
      setTimeout(() => {
        onPhaseChange();
      }, 500);
    }
  }, [chargeAmount, onPhaseChange]);

  // 累積距離に応じて文字を出現させる
  const totalDistance = chargeAmount * 8000;
  const expectedLetterCount = Math.floor(totalDistance / SWIPE_THRESHOLD_PER_LETTER);
  const prevExpectedRef = useRef(0);

  useEffect(() => {
    if (expectedLetterCount > prevExpectedRef.current) {
      const diff = expectedLetterCount - prevExpectedRef.current;
      prevExpectedRef.current = expectedLetterCount;

      setLetters((prev) => {
        const next = [...prev];
        for (let i = 0; i < diff; i++) {
          const idx = letterCountRef.current % HAPPY_BIRTHDAY_LETTERS.length;
          const char = HAPPY_BIRTHDAY_LETTERS[idx];
          letterCountRef.current++;
          const id = letterIdRef.current++;
          const x = 50 + (Math.random() - 0.5) * 40; // 30%〜70%
          const y = 40 + (Math.random() - 0.5) * 40; // 20%〜60%
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
      // ピンク → ラベンダー
      const t = amount * 2;
      return `hsl(${330 - t * 30}, ${100 - t * 10}%, ${70 + t * 5}%)`;
    } else {
      // ラベンダー → ミント
      const t = (amount - 0.5) * 2;
      return `hsl(${300 + t * 80}, 90%, 75%)`;
    }
  }

  const gaugeColor = getGaugeColor(chargeAmount);

  return (
    <motion.div
      className="charge-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      {...bindHandlers}
      style={{ touchAction: 'none' }}
    >
      {/* 浮かぶ文字エフェクト */}
      <AnimatePresence>
        {letters.map((letter) => (
          <motion.span
            key={letter.id}
            className="charge-letter"
            style={{
              left: `${letter.x}%`,
              top: `${letter.y}%`,
              color: letter.color,
            }}
            initial={{ scale: 1.5, opacity: 1, y: 0, filter: 'blur(0px)' }}
            animate={{ scale: 0.2, opacity: 0, y: -200, filter: 'blur(8px)' }}
            exit={{}}
            transition={{ duration: 1.2, ease: 'easeIn' }}
            onAnimationComplete={() => {
              setLetters((prev) => prev.filter((l) => l.id !== letter.id));
            }}
          >
            {letter.char === ' ' ? ' ' : letter.char}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* 中央の指示テキスト */}
      <div className="charge-hint">
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          ぐるぐるスワイプしてね✨
        </motion.p>
      </div>

      {/* ハート型ゲージ */}
      <div className="charge-gauge-wrap">
        <svg
          className="charge-gauge-svg"
          viewBox="0 0 200 180"
          xmlns="http://www.w3.org/2000/svg"
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

          {/* ハート枠 */}
          <path
            d="M100 160 C60 130 20 100 20 65 C20 35 45 15 70 15 C83 15 93 22 100 30 C107 22 117 15 130 15 C155 15 180 35 180 65 C180 100 140 130 100 160 Z"
            fill="none"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="4"
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
