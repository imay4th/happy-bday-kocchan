import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSoundEffect } from './hooks/useSoundEffect';
import { SOUNDS } from './assets/constants';
import ChargeScreen from './components/ChargeScreen';
import CakeScreen from './components/CakeScreen';
import FinaleScreen from './components/FinaleScreen';
import DebugPanel from './components/DebugPanel';
import { SpeedContext } from './contexts/SpeedContext';
import './App.css';

// 画面1 (Idle) は iOS Safari のタップ取りこぼし問題を物理回避するため廃止。
// アプリ起動直後にハートチャージ画面 (画面2) から開始する。
type Phase = 'charge' | 'cake' | 'finale';

// 採用する音:
//   - se_sparkle: 画面2→3 遷移時のシャララらーん (100% 達成)
//   - se_cracker: 画面4 の紙吹雪クラッカー音
//   - bgm:        画面4 バースデーソング BGM (1秒遅延ループ)

function App() {
  const [phase, setPhase] = useState<Phase>('charge');
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
    void sound.loadSound('se_sparkle', SOUNDS.se_sparkle);
    void sound.loadSound('se_cracker', SOUNDS.se_cracker);
    void sound.loadSound('bgm', SOUNDS.bgm);
  }, [sound]);

  const handlePhaseChange = useCallback(async (next: Phase) => {
    if (next === 'cake') {
      // ユーザーのスワイプ (= 最初の user gesture) 直後に呼ばれるため、
      // ここで AudioContext.resume() しておくと以降の音声再生が許可される
      await sound.resume();
      sound.playSound('se_sparkle', { volume: 0.7 }); // 画面2→3 シャララらーん
    }
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

  // 「もう一度遊ぶ」: BGM 停止 + replayCount++ で ChargeScreen を再マウント
  const handleReplay = useCallback(() => {
    if (bgmStartTimerRef.current) {
      clearTimeout(bgmStartTimerRef.current);
      bgmStartTimerRef.current = null;
    }
    sound.stopSound('bgm');
    setReplayCount((c) => c + 1);
    setPhase('charge');
  }, [sound]);

  const handleCake = useCallback(() => {
    void handlePhaseChange('cake');
  }, [handlePhaseChange]);

  const handleFinale = useCallback(() => {
    void handlePhaseChange('finale');
  }, [handlePhaseChange]);

  // CakeScreen の onBlow は仕様で必須なので空関数を渡す (吹き消し音は無し)
  const handleBlow = useCallback(() => { /* 吹き消し音は無し */ }, []);

  // FinaleScreen 用クラッカー音 (紙吹雪3波と同期)
  const handleConfetti = useCallback(() => {
    sound.playSound('se_cracker', { volume: 0.6 });
  }, [sound]);

  return (
    <SpeedContext.Provider value={speed}>
      <div className="app">
        <AnimatePresence mode="wait">
          {phase === 'charge' && (
            <div key={`charge-${replayCount}`} className="phase-container">
              <ChargeScreen onPhaseChange={handleCake} />
            </div>
          )}
          {phase === 'cake' && (
            <div key="cake" className="phase-container">
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
