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

### 0.2 GitHub Pages デプロイ設定 [S] — ✅ 完了
- `vite.config.ts` の `base` を GH_REPO 環境変数で `/happy-bday-kocchan/` に切替
- GitHub Actions ワークフロー `.github/workflows/deploy.yml` 作成（main push 時に自動ビルド + Pages デプロイ）

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

### 4.2 GitHubリポジトリ作成 & 初回 push [S] — ✅ 完了
- `happy-bday-kocchan` を public で作成、main を push
- gh CLI に workflow scope を追加（ブラウザ承認経由）

### 4.3 GitHub Pages デプロイ [S] — ✅ 完了
- Pages ソースを Actions に設定、build/deploy 各約11秒で成功 (run 26400133454)
- 公開 URL: https://imay4th.github.io/happy-bday-kocchan/ （HTTP 200 確認済み）
- 注意: Node.js 20 actions が2026/06/02以降非推奨。必要に応じて FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true を deploy.yml に追加する

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
| 2026-05-25 | Phase 0.2 / 4.2 / 4.3 着手 | GitHub リポ `imay4th/happy-bday-kocchan` 作成・push、Pages ソースを Actions に設定、自動デプロイ workflow 起動 |
| 2026-05-25 | Phase 4.3 完了 | 自動デプロイ成功 (build 11s + deploy 11s)、https://imay4th.github.io/happy-bday-kocchan/ で公開、HTTP 200 確認 |
| 2026-05-25 | 手直し7件 (commit 751d351) | base path バグ修正 (画像404解消) / Idle「タップしてね」/ Charge指示変更 / ハート中央配置 + 文字吸い込み + ふち発光 / ろうそく「2」「7」+ 炎2本 / 「火を吹き消そう」/ 遷移タメ→爆発演出 |
| 2026-05-25 | FinaleScreen 改装 (d5a988f) | SVG textPath でアーチ虹色ギラギラメッセージ / 写真ランダム1枚 / チェキ風白枠 / 「2026.5.26」を Caveat で左→右 clip-path ワイプ書き / Caveat + Permanent Marker フォント追加 |
| 2026-05-25 | リポ片付け (c314705) | `.claude/scheduled_tasks.lock` 誤コミット → `.gitignore` で除外 |
| 2026-05-25 | 速度可変デバッグ + 9件手直し (088e806) | SpeedContext + ?debug=1 で右上速度パネル(0.25-3.0、localStorage保存) / Idle・Charge指示文の改行 / ChargeScreen 100%達成時の3連光リング+ハート脈動 / CakeScreen onPointerDown化でタップ反応安定 / 風エフェクト強化(白い雲+〜💨+ろうそく/炎が風で揺れて吹き消される) / Cake→Finale 各タメ時間を大幅延長 / FinaleScreen チェキを縦横ど真ん中 / アーチを上下二段(HAPPY BIRTHDAY / こっちゃん!!) |
| 2026-05-25 | 18件手直し (5ae6ea3) | タブタイトル「2026.5.26」へ秘匿 / Idle子要素 pointer-events:none / Charge ハート位置調整 + 指示文1行化 / 100%検出を>=0.999 + chargeAmountクランプ / heartCenter を useLayoutEffect + rAF で堅牢化 / Cake 全画面 onPointerDown + scale 0 まで縮小 + exit y動き削除 + 3層ゆめかわケーキ刷新(ピンク/ラベンダー/クリーム + ドリップ + 苺/チェリー) / Cake→Finale ケーキ縮みきり=チェキ飛び出し同期 / アーチ path拡張+fontSize縮小でH/Y収まり / アーチとチェキを同時 spring 飛び出し / 初回 pic-06.jpg 固定→再遊でランダム / 紙吹雪 1.8秒毎に上から継続発射 / もう一度遊ぶ♡ nowrap で1行化 / ボタン下に黒字「※違う画像が見れるかも！？」追加 |

---

## 次のTodo

> **このセクションはセッション終了時に更新すること。次回セッション開始時にここから再開。**

- [ ] **iPhone Safari 実機での動作確認** — https://imay4th.github.io/happy-bday-kocchan/ を iPhone Safari で開き、4フェーズ通しで動作 / レイアウト / アニメーション速度・体感を確認する
- [ ] Phase 4.1 で見つかった問題の修正（手直しリスト → ROADMAP に追記して個別対応）
- [ ] 効果音ファイル配置: `public/sounds/` に `charge.mp3` / `blow.mp3` / `fanfare.mp3` を配置して push（自動デプロイ）
- [ ] Phase 4.4: 必要に応じて写真や効果音を差し替え
- [ ] (任意) deploy.yml の actions 各バージョン更新（Node.js 24 対応、2026/06/02 まで猶予あり）

---

## 検証方法

各フェーズ完了時に:
1. `npm run build` 成功確認
2. `npm run lint` エラーなし確認
3. ローカル `npm run dev` で動作確認
4. Phase 1 以降は iPhone Safari でも実機確認（タッチ・音・レイアウト）
