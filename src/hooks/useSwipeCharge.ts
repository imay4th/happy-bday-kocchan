import { useState, useRef, useCallback, useEffect } from 'react';
import { SWIPE_MAX_DISTANCE } from '../assets/constants';

interface SwipeChargeOptions {
  maxDistance?: number;
  decayRate?: number;
  idleDelay?: number;
}

interface SwipeChargeResult {
  chargeAmount: number; // 0..1
  bindHandlers: {
    onPointerDown: React.PointerEventHandler;
    onPointerMove: React.PointerEventHandler;
    onPointerUp: React.PointerEventHandler;
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
    clearDecayInterval();
    const TICK_MS = 50;
    decayIntervalRef.current = setInterval(() => {
      accumulatedRef.current = Math.max(
        maxDistance * 0.05,
        accumulatedRef.current - (decayRate * TICK_MS) / 1000,
      );
      setChargeAmount(accumulatedRef.current / maxDistance);
    }, TICK_MS);
  }, [clearDecayInterval, decayRate, maxDistance]);

  const resetIdleTimer = useCallback(() => {
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
    setChargeAmount(Math.min(1, accumulatedRef.current / maxDistance));
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    resetIdleTimer();
  }, [maxDistance, resetIdleTimer]);

  const onPointerUp: React.PointerEventHandler = useCallback(() => {
    isDownRef.current = false;
    lastPosRef.current = null;
    resetIdleTimer();
  }, [resetIdleTimer]);

  return {
    chargeAmount,
    bindHandlers: { onPointerDown, onPointerMove, onPointerUp },
  };
}
