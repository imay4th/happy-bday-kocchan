import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CakeScreen.css';

interface CakeScreenProps {
  onPhaseChange: () => void;
  onBlow: () => void;
}

export default function CakeScreen({ onPhaseChange, onBlow }: CakeScreenProps) {
  const [flameVisible, setFlameVisible] = useState(true);
  const [windVisible, setWindVisible] = useState(false);

  const handleFlameClick = () => {
    if (!flameVisible) return;
    setFlameVisible(false);
    setWindVisible(true);
    onBlow();
    setTimeout(() => {
      setWindVisible(false);
    }, 800);
    setTimeout(() => {
      onPhaseChange();
    }, 1000);
  };

  return (
    <motion.div
      className="cake-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
    >
      {/* ケーキコンテナ */}
      <div className="cake-wrap">
        <motion.div
          className="cake-container"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', bounce: 0.45, duration: 1.0 }}
        >
          {/* ケーキSVG */}
          <svg
            className="cake-svg"
            viewBox="0 0 200 220"
            xmlns="http://www.w3.org/2000/svg"
            onClick={handleFlameClick}
            style={{ cursor: flameVisible ? 'pointer' : 'default' }}
          >
            {/* ベース（ピンク） */}
            <rect x="20" y="130" width="160" height="70" rx="12" fill="#FFB6D9" stroke="#FF6FA8" strokeWidth="3" />
            {/* クリーム層（ラベンダー） */}
            <rect x="30" y="110" width="140" height="30" rx="8" fill="#C5A3FF" stroke="#A07AFF" strokeWidth="2.5" />
            {/* クリームの波 */}
            <path d="M30 115 Q50 105 70 115 Q90 125 110 115 Q130 105 150 115 Q170 125 170 115" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.6" />
            {/* 苺デコ */}
            <circle cx="65" cy="108" r="7" fill="#FF4466" />
            <circle cx="100" cy="106" r="8" fill="#FF4466" />
            <circle cx="135" cy="108" r="7" fill="#FF4466" />
            <circle cx="65" cy="108" r="4" fill="#FF7799" />
            <circle cx="100" cy="106" r="5" fill="#FF7799" />
            <circle cx="135" cy="108" r="4" fill="#FF7799" />
            {/* ろうそく */}
            <rect x="90" y="70" width="20" height="45" rx="5" fill="#FFF176" stroke="#F9C300" strokeWidth="2" />
            {/* ろうそくの縦縞 */}
            <line x1="97" y1="72" x2="97" y2="113" stroke="#F9C300" strokeWidth="1.5" strokeOpacity="0.5" />
            {/* 炎グループ */}
            <AnimatePresence>
              {flameVisible && (
                <motion.g
                  className="flame-group"
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                  style={{ transformOrigin: '100px 60px' }}
                >
                  {/* 外炎 */}
                  <motion.path
                    d="M100 30 C108 42 115 50 112 62 C110 70 104 73 100 73 C96 73 90 70 88 62 C85 50 92 42 100 30 Z"
                    fill="#FF8C00"
                    className="flame-outer"
                  />
                  {/* 内炎 */}
                  <motion.path
                    d="M100 38 C105 46 109 54 107 62 C105 68 102 70 100 70 C98 70 95 68 93 62 C91 54 95 46 100 38 Z"
                    fill="#FFD600"
                    className="flame-inner"
                  />
                  {/* 炎コア */}
                  <motion.ellipse
                    cx="100"
                    cy="65"
                    rx="5"
                    ry="6"
                    fill="white"
                    className="flame-core"
                  />
                </motion.g>
              )}
            </AnimatePresence>
            {/* ろうそく芯（炎消えた後） */}
            {!flameVisible && (
              <line x1="100" y1="70" x2="100" y2="63" stroke="#555" strokeWidth="2" strokeLinecap="round" />
            )}
            {/* ケーキ正面デコ */}
            <circle cx="55" cy="160" r="6" fill="white" opacity="0.6" />
            <circle cx="80" cy="170" r="5" fill="white" opacity="0.5" />
            <circle cx="120" cy="170" r="5" fill="white" opacity="0.5" />
            <circle cx="145" cy="160" r="6" fill="white" opacity="0.6" />
            <text x="100" y="162" textAnchor="middle" fill="white" fontFamily="sans-serif" fontSize="12" fontWeight="bold" opacity="0.8">🎂</text>
          </svg>
        </motion.div>

        {/* ヒントテキスト */}
        <AnimatePresence>
          {flameVisible && (
            <motion.p
              className="cake-hint"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              exit={{ opacity: 0 }}
            >
              タップして炎を消してね！🎂
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* 風エフェクト */}
      <AnimatePresence>
        {windVisible && (
          <motion.div
            className="wind-effect"
            initial={{ opacity: 0.8, x: 0 }}
            animate={{ opacity: 0, x: 200 }}
            exit={{}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {['〜', '〜', '〜'].map((w, i) => (
              <span key={i} className={`wind-char wind-char--${i}`}>{w}</span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 背景デコ */}
      <div className="cake-bg-deco" aria-hidden="true">
        {['✨', '♡', '✦', '✨', '♡'].map((s, i) => (
          <span key={i} className={`cake-deco cake-deco--${i}`}>{s}</span>
        ))}
      </div>
    </motion.div>
  );
}
