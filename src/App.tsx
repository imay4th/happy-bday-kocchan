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
    // 効果音を事前ロード（ファイル未配置でも継続）
    void sound.loadSound('charge', SOUNDS.charge);
    void sound.loadSound('blow', SOUNDS.blow);
    void sound.loadSound('fanfare', SOUNDS.fanfare);
  }, [sound]);

  const handlePhaseChange = useCallback(async (next: Phase) => {
    if (next === 'charge') {
      await sound.resume();
      sound.playSound('charge', { loop: true, volume: 0.5 });
    }
    if (next === 'cake') {
      sound.stopSound('charge');
    }
    if (next === 'finale') {
      sound.playSound('fanfare', { volume: 0.8 });
    }
    if (next === 'idle') {
      sound.stopSound('charge');
      sound.stopSound('blow');
      sound.stopSound('fanfare');
    }
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

  const handleBlow = useCallback(() => {
    sound.playSound('blow', { volume: 0.8 });
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
              <FinaleScreen onPhaseChange={handleIdle} replayCount={replayCount} />
            </div>
          )}
        </AnimatePresence>
        {isDebug && <DebugPanel speed={speed} onSpeedChange={setSpeed} />}
      </div>
    </SpeedContext.Provider>
  );
}

export default App;
