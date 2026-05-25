import { useState, useRef, useCallback, useEffect } from 'react';
import { SWIPE_MAX_DISTANCE } from '../assets/constants';

interface SwipeChargeOptions {
  maxDistance?: number;
  decayRate?: number;
  idleDelay?: number;
  onComplete?: () => void; // 100% 到達時に1度だけ呼ばれる
}

interface SwipeChargeResult {
  chargeAmount: number; // 0..1
  bindHandlers: {
    onPointerDown: React.PointerEventHandler;
    onPointerMove: React.PointerEventHandler;
    onPointerUp: React.PointerEventHandler;
    onPointerCancel: React.PointerEventHandler;
    onPointerLeave: React.PointerEventHandler;
  };
}

export function useSwipeCharge(opts: SwipeChargeOptions = {}): SwipeChargeResult {
  const maxDistance = opts.maxDistance ?? SWIPE_MAX_DISTANCE;
  const decayRate = opts.decayRate ?? 600; // px/秒
  const idleDelay = opts.idleDelay ?? 200; // ms

  const [chargeAmount, setChargeAmount] = useState(0);

  const accumulatedRef = useRef(0);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDownRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const decayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 100% 到達を内部で追跡（以降の減衰防止・コールバック1回限り保証）
  const completedInternalRef = useRef(false);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const clearDecayInterval = useCallback(() => {
    if (decayIntervalRef.current !== null) {
      clearInterval(decayIntervalRef.current);
      decayIntervalRef.current = null;
    }
  }, []);

  const startDecay = useCallback(() => {
    // 100% 到達後は減衰しない（保険）
    if (completedInternalRef.current) return;
    clearDecayInterval();
    const TICK_MS = 50;
    decayIntervalRef.current = setInterval(() => {
      // インターバル内でも完了済みなら即停止
      if (completedInternalRef.current) {
        clearInterval(decayIntervalRef.current!);
        decayIntervalRef.current = null;
        return;
      }
      accumulatedRef.current = Math.max(
        maxDistance * 0.05,
        accumulatedRef.current - (decayRate * TICK_MS) / 1000,
      );
      setChargeAmount(accumulatedRef.current / maxDistance);
    }, TICK_MS);
  }, [clearDecayInterval, decayRate, maxDistance]);

  const resetIdleTimer = useCallback(() => {
    // 100% 到達後はアイドルタイマー・減衰を開始しない
    if (completedInternalRef.current) return;
    clearIdleTimer();
    clearDecayInterval();
    idleTimerRef.current = setTimeout(() => {
      startDecay();
    }, idleDelay);
  }, [clearIdleTimer, clearDecayInterval, startDecay, idleDelay]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      clearIdleTimer();
      clearDecayInterval();
    };
  }, [clearIdleTimer, clearDecayInterval]);

  const onPointerDown: React.PointerEventHandler = useCallback((e) => {
    isDownRef.current = true;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    clearIdleTimer();
    clearDecayInterval();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [clearIdleTimer, clearDecayInterval]);

  const onPointerMove: React.PointerEventHandler = useCallback((e) => {
    if (!isDownRef.current || !lastPosRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    const delta = Math.hypot(dx, dy);
    accumulatedRef.current = Math.min(maxDistance, accumulatedRef.current + delta);
    const newAmount = Math.min(1, accumulatedRef.current / maxDistance);
    setChargeAmount(newAmount);
    lastPosRef.current = { x: e.clientX, y: e.clientY };

    // 100% 到達検出（1度だけ、同期的に発火）
    if (accumulatedRef.current >= maxDistance && !completedInternalRef.current) {
      completedInternalRef.current = true;
      // 以降の減衰を完全停止
      clearIdleTimer();
      clearDecayInterval();
      opts.onComplete?.();
      return;
    }

    resetIdleTimer();
  }, [maxDistance, resetIdleTimer, clearIdleTimer, clearDecayInterval, opts]);

  const onPointerUp: React.PointerEventHandler = useCallback(() => {
    isDownRef.current = false;
    lastPosRef.current = null;
    resetIdleTimer();
  }, [resetIdleTimer]);

  // iOS Safari のジェスチャー認識やシステム割込みで pointerup が来ず
  // pointercancel になることへの保険。 pointer の追跡を確実に終わらせる
  const onPointerCancel: React.PointerEventHandler = useCallback(() => {
    isDownRef.current = false;
    lastPosRef.current = null;
    // 100% 到達後でなければ通常のリリースとして扱う
    if (!completedInternalRef.current) {
      resetIdleTimer();
    }
  }, [resetIdleTimer]);

  // pointer が要素外に出た時の保険（iOS で pointercapture が解除される場合がある）
  const onPointerLeave: React.PointerEventHandler = useCallback(() => {
    if (!isDownRef.current) return;
    // pointercapture があれば leave は基本来ないはずだが、念のため
    isDownRef.current = false;
    lastPosRef.current = null;
    if (!completedInternalRef.current) {
      resetIdleTimer();
    }
  }, [resetIdleTimer]);

  return {
    chargeAmount,
    bindHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onPointerLeave },
  };
}
