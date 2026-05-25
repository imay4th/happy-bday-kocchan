import { useState, useEffect, useCallback, useRef } from 'react';
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
  // 画面4 BGM 開始タイマー (0.5秒遅延)。idle 遷移時に必要なら cancel する
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
    // 効果音とBGMを事前ロード（ファイル未配置でも継続）
    void sound.loadSound('intro_bgm', SOUNDS.intro_bgm);
    void sound.loadSound('bgm', SOUNDS.bgm);
    void sound.loadSound('blow', SOUNDS.blow);
    void sound.loadSound('fanfare', SOUNDS.fanfare);
    void sound.loadSound('se_pop', SOUNDS.se_pop);
    void sound.loadSound('se_letter', SOUNDS.se_letter);
    void sound.loadSound('se_sparkle', SOUNDS.se_sparkle);
    void sound.loadSound('se_cake', SOUNDS.se_cake);
    void sound.loadSound('se_cracker', SOUNDS.se_cracker);
    void sound.loadSound('se_ding', SOUNDS.se_ding);
    void sound.loadSound('se_swipe', SOUNDS.se_swipe);
    void sound.loadSound('se_halfway', SOUNDS.se_halfway);
  }, [sound]);

  const handlePhaseChange = useCallback(async (next: Phase) => {
    if (next === 'charge') {
      await sound.resume();
      sound.playSound('se_pop', { volume: 0.7 });           // タップ音
      sound.playSound('intro_bgm', { loop: true, volume: 0.3 }); // 画面1-3 ループBGM
    }
    if (next === 'cake') {
      sound.playSound('se_sparkle', { volume: 0.7 });       // 100% 達成キラーン
      setTimeout(() => sound.playSound('se_cake', { volume: 0.8 }), 300); // ケーキ登場
      // intro_bgm は画面3 でも継続再生（停止しない）
    }
    if (next === 'finale') {
      sound.stopSound('intro_bgm');                          // 画面1-3 BGM 停止
      sound.playSound('fanfare', { volume: 0.7 });
      // BGM は 0.5秒遅らせて開始 (ファンファーレが鳴ってからすこし経って入る)
      if (bgmStartTimerRef.current) clearTimeout(bgmStartTimerRef.current);
      bgmStartTimerRef.current = setTimeout(() => {
        sound.playSound('bgm', { loop: true, volume: 0.6 });
        bgmStartTimerRef.current = null;
      }, 500);
    }
    if (next === 'idle') {
      // BGM 開始予定が残っていたらキャンセル
      if (bgmStartTimerRef.current) {
        clearTimeout(bgmStartTimerRef.current);
        bgmStartTimerRef.current = null;
      }
      sound.stopSound('intro_bgm');
      sound.stopSound('blow');
      sound.stopSound('fanfare');
      sound.stopSound('bgm');
      sound.playSound('se_ding', { volume: 0.7 });           // 戻る決定音
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

  // ChargeScreen 用効果音 callbacks
  const handleLetterAppear = useCallback(() => {
    sound.playSound('se_letter', { volume: 0.45 });
  }, [sound]);
  const handleSwipeStart = useCallback(() => {
    sound.playSound('se_swipe', { volume: 0.5 });
  }, [sound]);
  const handleHalfway = useCallback(() => {
    sound.playSound('se_halfway', { volume: 0.7 });
  }, [sound]);

  // FinaleScreen 用効果音 callback
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
                onLetterAppear={handleLetterAppear}
                onSwipeStart={handleSwipeStart}
                onHalfway={handleHalfway}
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
