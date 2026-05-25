import { motion } from 'framer-motion';
import './IdleScreen.css';

interface IdleScreenProps {
  onPhaseChange: () => void;
}

const SPARKLES = ['✨', '♡', '✦', '✨', '♡', '✦', '✨', '♡', '✦', '✨', '♡', '✦'];

export default function IdleScreen({ onPhaseChange }: IdleScreenProps) {
  return (
    <motion.div
      className="idle-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.4 }}
      onPointerDown={() => onPhaseChange()}
    >
      {/* 背景デコレーション */}
      <div className="idle-bg-deco" aria-hidden="true">
        {SPARKLES.map((s, i) => (
          <span key={i} className={`idle-sparkle idle-sparkle--${i}`}>{s}</span>
        ))}
      </div>

      {/* メインコンテンツ */}
      <div className="idle-center">
        <motion.div
          className="idle-finger"
          animate={{ y: [-8, 8, -8] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          👆
        </motion.div>

        <motion.h1
          className="idle-title"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
        >
          画面を<br />スワイプ✨
        </motion.h1>

        <motion.div
          className="idle-finger idle-finger--bottom"
          animate={{ y: [8, -8, 8] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          👆
        </motion.div>
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
