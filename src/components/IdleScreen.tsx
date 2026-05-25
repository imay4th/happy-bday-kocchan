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
      onPointerDown={handleTap}
      onClick={handleTap}
      onTouchEnd={handleTap}
      // iOS Safari の transition 中の完全透明要素はクリックを拾わないことがあるため
      // pointer-events: auto を明示し、touchAction: manipulation で 300ms 遅延も回避
      style={{ pointerEvents: 'auto', touchAction: 'manipulation', cursor: 'pointer' }}
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
    </motion.div>
  );
}
