import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeCharge } from '../hooks/useSwipeCharge';
import { HAPPY_BIRTHDAY_LETTERS, SWIPE_THRESHOLD_PER_LETTER } from '../assets/constants';
import { useSpeed } from '../contexts/SpeedContext';
import './ChargeScreen.css';

interface ChargeScreenProps {
  onPhaseChange: () => void;
  onLetterAppear?: () => void;
  onSwipeStart?: () => void;
  onSwipeActive?: (active: boolean) => void; // スワイプ中 (指接触中) フラグ
  onHalfway?: () => void;
}

interface FloatingLetter {
  id: number;
  char: string;
  x: number; // viewport px
  y: number; // viewport px
  color: string;
}

const LETTER_COLORS = ['var(--yk-pink-deep)', 'var(--yk-lavender)', 'var(--yk-mint)'];

export default function ChargeScreen({
  onPhaseChange,
  onLetterAppear,
  onSwipeStart,
  onSwipeActive,
  onHalfway,
}: ChargeScreenProps) {
  const speed = useSpeed();
  const [letters, setLetters] = useState<FloatingLetter[]>([]);
  const [isFullyCharged, setIsFullyCharged] = useState(false);
  const letterCountRef = useRef(0);
  const letterIdRef = useRef(0);
  const completedRef = useRef(false);
  const swipeStartedRef = useRef(false);
  const halfwayRef = useRef(false);

  // onPhaseChange を ref に保持: parent の再レンダーで参照が変わっても、
  // 100% 達成時の setTimeout が cleanup で clear されないようにする保険
  const onPhaseChangeRef = useRef(onPhaseChange);
  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
  }, [onPhaseChange]);

  // 100% 到達時のコールバック（useSwipeCharge から同期的に呼ばれる）
  const handleFullyCharged = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsFullyCharged(true);
    onSwipeActive?.(false); // チャージループ音を停止
    setTimeout(() => {
      onPhaseChangeRef.current();
    }, 1000 * speed);
  }, [speed, onSwipeActive]);

  const { chargeAmount, bindHandlers: rawBindHandlers } = useSwipeCharge({ onComplete: handleFullyCharged });

  // 初回スワイプ開始時に SE 発火、毎回 pointerdown/up で active フラグを通知
  const bindHandlers = {
    ...rawBindHandlers,
    onPointerDown: (e: React.PointerEvent) => {
      if (!swipeStartedRef.current) {
        swipeStartedRef.current = true;
        onSwipeStart?.();
      }
      onSwipeActive?.(true); // チャージループ音を開始
      rawBindHandlers.onPointerDown(e);
    },
    onPointerUp: (e: React.PointerEvent) => {
      onSwipeActive?.(false); // 指離したらチャージループ音を停止
      rawBindHandlers.onPointerUp(e);
    },
  };

  // 50% 到達時に効果音発火（1度だけ）
  useEffect(() => {
    if (chargeAmount >= 0.5 && !halfwayRef.current) {
      halfwayRef.current = true;
      onHalfway?.();
    }
  }, [chargeAmount, onHalfway]);

  // 吸い込み中心座標 = ハート内の「○%」表示位置（SVG text の bbox 中心）
  const percentTextRef = useRef<SVGTextElement>(null);
  const [heartCenter, setHeartCenter] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const updateCenter = () => {
      if (percentTextRef.current) {
        const rect = percentTextRef.current.getBoundingClientRect();
        setHeartCenter({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }
    };
    updateCenter();
    // ハート初期化アニメで位置が動くため、次フレーム + 短時間後にも再取得
    const raf = requestAnimationFrame(updateCenter);
    const t1 = setTimeout(updateCenter, 300);
    const t2 = setTimeout(updateCenter, 800);
    window.addEventListener('resize', updateCenter);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', updateCenter);
    };
  }, []);

  // 100% 達成時に発光エフェクト → フェーズ遷移（D）
  // 二重保険として useSwipeCharge.onComplete だけでなくここでも検出する。
  // onPhaseChange は ref 経由で参照するため依存配列に含めない (含めると
  // parent の再レンダーで setTimeout が clear されて遷移失敗する)
  useEffect(() => {
    if (chargeAmount >= 0.999 && !completedRef.current) {
      completedRef.current = true;
      setIsFullyCharged(true);
      onSwipeActive?.(false);
      const t = setTimeout(() => {
        onPhaseChangeRef.current();
      }, 1000 * speed);
      return () => clearTimeout(t);
    }
  }, [chargeAmount, speed, onSwipeActive]);

  // 累積距離に応じて文字を出現させる
  const totalDistance = chargeAmount * 8000;
  const expectedLetterCount = Math.floor(totalDistance / SWIPE_THRESHOLD_PER_LETTER);
  const prevExpectedRef = useRef(0);

  useEffect(() => {
    if (expectedLetterCount > prevExpectedRef.current) {
      const diff = expectedLetterCount - prevExpectedRef.current;
      prevExpectedRef.current = expectedLetterCount;

      // 文字出現音は diff によらず1回だけ（同時複数文字でも連射しない）
      onLetterAppear?.();

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
  }, [expectedLetterCount, onLetterAppear]);

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
      <div className="charge-gauge-wrap">
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

            {/* パーセント表示（文字吸い込みのターゲット） */}
            <text
              ref={percentTextRef}
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
