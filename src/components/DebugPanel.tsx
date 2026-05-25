import './DebugPanel.css';

interface DebugPanelProps {
  speed: number;
  onSpeedChange: (s: number) => void;
}

const MIN_SPEED = 0.25;
const MAX_SPEED = 3.0;
const STEP = 0.25;
const DEFAULT_SPEED = 1.5;

export default function DebugPanel({ speed, onSpeedChange }: DebugPanelProps) {
  const handleMinus = () => {
    onSpeedChange(Math.max(MIN_SPEED, Math.round((speed - STEP) * 100) / 100));
  };

  const handlePlus = () => {
    onSpeedChange(Math.min(MAX_SPEED, Math.round((speed + STEP) * 100) / 100));
  };

  const handleReset = () => {
    onSpeedChange(DEFAULT_SPEED);
  };

  return (
    <div className="debug-panel" style={{ touchAction: 'manipulation' }}>
      <button onClick={handleMinus} aria-label="速度を下げる" style={{ touchAction: 'manipulation' }}>
        −
      </button>
      <span className="debug-panel__label">⚡ {speed.toFixed(2)}x</span>
      <button onClick={handlePlus} aria-label="速度を上げる" style={{ touchAction: 'manipulation' }}>
        +
      </button>
      <button onClick={handleReset} aria-label="速度をリセット" style={{ touchAction: 'manipulation' }}>
        ↺
      </button>
    </div>
  );
}
