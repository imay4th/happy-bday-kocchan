import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CHARA_NAME, PHOTOS } from '../assets/constants';
import './FinaleScreen.css';

interface FinaleScreenProps {
  onPhaseChange: () => void;
}

interface PhotoCard {
  id: number;
  src: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function fireConfetti() {
  const colors = ['#FFB6D9', '#C5A3FF', '#B7F0DC', '#A8E1FF', '#FF6FA8'];
  const opts = { colors, particleCount: 80, spread: 90, startVelocity: 40 };

  setTimeout(() => confetti({ ...opts, origin: { x: 0.3, y: 0.6 } }), 0);
  setTimeout(() => confetti({ ...opts, origin: { x: 0.7, y: 0.6 }, particleCount: 80 }), 500);
  setTimeout(() => confetti({ ...opts, origin: { x: 0.5, y: 0.3 }, particleCount: 100, spread: 120 }), 1000);
}

export default function FinaleScreen({ onPhaseChange }: FinaleScreenProps) {
  const [photos, setPhotos] = useState<PhotoCard[]>([]);
  const [showButton, setShowButton] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    // 紙吹雪
    fireConfetti();

    // 写真を順次出現
    PHOTOS.forEach((src, i) => {
      setTimeout(() => {
        setPhotos((prev) => [
          ...prev,
          {
            id: i,
            src,
            x: randomBetween(5, 75),
            y: randomBetween(10, 70),
            rotate: randomBetween(-30, 30),
            scale: randomBetween(0.85, 1.15),
          },
        ]);
      }, i * 200);
    });

    // もう一度ボタン
    setTimeout(() => setShowButton(true), 3500);
  }, []);

  return (
    <motion.div
      className="finale-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 写真 */}
      <AnimatePresence>
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            className="finale-photo"
            style={{
              left: `${photo.x}%`,
              top: `${photo.y}%`,
              rotate: photo.rotate,
              scale: photo.scale,
            }}
            initial={{ opacity: 0, scale: 0, rotate: photo.rotate - 20 }}
            animate={{ opacity: 1, scale: photo.scale, rotate: photo.rotate }}
            exit={{ opacity: 0, x: photo.x > 50 ? 300 : -300, transition: { duration: 0.5 } }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
          >
            <img src={photo.src} alt="" className="finale-photo-img" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* メッセージ */}
      <div className="finale-message-wrap">
        <motion.div
          className="finale-message"
          initial={{ y: 120, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.6, duration: 1.2 }}
        >
          <h1 className="finale-title-en">HAPPY BIRTHDAY</h1>
          <h2 className="finale-title-ja">{CHARA_NAME}!!</h2>
        </motion.div>

        {/* 再遊ボタン */}
        <AnimatePresence>
          {showButton && (
            <motion.button
              className="finale-replay-btn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              onClick={onPhaseChange}
              whileTap={{ scale: 0.92 }}
            >
              もう一度遊ぶ♡
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 背景デコ */}
      <div className="finale-bg-deco" aria-hidden="true">
        {['✨', '♡', '✦', '✨', '♡', '✦', '✨', '♡'].map((s, i) => (
          <span key={i} className={`finale-deco finale-deco--${i}`}>{s}</span>
        ))}
      </div>
    </motion.div>
  );
}
