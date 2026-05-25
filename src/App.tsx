import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSoundEffect } from './hooks/useSoundEffect';
import { SOUNDS } from './assets/constants';
import CakeScreen from './components/CakeScreen';
import FinaleScreen from './components/FinaleScreen';
import DebugPanel from './components/DebugPanel';
import { SpeedContext } from './contexts/SpeedContext';
import './App.css';

// 画面1 (Idle) / 画面2 (Charge) は iOS Safari のタップ/100%判定不具合を
// 物理回避するため廃止。アプリ起動直後にケーキ画面 (旧画面3) から開始する。
type Phase = 'cake' | 'finale';

// 採用する音:
//   - se_cracker: 画面4 の紙吹雪クラッカー音
//   - bgm:        画面4 バースデーソング BGM (1秒遅延ループ)

function App() {
  const [phase, setPhase] = useState<Phase>('cake');
  const [replayCount, setReplayCount] = useState(0);
  const sound = useSoundEffect();
  // 画面4 BGM 開始タイマー (1秒遅延)。「もう一度遊ぶ」でキャンセルする
  const bgmStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [speed, setSpeed] = useState<number>(() => {
    const saved = localStorage.getItem('debug_speed');
    return saved !== null ? parseFloat(saved) : 1.5;
  });

  const [isDebug] = useState<boolean>(
    () => new URLSearchParams(window.location.search).get('debug') === '1'
  );

  useEffect(() => {
    localStorage.setItem('debug_speed', String(speed));
  }, [speed]);

  useEffect(() => {
    // 採用音だけプリロード
    void sound.loadSound('se_cracker', SOUNDS.se_cracker);
    void sound.loadSound('bgm', SOUNDS.bgm);
  }, [sound]);

  const handlePhaseChange = useCallback(async (next: Phase) => {
    if (next === 'finale') {
      // 画面4 バースデーソング BGM を 1秒遅らせて開始
      if (bgmStartTimerRef.current) clearTimeout(bgmStartTimerRef.current);
      bgmStartTimerRef.current = setTimeout(() => {
        sound.playSound('bgm', { loop: true, volume: 0.6 });
        bgmStartTimerRef.current = null;
      }, 1000);
    }
    setPhase(next);
  }, [sound]);

  // 「もう一度遊ぶ」: BGM 停止 + replayCount++ で CakeScreen を再マウント
  const handleReplay = useCallback(() => {
    if (bgmStartTimerRef.current) {
      clearTimeout(bgmStartTimerRef.current);
      bgmStartTimerRef.current = null;
    }
    sound.stopSound('bgm');
    setReplayCount((c) => c + 1);
    setPhase('cake');
  }, [sound]);

  const handleFinale = useCallback(() => {
    void handlePhaseChange('finale');
  }, [handlePhaseChange]);

  // CakeScreen のケーキタップ時に AudioContext.resume() を呼ぶ
  // (ユーザーの最初の user gesture なのでこれ以降の音声再生が許可される)
  const handleBlow = useCallback(() => {
    void sound.resume();
  }, [sound]);

  // FinaleScreen 用クラッカー音 (紙吹雪3波と同期)
  const handleConfetti = useCallback(() => {
    sound.playSound('se_cracker', { volume: 0.6 });
  }, [sound]);

  return (
    <SpeedContext.Provider value={speed}>
      <div className="app">
        <AnimatePresence mode="wait">
          {phase === 'cake' && (
            <div key={`cake-${replayCount}`} className="phase-container">
              <CakeScreen onPhaseChange={handleFinale} onBlow={handleBlow} />
            </div>
          )}
          {phase === 'finale' && (
            <div key="finale" className="phase-container">
              <FinaleScreen
                onPhaseChange={handleReplay}
                replayCount={replayCount}
                onConfetti={handleConfetti}
              />
            </div>
          )}
        </AnimatePresence>
        {isDebug && <DebugPanel speed={speed} onSpeedChange={setSpeed} />}
      </div>
    </SpeedContext.Provider>
  );
}

export default App;
