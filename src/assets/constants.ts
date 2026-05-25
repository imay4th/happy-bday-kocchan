export const CHARA_NAME = 'こっちゃん';

const BASE = import.meta.env.BASE_URL; // dev='/', prod='/happy-bday-kocchan/'

export const PHOTOS = Array.from(
  { length: 9 },
  (_, i) => `${BASE}photos/pic-${String(i + 1).padStart(2, '0')}.jpg`,
);

export const SOUNDS = {
  charge: `${BASE}sounds/charge.mp3`,
  blow: `${BASE}sounds/blow.mp3`,
  fanfare: `${BASE}sounds/fanfare.mp3`,
} as const;

export const HAPPY_BIRTHDAY_LETTERS = [
  'H', 'A', 'P', 'P', 'Y', ' ', 'B', 'I', 'R', 'T', 'H', 'D', 'A', 'Y',
] as const;

export const SWIPE_THRESHOLD_PER_LETTER = 250; // px
export const SWIPE_MAX_DISTANCE = 8000; // px
