import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CHARA_NAME, PHOTOS } from '../assets/constants';
import { useSpeed } from '../contexts/SpeedContext';
import './FinaleScreen.css';

interface FinaleScreenProps {
  onPhaseChange: () => void;
  replayCount: number;
  onConfetti?: () => void; // 紙吹雪3波と同期して呼ばれる
}

interface PakuItem {
  id: number;
  y: number;       // 画面縦位置 %
  scale: number;   // サイズ倍率
  duration: number; // 横切る秒数
  distance: number; // 画面横幅 + 余裕分
}

const PHOTO_DATE = '2026.5.26';
const PAKU_GIF = `${import.meta.env.BASE_URL as string}images/talking.gif`;

function fireConfetti(onPop?: () => void): void {
  const colors = ['#FFB6D9', '#C5A3FF', '#B7F0DC', '#A8E1FF', '#FF6FA8', '#FFD93D'];
  const opts = { colors, particleCount: 80, spread: 90, startVelocity: 40 };
  setTimeout(() => { confetti({ ...opts, origin: { x: 0.3, y: 0.6 } }); onPop?.(); }, 0);
  setTimeout(() => { confetti({ ...opts, origin: { x: 0.7, y: 0.6 } }); onPop?.(); }, 500);
  setTimeout(() => { confetti({ ...opts, origin: { x: 0.5, y: 0.3 }, particleCount: 120, spread: 130 }); onPop?.(); }, 1000);
}

export default function FinaleScreen({ onPhaseChange, replayCount, onConfetti }: FinaleScreenProps) {
  const speed = useSpeed();
  const [showButton, setShowButton] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [pakuItems, setPakuItems] = useState<PakuItem[]>([]);
  const firedRef = useRef(false);

  // 初回は pic-06.jpg 固定、再遊からはランダム
  const [selectedPhoto] = useState<string>(() => {
    if (replayCount === 0) {
      const BASE = import.meta.env.BASE_URL as string;
      return `${BASE}photos/pic-06.jpg`;
    }
    return PHOTOS[Math.floor(Math.random() * PHOTOS.length)];
  });

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    fireConfetti(() => onConfetti?.());
    // 紙吹雪を継続発射（Finale が表示されている間ずっと）
    const colors = ['#FFB6D9', '#C5A3FF', '#B7F0DC', '#A8E1FF', '#FF6FA8', '#FFD93D'];
    const interval = setInterval(() => {
      confetti({
        colors,
        particleCount: 50,
        spread: 100,
        startVelocity: 30,
        origin: { x: Math.random(), y: 0 },
        gravity: 0.8,
      });
    }, 1800);
    // 日付ワイプ開始 1800ms
    const dateTimer = setTimeout(() => setShowDate(true), 1800 * speed);
    // 再遊ボタン出現 5200ms
    const btnTimer = setTimeout(() => setShowButton(true), 5200 * speed);
    return () => {
      clearInterval(interval);
      clearTimeout(dateTimer);
      clearTimeout(btnTimer);
    };
  }, [speed, onConfetti]);

  // パクパクGIFを右から左に流す (1秒後に初回、その後 6秒毎)
  // 頻度・密度を下げる方針:
  //   - interval: 3秒 → 6秒
  //   - scale: 0.9-1.7 → 0.7-1.3 (112-208px)
  //   - 同時表示数の上限 3つ
  //   - y 位置はチェキ (画面縦中央 28-72%) を避けて画面上端 3-22% or 下端 75-94% にランダム配置
  useEffect(() => {
    const spawn = () => {
      setPakuItems((prev) => {
        if (prev.length >= 3) return prev; // 同時表示数の上限
        const isTopBand = Math.random() < 0.5;
        const y = isTopBand ? 3 + Math.random() * 19 : 75 + Math.random() * 19;
        return [
          ...prev,
          {
            id: Date.now() + Math.random(),
            y,
            scale: 0.7 + Math.random() * 0.6,
            duration: 5 + Math.random() * 3,
            distance: window.innerWidth + 400,
          },
        ];
      });
    };
    const initialTimer = setTimeout(spawn, 1000);
    const interval = setInterval(spawn, 6000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <motion.div
      className="finale-screen"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', bounce: 0.7, duration: 0.4 * speed }}
    >
      {/* 上下二段アーチ — 独立 motion.svg で同時 spring 出現
          CSS translateX(-50%) は Framer Motion の transform と競合するため、
          x: '-50%' を Framer Motion 側に統合する */}
      <motion.svg
        className="finale-arch"
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid meet"
        aria-label={`HAPPY BIRTHDAY ${CHARA_NAME}!!`}
        initial={{ opacity: 0, scale: 0.5, x: '-50%' }}
        animate={{ opacity: 1, scale: 1, x: '-50%' }}
        transition={{ type: 'spring', bounce: 0.5, duration: 1.0 * speed, delay: 0 }}
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
          {/* 上アーチ — 左右対称 (20+380=400)、頂点 x=200 で中央 */}
          <path id="arch-path-top" d="M 20 140 Q 200 0 380 140" fill="none" />
          {/* 下アーチ — 左右対称 (60+340=400) */}
          <path id="arch-path-bottom" d="M 60 210 Q 200 110 340 210" fill="none" />
        </defs>
        {/* 上アーチ: HAPPY BIRTHDAY */}
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
        {/* 下アーチ: こっちゃん!! */}
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
      </motion.svg>

      {/* チェキ — delay: 0 でアーチと同時 spring 飛び出し */}
      <motion.div
        className="finale-cheki"
        initial={{ opacity: 0, scale: 0, rotate: -10, x: '-50%', y: 'calc(-50% + 60px)' }}
        animate={{ opacity: 1, scale: 1, rotate: -3, x: '-50%', y: '-50%' }}
        transition={{ type: 'spring', bounce: 0.5, duration: 1.0 * speed, delay: 0 }}
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

      {/* 再遊ボタン + 注釈 */}
      <AnimatePresence>
        {showButton && (
          <motion.div
            className="finale-replay-wrap"
            initial={{ opacity: 0, x: '-50%', y: 30 }}
            animate={{ opacity: 1, x: '-50%', y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
          >
            <motion.button
              className="finale-replay-btn"
              onClick={onPhaseChange}
              whileTap={{ scale: 0.92 }}
            >
              もう一度遊ぶ♡
            </motion.button>
            <p className="finale-replay-note">※違う画像が見れるかも！？</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* パクパクGIF を右から左に流す */}
      <AnimatePresence>
        {pakuItems.map((item) => (
          <motion.img
            key={item.id}
            className="finale-paku"
            // src に unique fragment (#id) を付けて iOS Safari の GIF キャッシュ共有問題を回避。
            // 同じ URL の <img> を複数同時表示するとアニメが停止することがあるため
            // フラグメントだけ変えて「別ソース」として独立デコードさせる
            src={`${PAKU_GIF}#${item.id}`}
            alt=""
            style={{
              top: `${item.y}%`,
              width: `${160 * item.scale}px`,
            }}
            initial={{ x: 0 }}
            animate={{ x: -item.distance }}
            transition={{ duration: item.duration, ease: 'linear' }}
            onAnimationComplete={() => {
              setPakuItems((prev) => prev.filter((p) => p.id !== item.id));
            }}
          />
        ))}
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
