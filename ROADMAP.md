# 誕生日お祝いアプリ（こっちゃん用） 開発ロードマップ

最終更新: 2026-05-25

## ⚠️ 進捗管理ルール

**各タスク完了時に必ず以下を更新すること:**
1. タスクのステータスを ✅ に変更
2. 「進捗ログ」セクションに日付・完了内容・発見した問題を記録
3. 「次のTodo」セクションを更新
4. 新たなバグを発見した場合は REQUIREMENTS.md の「既知の問題」に追記

**セッション開始時に必ず以下を確認すること:**
1. このファイルの「進捗ログ」で前回どこまで完了したか確認
2. 「次のTodo」セクションで今回着手すべきタスクを確認
3. REQUIREMENTS.md の「既知の問題」で未修正バグを確認

**アーカイブルール（dev2-save時に自動提案）:**
- ROADMAP.md が150行を超えた場合、完了済みPhaseと古い進捗ログのアーカイブを提案する
- 完了Phase → ROADMAP_ARCHIVE.md に移動（1行サマリーを残す）
- 進捗ログ → 最新5件を保持、それ以前は ROADMAP_ARCHIVE.md に移動する

---

## Phase 0: 初期セットアップ

### 0.1 Vite + React + TypeScript プロジェクト初期化 [S] — ✅ 完了
- `npm create vite@latest . -- --template react-ts` で骨組み生成（一時ディレクトリ経由で安全に scaffold）
- framer-motion + canvas-confetti を追加、`npm install` 完了

### 0.2 GitHub Pages デプロイ設定 [S] — ⬜ 未着手（Phase 4 で実施）
- `vite.config.ts` の `base` をリポジトリ名に合わせる（環境変数 GH_REPO で切替可能化済み）
- GitHub Actions の deploy ワークフロー (`.github/workflows/deploy.yml`) は Phase 4.3 で作成

### 0.3 iOS Safari 縦画面最適化 [S] — ✅ 完了
- `index.html` の viewport meta（`viewport-fit=cover`, `user-scalable=no`）、theme-color、apple-mobile-web-app-* メタ追加
- グローバルCSS（`html, body` に `overscroll-behavior: none; touch-action: none;` 等）
- `100dvh` 利用

### 0.4 アセット配置場所の準備 [S] — ✅ 完了
- `public/photos/pic-01.jpg` ~ `pic-09.jpg`（LINEアルバムから9枚を ASCII リネームでコピー）
- `public/sounds/.gitkeep`（charge.mp3 / blow.mp3 / fanfare.mp3 は手動配置予定、未配置でも動作）
- `src/assets/constants.ts` でキャラ名「こっちゃん」、写真パス、効果音パス、スワイプ閾値を一元管理

---

## Phase 1: スワイプチャージ演出

### 1.1 スワイプ検出と累積距離計測 [M] — ✅ 完了
- `useSwipeCharge` フックで pointer event + 累積距離 + 無操作減衰（最低5%キープ）
- StrictMode 対応の cleanup あり

### 1.2 ゲージUI [S] — ✅ 完了
- ハート型 SVG ゲージ、塗り高さで進捗、色は ピンク → ラベンダー → ミント

### 1.3 チャージエフェクト（粒子・光） [M] — ✅ 完了（ハート・星のキラキラ背景デコで代替）
- 文字生成エフェクトと合わせて十分な賑やかさを確保
- 必要に応じて Phase 5 で粒子追加可能

### 1.4 「HAPPY BIRTHDAY」1文字ずつ生成・吸い込み [M] — ✅ 完了
- 累積 250px ごとに1文字、scale 1.5→0.2 + opacity 0 + blur 8px + y -200px で吸い込まれる
- charge.mp3 ループ再生（初回タッチで AudioContext.resume）

---

## Phase 2: ケーキ＆ろうそく

### 2.1 ケーキアイコン出現 [S] — ✅ 完了
- ピンク土台 + ラベンダークリーム + 苺デコ + ろうそくの SVG ケーキ、下からせり上がる spring

### 2.2 ろうそくの炎アニメ [S] — ✅ 完了
- SVG パス（外炎・内炎・コア）+ CSS keyframes で揺れる

### 2.3 タップで炎を消す＆指示テキスト [M] — ✅ 完了
- 「タップして炎を消してね！🎂」点滅表示、炎フェードアウト + 風エフェクト + blow.mp3 再生

---

## Phase 3: フィナーレ

### 3.1 「HAPPY BIRTHDAY こっちゃん!!」飛び出し [M] — ✅ 完了
- HAPPY BIRTHDAY (Fredoka) と こっちゃん!! (Mochiy Pop One) が spring で飛び出す

