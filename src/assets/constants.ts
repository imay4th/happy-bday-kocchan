export const CHARA_NAME = 'こっちゃん';

const BASE = import.meta.env.BASE_URL; // dev='/', prod='/happy-bday-kocchan/'

export const PHOTOS = Array.from(
  { length: 9 },
  (_, i) => `${BASE}photos/pic-${String(i + 1).padStart(2, '0')}.jpg`,
);

export const SOUNDS = {
  // BGM
  intro_bgm: `${BASE}sounds/intro_bgm.mp3`, // 画面1-3 用ループBGM (128kbps mp3 / 1.9MB)
  bgm: `${BASE}sounds/bgm.mp3`,             // 画面4 バースデーソング
  // ループ系
  blow: `${BASE}sounds/blow.wav`,
  fanfare: `${BASE}sounds/fanfare.wav`,
  // 効果音
  se_pop: `${BASE}sounds/se_pop.mp3`,         // 画面1タップ
  se_letter: `${BASE}sounds/se_letter.wav`,   // 文字出現
  se_sparkle: `${BASE}sounds/se_sparkle.mp3`, // 100%達成
  se_cake: `${BASE}sounds/se_cake.mp3`,       // ケーキ登場
  se_cracker: `${BASE}sounds/se_cracker.wav`, // 紙吹雪クラッカー
  se_ding: `${BASE}sounds/se_ding.mp3`,       // ボタン決定音
  se_swipe: `${BASE}sounds/se_swipe.flac`,    // スワイプ開始
  se_halfway: `${BASE}sounds/se_halfway.mp3`, // 50%到達
  se_charge_loop: `${BASE}sounds/se_charge_loop.wav`, // スワイプ中ループ
} as const;

export const HAPPY_BIRTHDAY_LETTERS = [
  'H', 'A', 'P', 'P', 'Y', ' ', 'B', 'I', 'R', 'T', 'H', 'D', 'A', 'Y',
] as const;

export const SWIPE_THRESHOLD_PER_LETTER = 250; // px
export const SWIPE_MAX_DISTANCE = 8000; // px
