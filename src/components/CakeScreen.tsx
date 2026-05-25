import { useState, useRef, useCallback, useEffect } from 'react';
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

  // タップ多重発火と画面遷移の多重発火を防ぐ ref
  const tappedRef = useRef(false);
  const transitionFiredRef = useRef(false);

  // parent の onPhaseChange が再生成されてもタイマーが消えないように ref に保持
  const onPhaseChangeRef = useRef(onPhaseChange);
  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
  }, [onPhaseChange]);

  // 画面4 への遷移を rAF + setTimeout の三重保険で確実に発火
  const fireFinaleTransition = useCallback(() => {
    if (transitionFiredRef.current) return;
    const startTime = performance.now();
    const DURATION_MS = 1600; // ケーキが縮みきるまで
    const trigger = () => {
      if (transitionFiredRef.current) return;
      transitionFiredRef.current = true;
      onPhaseChangeRef.current();
    };
    const rafLoop = () => {
      if (transitionFiredRef.current) return;
      if (performance.now() - startTime >= DURATION_MS) {
        trigger();
      } else {
        requestAnimationFrame(rafLoop);
      }
    };
    requestAnimationFrame(rafLoop);
    // 保険: rAF が止まる場合に備えた setTimeout (duration + 300ms)
    setTimeout(trigger, DURATION_MS + 300);
  }, []);

  const handleTap = useCallback(() => {
    if (tappedRef.current || !flameVisible || isPreparing) return;
    tappedRef.current = true;
    setFlameVisible(false);
    setWindVisible(true);
    setCandleTilted(true);
    onBlow();
    // 風が吹き終わる (固定 1200ms、speed の影響を受けない)
    setTimeout(() => setWindVisible(false), 1200);
    // 火消し後 600ms でタメ開始
    setTimeout(() => setIsPreparing(true), 600);
    // 画面4 遷移
    fireFinaleTransition();
  }, [flameVisible, isPreparing, onBlow, fireFinaleTransition]);

  void speed; // タップ後の演出は speed の影響を受けず固定タイミングで発火させる

  return (
    <motion.div
      className="cake-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ cursor: flameVisible ? 'pointer' : 'default' }}
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
            scale: isPreparing ? 0 : 1,
          }}
          transition={
            isPreparing
              ? { duration: 1.0, ease: 'easeIn' }
              : { type: 'spring', bounce: 0.45, duration: 1.4 }
          }
        >
          {/* ゆめかわ3層ケーキSVG */}
          <svg
            className="cake-svg"
            viewBox="0 0 200 240"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="cake-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ===== 下層 ===== */}
            {/* 下層台座 ピンク */}
            <rect x="10" y="180" width="180" height="50" rx="12" fill="#FFB6D9" stroke="#FF6FA8" strokeWidth="2.5" />
            {/* 下層上端クリームドリップ */}
            <path
              d="M10 190 Q20 178 30 190 Q40 200 50 190 Q60 178 70 190 Q80 200 90 190 Q100 178 110 190 Q120 200 130 190 Q140 178 150 190 Q160 200 170 190 Q180 178 190 190"
              fill="white" stroke="none" opacity="0.85"
            />
            {/* 下層水玉 */}
            <circle cx="40" cy="205" r="3" fill="white" opacity="0.6" />
            <circle cx="75" cy="210" r="3" fill="white" opacity="0.5" />
            <circle cx="110" cy="205" r="3" fill="white" opacity="0.6" />
            <circle cx="145" cy="210" r="3" fill="white" opacity="0.5" />
            <circle cx="170" cy="203" r="3" fill="white" opacity="0.55" />
            <circle cx="28" cy="215" r="2.5" fill="white" opacity="0.4" />
            <circle cx="160" cy="215" r="2.5" fill="white" opacity="0.4" />

            {/* ===== 中層 ===== */}
            {/* 中層台座 ラベンダー */}
            <rect x="25" y="140" width="150" height="45" rx="10" fill="#C5A3FF" stroke="#A07AFF" strokeWidth="2" />
            {/* 中層ピンクリボン横巻き */}
            <rect x="25" y="158" width="150" height="10" fill="#FF9EC8" opacity="0.7" rx="3" />
            {/* 中層上端クリームドリップ */}
            <path
              d="M25 152 Q35 140 45 152 Q55 162 65 152 Q75 140 85 152 Q95 162 105 152 Q115 140 125 152 Q135 162 145 152 Q155 140 165 152 Q170 158 175 152"
              fill="white" stroke="none" opacity="0.85"
            />
            {/* 中層水玉 */}
            <circle cx="50" cy="165" r="2.5" fill="white" opacity="0.55" />
            <circle cx="100" cy="170" r="2.5" fill="white" opacity="0.5" />
            <circle cx="145" cy="165" r="2.5" fill="white" opacity="0.55" />

            {/* ===== 上層 ===== */}
            {/* 上層台座 クリーム色 */}
            <rect x="40" y="100" width="120" height="45" rx="10" fill="#FFF8E7" stroke="#F0D080" strokeWidth="2" />
            {/* 上層上端ホイップクリーム（雲形） */}
            <path
              d="M40 112 Q50 98 62 110 Q72 100 84 110 Q94 98 106 110 Q116 100 128 110 Q138 98 150 110 Q158 104 160 112"
              fill="white" stroke="none" opacity="0.9"
            />
            {/* 上層水玉 */}
            <circle cx="60" cy="122" r="2.5" fill="white" opacity="0.6" />
            <circle cx="100" cy="128" r="2.5" fill="white" opacity="0.5" />
            <circle cx="140" cy="122" r="2.5" fill="white" opacity="0.6" />

            {/* ===== トッピング（上層の上） ===== */}
            {/* 苺 3つ */}
            <circle cx="60" cy="95" r="6" fill="#FF4466" />
            <circle cx="60" cy="95" r="3.5" fill="#FF7799" />
            <circle cx="100" cy="92" r="7" fill="#FF4466" />
            <circle cx="100" cy="92" r="4" fill="#FF7799" />
            <circle cx="140" cy="95" r="6" fill="#FF4466" />
            <circle cx="140" cy="95" r="3.5" fill="#FF7799" />
            {/* チェリー */}
            <circle cx="75" cy="94" r="5" fill="#CC1133" />
            <line x1="75" y1="89" x2="78" y2="82" stroke="#44AA44" strokeWidth="1.5" strokeLinecap="round" />
            {/* ハート */}
            <text x="125" y="98" textAnchor="middle" fontSize="14" fill="#FF6FA8">♡</text>

            {/* ===== ろうそく「2」と「7」 ===== */}
            {/* ろうそく「2」 */}
            <motion.text
              x="80"
              y="98"
              textAnchor="middle"
              fontSize="50"
              fontWeight="900"
              fill="#FFF176"
              stroke="#F9C300"
              strokeWidth="2"
              fontFamily="'Mochiy Pop One', sans-serif"
              animate={candleTilted ? { rotate: [0, 6, 0] } : { rotate: 0 }}
              transition={candleTilted ? { duration: 1.0, ease: 'easeInOut' } : {}}
              style={{ transformOrigin: '80px 98px' }}
            >2</motion.text>

            {/* ろうそく「7」 */}
            <motion.text
              x="120"
              y="98"
              textAnchor="middle"
              fontSize="50"
              fontWeight="900"
              fill="#FFF176"
              stroke="#F9C300"
              strokeWidth="2"
              fontFamily="'Mochiy Pop One', sans-serif"
              animate={candleTilted ? { rotate: [0, 6, 0] } : { rotate: 0 }}
              transition={candleTilted ? { duration: 1.0, ease: 'easeInOut', delay: 0.1 } : {}}
              style={{ transformOrigin: '120px 98px' }}
            >7</motion.text>

            {/* ===== 炎グループ ===== */}
            <AnimatePresence>
              {flameVisible && (
                <>
                  {/* 炎「2」用 */}
                  <motion.g
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.3, x: 25, rotate: 40 }}
                    transition={{ duration: 0.6 }}
                    style={{ transformOrigin: '80px 45px' }}
                  >
                    <motion.path
                      d="M80 18 C88 30 95 38 92 50 C90 58 84 61 80 61 C76 61 70 58 68 50 C65 38 72 30 80 18 Z"
                      fill="#FF8C00"
                      className="flame-outer"
                    />
                    <motion.path
                      d="M80 26 C85 34 89 42 87 50 C85 56 82 58 80 58 C78 58 75 56 73 50 C71 42 75 34 80 26 Z"
                      fill="#FFD600"
                      className="flame-inner"
                    />
                    <motion.ellipse
                      cx="80"
                      cy="53"
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
                    style={{ transformOrigin: '120px 45px' }}
                  >
                    <motion.path
                      d="M120 18 C128 30 135 38 132 50 C130 58 124 61 120 61 C116 61 110 58 108 50 C105 38 112 30 120 18 Z"
                      fill="#FF8C00"
                      className="flame-outer"
                    />
                    <motion.path
                      d="M120 26 C125 34 129 42 127 50 C125 56 122 58 120 58 C118 58 115 56 113 50 C111 42 115 34 120 26 Z"
                      fill="#FFD600"
                      className="flame-inner"
                    />
                    <motion.ellipse
                      cx="120"
                      cy="53"
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
                <line x1="80" y1="58" x2="80" y2="51" stroke="#555" strokeWidth="2" strokeLinecap="round" />
                <line x1="120" y1="58" x2="120" y2="51" stroke="#555" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
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

      {/* 風エフェクト */}
      <AnimatePresence>
        {windVisible && (
          <motion.div
            className="wind-effect"
            initial={{ opacity: 1, x: '-20%' }}
            animate={{ opacity: 0, x: '120%' }}
            exit={{}}
            transition={{ duration: 1.2 * speed, ease: 'easeOut' }}
          >
            <div className="wind-cloud" />
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

      {/* タップ受信用のネイティブ button オーバーレイ (画面全体を覆う)
          iOS Safari の motion.div の transition 中の透明要素クリック失敗を回避するため
          native button を最前面に置いて確実にタップを取る (3経路で受信) */}
      {flameVisible && !isPreparing && (
        <button
          type="button"
          className="cake-tap-target"
          onClick={handleTap}
          onTouchEnd={(e) => { e.preventDefault(); handleTap(); }}
          onPointerDown={handleTap}
          aria-label="ろうそくを吹き消す"
        />
      )}
    </motion.div>
  );
}