### 3.2 写真の飛び出し [S] — ✅ 完了（強化）
- 9枚の写真 (pic-01〜09.jpg) を 200ms 間隔でランダム位置・回転・スケールで順次出現

### 3.3 紙吹雪 + ファンファーレ [M] — ✅ 完了
- canvas-confetti を 3 連射（ピンク・ラベンダー・ミント・水色のカラフル）、fanfare.mp3 を 1 回再生

### 3.4 「もう一度」ボタン [S] — ✅ 完了
- 3.5 秒後に表示。タップで IdleScreen にリセット

---

## Phase 4: 仕上げとデプロイ

### 4.1 実機 (iPhone Safari) 動作確認 [M] — ⬜ 未着手
- 依存: 3.4
- LAN経由で `npm run dev` を実機で確認、タッチ挙動・音・レイアウトをチェック

### 4.2 GitHubリポジトリ作成 & 初回 push [S] — ⬜ 未着手
- 依存: 4.1
- `gh repo create` で公開リポジトリ作成、main へ push

### 4.3 GitHub Pages デプロイ [S] — ⬜ 未着手
- 依存: 4.2
- GitHub Actions が動作、公開URLが iPhone Safari から開けることを確認

### 4.4 主役の写真・効果音差し替え [S] — ⬜ 未着手
- 依存: 4.3
- 本番用のこっちゃん写真と効果音ファイルを `public/` に配置

---

## 依存関係グラフ

```
Phase 0:  0.1 → 0.2, 0.3, 0.4 (並行可)
Phase 1:  0.3 → 1.1 → 1.2 → 1.3, 1.4 (並行可)
Phase 2:  1.4 → 2.1 → 2.2 → 2.3
Phase 3:  2.3 → 3.1 → 3.2, 3.3 (並行可) → 3.4
Phase 4:  3.4 → 4.1 → 4.2 → 4.3 → 4.4
```

## 時間不足の場合の削減順序

1. 3.3 紙吹雪 — ファンファーレ音のみで十分演出可能
2. 1.3 粒子エフェクト — ゲージUIだけでも演出は成立
3. 3.4 「もう一度」ボタン — リロードで代替可能

---

## 進捗ログ

> **このセクションは各タスク完了時に追記すること**

| 日付 | 完了タスク | メモ・発見した問題 |
|------|-----------|-------------------|
| 2026-05-25 | — | 開発計画策定。ジョーク系サプライズアプリ、iPhone Safari前提、GitHub Pages公開、主役=こっちゃん |
| 2026-05-25 | Phase 0.1 / 0.3 / 0.4 | Vite + React + TS scaffold、iOS Safari 最適化、写真9枚配置、constants.ts 集約 |
| 2026-05-25 | Phase 1.1〜1.4 | useSwipeCharge / ハート型ゲージ / HAPPY BIRTHDAY 文字吸い込み実装 |
| 2026-05-25 | Phase 2.1〜2.3 | ケーキSVG + ろうそく炎 + タップ吹き消し実装 |
| 2026-05-25 | Phase 3.1〜3.4 | フィナーレ（メッセージ + 写真9枚 + 紙吹雪 + 再遊ボタン）実装、build/lint PASS |
| 2026-05-25 | デザイン方針追記 | 「ゆめかわ系」テーマ（パステル + Mochiy Pop One + ハート/星）を CLAUDE.md / REQUIREMENTS.md に明記 |

---

## 次のTodo

> **このセクションはセッション終了時に更新すること。次回セッション開始時にここから再開。**

- [ ] **iPhone Safari 実機での動作確認** — `npm run dev:host` (起動済み) で表示される LAN URL を iPhone Safari で開き、4フェーズ通しで動作 / レイアウト / アニメーション速度を確認する
- [ ] 効果音ファイル配置: `public/sounds/` に `charge.mp3` / `blow.mp3` / `fanfare.mp3` をユーザーが手動配置
- [ ] Phase 0.2 + 4.2-4.3: GitHub リポジトリ作成 → GitHub Actions deploy ワークフロー追加 → GitHub Pages 公開
- [ ] Phase 4.1 で見つかった問題があれば修正
- [ ] Phase 4.4: 主役の写真・効果音差し替え（必要に応じて）

---

## 検証方法

各フェーズ完了時に:
1. `npm run build` 成功確認
2. `npm run lint` エラーなし確認
3. ローカル `npm run dev` で動作確認
4. Phase 1 以降は iPhone Safari でも実機確認（タッチ・音・レイアウト）
