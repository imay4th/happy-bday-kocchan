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

type ChimePreset = 'pop' | 'twinkle' | 'sparkle' | 'whoosh' | 'ding';

interface ChimeTone {
  freq: number;
  duration: number;
  type: OscillatorType;
  delay: number;
  volume?: number;
}

const CHIME_PRESETS: Record<ChimePreset, ChimeTone[]> = {
  pop: [
    { freq: 700, duration: 0.06, type: 'square', delay: 0, volume: 0.3 },
    { freq: 500, duration: 0.04, type: 'square', delay: 0.06, volume: 0.2 },
  ],
  twinkle: [
    { freq: 1046, duration: 0.08, type: 'sine', delay: 0, volume: 0.25 },
    { freq: 1318, duration: 0.08, type: 'sine', delay: 0.08, volume: 0.25 },
    { freq: 1568, duration: 0.08, type: 'sine', delay: 0.16, volume: 0.25 },
  ],
  sparkle: [
    { freq: 1046, duration: 0.1, type: 'sine', delay: 0, volume: 0.3 },
    { freq: 1318, duration: 0.1, type: 'sine', delay: 0.08, volume: 0.3 },
    { freq: 1568, duration: 0.1, type: 'sine', delay: 0.16, volume: 0.3 },
    { freq: 2093, duration: 0.2, type: 'sine', delay: 0.24, volume: 0.35 },
  ],
  whoosh: [
    { freq: 200, duration: 0.05, type: 'square', delay: 0, volume: 0.2 },
    { freq: 400, duration: 0.05, type: 'square', delay: 0.05, volume: 0.2 },
    { freq: 600, duration: 0.05, type: 'square', delay: 0.10, volume: 0.2 },
    { freq: 800, duration: 0.05, type: 'square', delay: 0.15, volume: 0.2 },
  ],
  ding: [
    { freq: 660, duration: 0.1, type: 'triangle', delay: 0, volume: 0.3 },
    { freq: 880, duration: 0.1, type: 'triangle', delay: 0.1, volume: 0.3 },
  ],
};

interface UseSoundEffectResult {
  resume: () => Promise<void>;
  loadSound: (name: string, url: string) => Promise<void>;
  playSound: (name: string, opts?: SoundOptions) => void;
  stopSound: (name: string) => void;
  playChime: (preset: ChimePreset) => void;
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

  const playChime = useCallback((preset: ChimePreset): void => {
    try {
      const ctx = getCtx();
      const tones = CHIME_PRESETS[preset];
      tones.forEach((tone) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = tone.type;
        osc.frequency.value = tone.freq;
        const vol = tone.volume ?? 0.3;
        // エンベロープ（attack + release）
        const startTime = ctx.currentTime + tone.delay;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + tone.duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + tone.duration);
      });
    } catch (err) {
      console.warn('[useSoundEffect] playChime failed:', err);
    }
  }, [getCtx]);

  return { resume, loadSound, playSound, stopSound, playChime };
}
