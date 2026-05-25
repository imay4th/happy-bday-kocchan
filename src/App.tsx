import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSoundEffect } from './hooks/useSoundEffect';
import { SOUNDS } from './assets/constants';
import IdleScreen from './components/IdleScreen';
import ChargeScreen from './components/ChargeScreen';
import CakeScreen from './components/CakeScreen';
import FinaleScreen from './components/FinaleScreen';
import DebugPanel from './components/DebugPanel';
import { SpeedContext } from './contexts/SpeedContext';
import './App.css';

type Phase = 'idle' | 'charge' | 'cake' | 'finale';

// 採用する音は次の3つだけ:
//   - se_pop:     画面1→2 遷移時のチュピッ
//   - se_sparkle: 画面2→3 遷移時のシャララらーん (100% 達成)
//   - se_cracker: 画面4 の紙吹雪クラッカー音
// 他の効果音と BGM は配置済みだがロード/再生しない (うるさいので保留)。

function App() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [replayCount, setReplayCount] = useState(0);
  const sound = useSoundEffect();

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
    // 採用4音だけプリロード (他は配置済みだが使用しない)
    void sound.loadSound('se_pop', SOUNDS.se_pop);
    void sound.loadSound('se_sparkle', SOUNDS.se_sparkle);
    void sound.loadSound('se_cracker', SOUNDS.se_cracker);
    void sound.loadSound('se_charge_loop', SOUNDS.se_charge_loop);
  }, [sound]);

  const handlePhaseChange = useCallback(async (next: Phase) => {
    if (next === 'charge') {
      await sound.resume();
      sound.playSound('se_pop', { volume: 0.7 }); // 画面1→2 チュピッ
    }
    if (next === 'cake') {
      sound.playSound('se_sparkle', { volume: 0.7 }); // 画面2→3 シャララらーん
    }
    // finale / idle 遷移時の音は無し
    setPhase(next);
  }, [sound]);

  const handleIdle = useCallback(() => {
    setReplayCount((c) => c + 1);
    void handlePhaseChange('idle');
  }, [handlePhaseChange]);

  const handleCharge = useCallback(() => {
    void handlePhaseChange('charge');
  }, [handlePhaseChange]);

  const handleCake = useCallback(() => {
    void handlePhaseChange('cake');
  }, [handlePhaseChange]);

  const handleFinale = useCallback(() => {
    void handlePhaseChange('finale');
  }, [handlePhaseChange]);

  // CakeScreen の onBlow は仕様で必須なので空関数を渡す (吹き消し音は無し)
  const handleBlow = useCallback(() => { /* 吹き消し音は無し */ }, []);

  // ハート (スワイプ中) チャージループ音: 指を画面に置いている間ループ、離したら停止
  const handleSwipeActive = useCallback((active: boolean) => {
    if (active) {
      sound.playSound('se_charge_loop', { loop: true, volume: 0.35 });
    } else {
      sound.stopSound('se_charge_loop');
    }
  }, [sound]);

  // FinaleScreen 用クラッカー音 (紙吹雪3波と同期)
  const handleConfetti = useCallback(() => {
    sound.playSound('se_cracker', { volume: 0.6 });
  }, [sound]);

  return (
    <SpeedContext.Provider value={speed}>
      <div className="app">
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <div key="idle" className="phase-container">
              <IdleScreen onPhaseChange={handleCharge} />
            </div>
          )}
          {phase === 'charge' && (
            <div key="charge" className="phase-container">
              <ChargeScreen
                onPhaseChange={handleCake}
                onSwipeActive={handleSwipeActive}
              />
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
                onPhaseChange={handleIdle}
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
