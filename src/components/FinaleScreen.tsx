import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CHARA_NAME, PHOTOS } from '../assets/constants';
import { useSpeed } from '../contexts/SpeedContext';
import './FinaleScreen.css';

interface FinaleScreenProps {
  onPhaseChange: () => void;
}

const PHOTO_DATE = '2026.5.26';

function fireConfetti(): void {
  const colors = ['#FFB6D9', '#C5A3FF', '#B7F0DC', '#A8E1FF', '#FF6FA8', '#FFD93D'];
  const opts = { colors, particleCount: 80, spread: 90, startVelocity: 40 };
  setTimeout(() => confetti({ ...opts, origin: { x: 0.3, y: 0.6 } }), 0);
  setTimeout(() => confetti({ ...opts, origin: { x: 0.7, y: 0.6 } }), 500);
  setTimeout(() => confetti({ ...opts, origin: { x: 0.5, y: 0.3 }, particleCount: 120, spread: 130 }), 1000);
}

export default function FinaleScreen({ onPhaseChange }: FinaleScreenProps) {
  const speed = useSpeed();
  const [showButton, setShowButton] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const firedRef = useRef(false);

  // マウント時に写真をランダムに1枚決定（useState の lazy initializer は副作用OK）
  const [selectedPhoto] = useState<string>(() => PHOTOS[Math.floor(Math.random() * PHOTOS.length)]);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    fireConfetti();
    // G: 日付ワイプ開始 1800ms (speed 倍率対象)
    const dateTimer = setTimeout(() => setShowDate(true), 1800 * speed);
    // G: 再遊ボタン出現 5200ms (speed 倍率対象)
    const btnTimer = setTimeout(() => setShowButton(true), 5200 * speed);
    return () => {
      clearTimeout(dateTimer);
      clearTimeout(btnTimer);
    };
  }, [speed]);

  return (
    <motion.div
      className="finale-screen"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', bounce: 0.7, duration: 1.2 * speed }}
    >
      {/* I: 上下二段アーチ */}
      <svg
        className="finale-arch"
        viewBox="0 0 400 220"
        preserveAspectRatio="xMidYMid meet"
        aria-label={`HAPPY BIRTHDAY ${CHARA_NAME}!!`}
      >
        <defs>
          <linearGradient id="rainbow-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="16%" stopColor="#FFB347" />
            <stop offset="33%" stopColor="#FFD93D" />
            <stop offset="50%" stopColor="#6BCB77" />
            <stop offset="66%" stopColor="#4D96FF" />
            <stop offset="83%" stopColor="#9D4EDD" />
            <stop offset="100%" stopColor="#FF6FA8" />
            <animate
              attributeName="x1"
              values="-1;0;-1"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              values="0;1;0"
              dur="3s"
              repeatCount="indefinite"
            />
          </linearGradient>
          <filter id="shiny-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* I: 上アーチ path */}
          <path id="arch-path-top" d="M 30 110 Q 200 -30 370 110" fill="none" />
          {/* I: 下アーチ path */}
          <path id="arch-path-bottom" d="M 60 180 Q 200 85 340 180" fill="none" />
        </defs>
        {/* I: 上アーチ: HAPPY BIRTHDAY */}
        <text
          className="arch-text arch-text--top"
          fill="url(#rainbow-grad)"
          stroke="white"
          strokeWidth="1.5"
          paintOrder="stroke"
          strokeLinejoin="round"
          filter="url(#shiny-glow)"
          textAnchor="middle"
        >
          <textPath href="#arch-path-top" startOffset="50%">
            HAPPY BIRTHDAY
          </textPath>
        </text>
        {/* I: 下アーチ: こっちゃん!! */}
        <text
          className="arch-text arch-text--bottom"
          fill="url(#rainbow-grad)"
          stroke="white"
          strokeWidth="1.5"
          paintOrder="stroke"
          strokeLinejoin="round"
          filter="url(#shiny-glow)"
          textAnchor="middle"
        >
          <textPath href="#arch-path-bottom" startOffset="50%">
            {CHARA_NAME}!!
          </textPath>
        </text>
      </svg>

      {/* H: チェキを画面縦横ど真ん中に配置 */}
      <motion.div
        className="finale-cheki"
        initial={{ opacity: 0, scale: 0, rotate: -10, x: '-50%', y: 'calc(-50% + 60px)' }}
        animate={{ opacity: 1, scale: 1, rotate: -3, x: '-50%', y: '-50%' }}
        transition={{ type: 'spring', bounce: 0.5, duration: 1.0 * speed, delay: 0.6 * speed }}
      >
        <div className="cheki-image-wrap">
          <img src={selectedPhoto} alt="" className="cheki-image" />
        </div>
        <div className="cheki-bottom">
          <motion.span
            className="cheki-date"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: showDate ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
            transition={{ duration: 1.6 * speed, ease: [0.65, 0, 0.35, 1] }}
          >
            {PHOTO_DATE}
          </motion.span>
        </div>
      </motion.div>

      {/* 再遊ボタン */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            className="finale-replay-btn"
            initial={{ opacity: 0, x: '-50%', y: 30 }}
            animate={{ opacity: 1, x: '-50%', y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            onClick={onPhaseChange}
            whileTap={{ x: '-50%', scale: 0.92 }}
          >
            もう一度遊ぶ♡
          </motion.button>
        )}
      </AnimatePresence>

      {/* 背景デコ */}
      <div className="finale-bg-deco" aria-hidden="true">
        {['✨', '♡', '✦', '✨', '♡', '✦', '✨', '♡'].map((s, i) => (
          <span key={i} className={`finale-deco finale-deco--${i}`}>{s}</span>
        ))}
      </div>
    </motion.div>
  );
}
