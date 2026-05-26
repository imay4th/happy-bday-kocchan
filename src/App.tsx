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

// 完全版 4 画面構成。iOS Safari 対策 (warmup pattern / 3経路イベント / button overlay /
// onPhaseChangeRef / 同期即時遷移) は各コンポーネント側で実装済み
type Phase = 'idle' | 'charge' | 'cake' | 'finale';

// 採用音 (画面1-2 用): intro_bgm / se_pop / se_letter / se_sparkle / se_swipe / se_halfway / se_charge_loop
//        (画面4 用): se_cracker / bgm

function App() {
  const [phase, setPhase] = useState<Phase>('idle');
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
    // 画面1-3 用
    void sound.loadSound('intro_bgm', SOUNDS.intro_bgm);
    void sound.loadSound('se_pop', SOUNDS.se_pop);
    void sound.loadSound('se_letter', SOUNDS.se_letter);
    void sound.loadSound('se_sparkle', SOUNDS.se_sparkle);
    void sound.loadSound('se_swipe', SOUNDS.se_swipe);
    void sound.loadSound('se_halfway', SOUNDS.se_halfway);
    void sound.loadSound('se_charge_loop', SOUNDS.se_charge_loop);
    // 画面4 用 (既存)
    void sound.loadSound('se_cracker', SOUNDS.se_cracker);
    void sound.loadSound('bgm', SOUNDS.bgm);
  }, [sound]);

  // 画面1 (Idle) タップ時: iOS Safari の AudioContext を user-gesture 同期で起こす
  // warmup pattern (1サンプル無音バッファ即時再生) で初回の intro_bgm 無音化を防ぐ
  const handleIdle = useCallback(() => {
    sound.warmup();          // 同期: AudioContext 物理アクティブ化 (最重要)
    void sound.resume();      // 非同期 resume も並行で
    sound.playSound('se_pop', { volume: 0.6 });
    sound.playSound('intro_bgm', { loop: true, volume: 0.45 });
    setPhase('charge');
  }, [sound]);

  // 画面2 (Charge) 100% 到達時: intro_bgm 停止 + se_sparkle + cake 遷移
  const handleCharge = useCallback(() => {
    sound.stopSound('intro_bgm');
    sound.playSound('se_sparkle', { volume: 0.7 });
    setPhase('cake');
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

  // 「もう一度遊ぶ」: BGM 停止 + replayCount++ で idle 画面から再スタート
  const handleReplay = useCallback(() => {
    if (bgmStartTimerRef.current) {
      clearTimeout(bgmStartTimerRef.current);
      bgmStartTimerRef.current = null;
    }
    sound.stopSound('bgm');
    sound.stopSound('intro_bgm');
    sound.stopSound('se_charge_loop');
    setReplayCount((c) => c + 1);
    setPhase('idle');
  }, [sound]);

  const handleFinale = useCallback(() => {
    void handlePhaseChange('finale');
  }, [handlePhaseChange]);

  // CakeScreen のケーキタップ時 (= ユーザーの最初の user gesture) に
  // AudioContext を物理的にアクティブ化する。
  // iOS Safari は resume() の Promise 解決前 / 解決後の初回 playSound が
  // 無音化されることがあるため、warmup (1サンプル無音バッファ即時再生) で
  // 確実に AudioContext を起こす。
  const handleBlow = useCallback(() => {
    sound.warmup(); // 同期 user-gesture 内で AudioContext を起こす (最重要)
    void sound.resume(); // 念のため非同期 resume も並行で
  }, [sound]);

  // FinaleScreen 用クラッカー音 (紙吹雪3波と同期)
  const handleConfetti = useCallback(() => {
    sound.playSound('se_cracker', { volume: 0.6 });
  }, [sound]);

  // ChargeScreen サブ handler 4 種
  const handleLetterAppear = useCallback(() => {
    sound.playSound('se_letter', { volume: 0.5 });
  }, [sound]);

  const handleSwipeStart = useCallback(() => {
    sound.playSound('se_swipe', { volume: 0.5 });
  }, [sound]);

  const handleSwipeActive = useCallback((active: boolean) => {
    if (active) {
      sound.playSound('se_charge_loop', { loop: true, volume: 0.4 });
    } else {
      sound.stopSound('se_charge_loop');
    }
  }, [sound]);

  const handleHalfway = useCallback(() => {
    sound.playSound('se_halfway', { volume: 0.6 });
  }, [sound]);

  return (
    <SpeedContext.Provider value={speed}>
      <div className="app">
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <div key="idle" className="phase-container">
              <IdleScreen onPhaseChange={handleIdle} />
            </div>
          )}
          {phase === 'charge' && (
            <div key="charge" className="phase-container">
              <ChargeScreen
                onPhaseChange={handleCharge}
                onLetterAppear={handleLetterAppear}
                onSwipeStart={handleSwipeStart}
                onSwipeActive={handleSwipeActive}
                onHalfway={handleHalfway}
              />
            </div>
          )}
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
