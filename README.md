# 🎂 HAPPY BIRTHDAY こっちゃん♡

友人「こっちゃん」の誕生日を祝う iPhone Safari 向けジョークサプライズ Web アプリ。
スワイプでパワーをチャージ → ろうそくの炎を吹き消す → HAPPY BIRTHDAY と写真が舞う、3段構成の演出。

🌸 デザインテーマ: ゆめかわ系（パステルピンク / ラベンダー / ミント + Mochiy Pop One）

## 公開 URL

デプロイ後にここに記載: `https://imay4th.github.io/happy-bday-kocchan/`

## 開発

```bash
npm install
npm run dev        # ローカル開発 (http://localhost:5173/)
npm run dev:host   # LAN 公開で iPhone 実機確認
npm run build      # 本番ビルド
npm run lint       # ESLint
```

## 効果音の差し替え

`public/sounds/` に以下のファイルを配置してください。未配置でもアプリは動作します（無音）。

- `charge.mp3` — ChargeScreen でループ再生（音量 0.5）
- `blow.mp3` — 炎タップ時に再生
- `fanfare.mp3` — FinaleScreen 開始時に再生

## 写真の差し替え

`public/photos/pic-01.jpg` 〜 `pic-09.jpg` を差し替えてください。
画像数を増減する場合は `src/assets/constants.ts` の `PHOTOS` 配列の長さを調整します。

## 主役名の変更

`src/assets/constants.ts` の `CHARA_NAME` を変更してください。

## デプロイ

`main` ブランチに push すると GitHub Actions が自動でビルドし、GitHub Pages に公開します。
ワークフローは `.github/workflows/deploy.yml`。
