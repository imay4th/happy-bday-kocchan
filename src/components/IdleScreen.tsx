import { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import './IdleScreen.css';

interface IdleScreenProps {
  onPhaseChange: () => void;
}

const SPARKLES = ['✨', '♡', '✦', '✨', '♡', '✦', '✨', '♡', '✦', '✨', '♡', '✦'];

export default function IdleScreen({ onPhaseChange }: IdleScreenProps) {
  // iOS Safari の取りこぼしを避けるため pointer/click/touch 3経路で受け、ref でガード
  const tappedRef = useRef(false);
  const handleTap = useCallback(() => {
    if (tappedRef.current) return;
    tappedRef.current = true;
    onPhaseChange();
  }, [onPhaseChange]);

  return (
    <motion.div
      className="idle-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.4 }}
    >
      {/* 背景デコレーション */}
      <div className="idle-bg-deco" aria-hidden="true">
        {SPARKLES.map((s, i) => (
          <span key={i} className={`idle-sparkle idle-sparkle--${i}`}>{s}</span>
        ))}
      </div>

      {/* メインコンテンツ */}
      <div className="idle-center">
        <motion.h1
          className="idle-title"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
        >
          画面をタップ<br />してね✨
        </motion.h1>
      </div>

      {/* ハートデコ */}
      <div className="idle-hearts" aria-hidden="true">
        {['♡', '♡', '♡', '♡', '♡'].map((h, i) => (
          <span key={i} className={`idle-heart idle-heart--${i}`}>{h}</span>
        ))}
      </div>

      {/* タップ受信用のネイティブ button オーバーレイ (画面全体を覆う)
          motion.div の transition 中の透明要素クリック失敗を回避するため
          native button を最前面に置いて確実にタップを取る */}
      <button
        type="button"
        className="idle-tap-target"
        onClick={handleTap}
        onTouchEnd={(e) => { e.preventDefault(); handleTap(); }}
        onPointerDown={handleTap}
        aria-label="タップして開始"
      />
    </motion.div>
  );
}
