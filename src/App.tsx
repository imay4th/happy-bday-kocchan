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

// 採用音:
//   - se_pop:     画面1 タップ時「チュピッ」
//   - se_sparkle: 画面2 ゲージ MAX 到達時「ふぁーん」
//   - se_cracker: 画面4 の紙吹雪クラッカー音
//   - bgm:        画面4 バースデーソング BGM (1秒遅延ループ)

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
    void sound.loadSound('se_pop', SOUNDS.se_pop);         // 画面1 タップ
    void sound.loadSound('se_sparkle', SOUNDS.se_sparkle); // 画面2 MAX 到達
    void sound.loadSound('se_cracker', SOUNDS.se_cracker); // 画面4 紙吹雪
    void sound.loadSound('bgm', SOUNDS.bgm);               // 画面4 バースデーソング
  }, [sound]);

  // 画面1 (Idle) タップ時: iOS Safari の AudioContext を user-gesture 同期で起こす
  // warmup → se_pop「チュピッ」→ charge 遷移
  const handleIdle = useCallback(() => {
    sound.warmup();          // 同期: AudioContext 物理アクティブ化 (最重要)
    void sound.resume();      // 非同期 resume も並行で
    sound.playSound('se_pop', { volume: 0.6 });
    setPhase('charge');
  }, [sound]);

  // 画面2 (Charge) 100% 到達時: se_sparkle「ふぁーん」→ cake 遷移
  const handleCharge = useCallback(() => {
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
              <ChargeScreen onPhaseChange={handleCharge} />
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
