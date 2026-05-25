import { useRef, useCallback } from 'react';

interface SoundOptions {
  loop?: boolean;
  volume?: number;
}

interface SoundEntry {
  buffer: AudioBuffer;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode | null;
}

interface UseSoundEffectResult {
  resume: () => Promise<void>;
  loadSound: (name: string, url: string) => Promise<void>;
  playSound: (name: string, opts?: SoundOptions) => void;
  stopSound: (name: string) => void;
}

export function useSoundEffect(): UseSoundEffectResult {
  const ctxRef = useRef<AudioContext | null>(null);
  const soundsRef = useRef<Map<string, SoundEntry>>(new Map());

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const resume = useCallback(async (): Promise<void> => {
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
    } catch (err) {
      console.error('[useSoundEffect] resume failed:', err);
    }
  }, [getCtx]);

  const loadSound = useCallback(async (name: string, url: string): Promise<void> => {
    try {
      const ctx = getCtx();
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`[useSoundEffect] sound not found: ${url} (${response.status})`);
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      soundsRef.current.set(name, { buffer: audioBuffer, source: null, gainNode: null });
    } catch (err) {
      console.warn(`[useSoundEffect] failed to load sound "${name}":`, err);
    }
  }, [getCtx]);

  const playSound = useCallback((name: string, opts: SoundOptions = {}): void => {
    const entry = soundsRef.current.get(name);
    if (!entry) {
      console.warn(`[useSoundEffect] sound not loaded: "${name}"`);
      return;
    }
    try {
      const ctx = getCtx();
      // 既存のソースを停止
      if (entry.source) {
        try { entry.source.stop(); } catch { /* already stopped */ }
      }
      const gainNode = ctx.createGain();
      gainNode.gain.value = opts.volume ?? 1.0;
      gainNode.connect(ctx.destination);

      const source = ctx.createBufferSource();
      source.buffer = entry.buffer;
      source.loop = opts.loop ?? false;
      source.connect(gainNode);
      source.start();

      entry.source = source;
      entry.gainNode = gainNode;
    } catch (err) {
      console.warn(`[useSoundEffect] failed to play sound "${name}":`, err);
    }
  }, [getCtx]);

  const stopSound = useCallback((name: string): void => {
    const entry = soundsRef.current.get(name);
    if (!entry?.source) return;
    try {
      entry.source.stop();
    } catch { /* already stopped */ }
    entry.source = null;
    entry.gainNode = null;
  }, []);

  return { resume, loadSound, playSound, stopSound };
}
