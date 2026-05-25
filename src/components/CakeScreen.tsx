import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeed } from '../contexts/SpeedContext';
import './CakeScreen.css';

interface CakeScreenProps {
  onPhaseChange: () => void;
  onBlow: () => void;
}

export default function CakeScreen({ onPhaseChange, onBlow }: CakeScreenProps) {
  const speed = useSpeed();
  const [flameVisible, setFlameVisible] = useState(true);
  const [windVisible, setWindVisible] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [candleTilted, setCandleTilted] = useState(false);

  // E: onPointerDown に変更 + 重複防止を isPreparing も含める
  const handleFlameClick = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!flameVisible || isPreparing) return;
    setFlameVisible(false);
    setWindVisible(true);
    setCandleTilted(true);
    onBlow();
    // 風が吹き終わる (G: 1200ms * speed)
    const t1 = setTimeout(() => setWindVisible(false), 1200 * speed);
    // 火消し後、火を見守る間 (G: 600ms) → タメ開始
    const t2 = setTimeout(() => setIsPreparing(true), 600 * speed);
    // タメ完了 → 遷移 (G: 合計 1800ms)
    const t3 = setTimeout(() => onPhaseChange(), 1800 * speed);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  return (
    <motion.div
      className="cake-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
    >
      {/* タメ演出オーバーレイ */}
      <AnimatePresence>
        {isPreparing && (
          <motion.div
            className="cake-prep-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
          />
        )}
      </AnimatePresence>

      {/* ケーキコンテナ */}
      <div className="cake-wrap">
        <motion.div
          className="cake-container"
          initial={{ y: '100%' }}
          animate={{
            y: isPreparing ? 10 : 0,
            scale: isPreparing ? 0.7 : 1,
          }}
          transition={
            isPreparing
              ? { duration: 1.0, ease: 'easeIn' }
              : { type: 'spring', bounce: 0.45, duration: 1.4 }
          }
        >
          {/* ケーキSVG */}
          <svg
            className="cake-svg"
            viewBox="0 0 200 220"
            xmlns="http://www.w3.org/2000/svg"
            onPointerDown={handleFlameClick}
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

            {/* ろうそく「2」 (F: 風を受けて傾く) */}
            <motion.text
              x="78"
              y="115"
              textAnchor="middle"
              fontSize="56"
              fontWeight="900"
              fill="#FFF176"
              stroke="#F9C300"
              strokeWidth="2"
              fontFamily="'Mochiy Pop One', sans-serif"
              animate={candleTilted ? { rotate: [0, 6, 0] } : { rotate: 0 }}
              transition={candleTilted ? { duration: 1.0, ease: 'easeInOut' } : {}}
              style={{ transformOrigin: '78px 115px' }}
            >2</motion.text>

            {/* ろうそく「7」 (F: 風を受けて傾く) */}
            <motion.text
              x="122"
              y="115"
              textAnchor="middle"
              fontSize="56"
              fontWeight="900"
              fill="#FFF176"
              stroke="#F9C300"
              strokeWidth="2"
              fontFamily="'Mochiy Pop One', sans-serif"
              animate={candleTilted ? { rotate: [0, 6, 0] } : { rotate: 0 }}
              transition={candleTilted ? { duration: 1.0, ease: 'easeInOut', delay: 0.1 } : {}}
              style={{ transformOrigin: '122px 115px' }}
            >7</motion.text>

            {/* 炎グループ (2つ) */}
            <AnimatePresence>
              {flameVisible && (
                <>
                  {/* 炎「2」用 */}
                  <motion.g
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.3, x: 25, rotate: 40 }}
                    transition={{ duration: 0.6 }}
                    style={{ transformOrigin: '78px 52px' }}
                  >
                    <motion.path
                      d="M78 26 C86 38 93 46 90 58 C88 66 82 69 78 69 C74 69 68 66 66 58 C63 46 70 38 78 26 Z"
                      fill="#FF8C00"
                      className="flame-outer"
                    />
                    <motion.path
                      d="M78 34 C83 42 87 50 85 58 C83 64 80 66 78 66 C76 66 73 64 71 58 C69 50 73 42 78 34 Z"
                      fill="#FFD600"
                      className="flame-inner"
                    />
                    <motion.ellipse
                      cx="78"
                      cy="61"
                      rx="5"
                      ry="6"
                      fill="white"
                      className="flame-core"
                    />
                  </motion.g>

                  {/* 炎「7」用 */}
                  <motion.g
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.3, x: 25, rotate: 40 }}
                    transition={{ duration: 0.6 }}
                    style={{ transformOrigin: '122px 52px' }}
                  >
                    <motion.path
                      d="M122 26 C130 38 137 46 134 58 C132 66 126 69 122 69 C118 69 112 66 110 58 C107 46 114 38 122 26 Z"
                      fill="#FF8C00"
                      className="flame-outer"
                    />
                    <motion.path
                      d="M122 34 C127 42 131 50 129 58 C127 64 124 66 122 66 C120 66 117 64 115 58 C113 50 117 42 122 34 Z"
                      fill="#FFD600"
                      className="flame-inner"
                    />
                    <motion.ellipse
                      cx="122"
                      cy="61"
                      rx="5"
                      ry="6"
                      fill="white"
                      className="flame-core"
                    />
                  </motion.g>
                </>
              )}
            </AnimatePresence>

            {/* ろうそく芯（炎消えた後） */}
            {!flameVisible && (
              <>
                <line x1="78" y1="66" x2="78" y2="59" stroke="#555" strokeWidth="2" strokeLinecap="round" />
                <line x1="122" y1="66" x2="122" y2="59" stroke="#555" strokeWidth="2" strokeLinecap="round" />
              </>
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
              タップして火を吹き消そう！
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* F: 強化された風エフェクト */}
      <AnimatePresence>
        {windVisible && (
          <motion.div
            className="wind-effect"
            initial={{ opacity: 1, x: '-20%' }}
            animate={{ opacity: 0, x: '120%' }}
            exit={{}}
            transition={{ duration: 1.2 * speed, ease: 'easeOut' }}
          >
            {/* ふんわり雲 */}
            <div className="wind-cloud" />
            {/* 〜 と 💨 を複数散らす */}
            {['〜', '💨', '〜', '〜', '💨'].map((w, i) => (
              <span key={i} className={`wind-puff wind-puff--${i}`}>{w}</span>
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
