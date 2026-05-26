# 誕生日お祝いアプリ（こっちゃん用） ロードマップ アーカイブ

ROADMAP.md から移動された完了済み Phase の詳細と古い進捗ログ。

---

## Phase 0: 初期セットアップ — ✅ 全完了

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

## Phase 1: スワイプチャージ演出 — ✅ 全完了（後に画面2自体は廃止）

### 1.1 スワイプ検出と累積距離計測 [M] — ✅ 完了
- `useSwipeCharge` フックで pointer event + 累積距離 + 無操作減衰（最低5%キープ）
- StrictMode 対応の cleanup あり、後に onPointerCancel / onPointerLeave も追加

### 1.2 ゲージUI [S] — ✅ 完了
- ハート型 SVG ゲージ、塗り高さで進捗、色は ピンク → ラベンダー → ミント

### 1.3 チャージエフェクト（粒子・光） [M] — ✅ 完了
- ハート・星のキラキラ背景デコ + 100% 達成時の3連光リング + ハート脈動で代替

### 1.4 「HAPPY BIRTHDAY」1文字ずつ生成・吸い込み [M] — ✅ 完了
- 累積 250px ごとに1文字、scale 1.5→0.2 + opacity 0 + blur 8px + ハート中心へ吸い込み
- 吸い込み中心は SVG text bbox 中心にピンポイント、heartCenter 取得は useLayoutEffect + rAF で堅牢化

**注**: 後の iOS Safari 致命バグ対策で画面2 (Charge) 自体を廃止。`src/components/ChargeScreen.tsx` は未使用としてファイル残存。

---

## Phase 2: ケーキ＆ろうそく — ✅ 全完了

### 2.1 ケーキアイコン出現 [S] — ✅ 完了
- 当初は2層、後に3層ゆめかわケーキに刷新（ピンク土台 + ラベンダー中層 + クリーム上層 + ドリップ + 苺/チェリー/ハート）
- 下からせり上がる spring (duration 1.4s, bounce 0.45)

### 2.2 ろうそくの炎アニメ [S] — ✅ 完了
- ろうそくは「2」「7」(27歳) の SVG text、炎は2つ
- SVG パス（外炎・内炎・コア）+ CSS keyframes で揺れる

### 2.3 タップで炎を消す＆指示テキスト [M] — ✅ 完了
- 「タップして火を吹き消そう！」点滅表示、画面全体 onPointerDown でタップ受信
- 後に native button overlay + 3経路 (onClick + onTouchEnd + onPointerDown) で堅牢化
- 風エフェクト強化（白い雲 + 〜💨 + ろうそく/炎が風で揺れて吹き消される）
- ケーキは scale 0 まで縮小、画面4 への遷移を rAF + setTimeout 三重保険 (1600ms) で確実発火

---

## Phase 3: フィナーレ — ✅ 全完了

### 3.1 「HAPPY BIRTHDAY こっちゃん!!」飛び出し [M] — ✅ 完了
- SVG `<textPath>` で **上下二段アーチ**：上 `HAPPY BIRTHDAY` (Fredoka)、下 `こっちゃん!!` (Mochiy Pop One)
- 虹色グラデーション (linearGradient + animate で色相シフト) + 多重 drop-shadow でギラギラ脈動
- アーチ path 両端の x 合計を 400 にして左右対称、`translateX(-50%)` を Framer Motion 側 (`x: '-50%'`) に統合して中央配置

### 3.2 写真の飛び出し [S] — ✅ 完了
- 初回は `pic-06.jpg` (LINE_ALBUM_2026523-24_260525_1) 固定、`replayCount > 0` でランダム化
- チェキ風白枠（下部 padding 広め + ソフトシャドウ）で中央配置 (`top: 50%`, `x:'-50%', y:'-50%'`)
- 写真出現から 1.4秒後に「2026.5.26」を Caveat フォントで左→右 clip-path ワイプ書き
- アーチとチェキは同時 spring 飛び出し (delay 0)

### 3.3 紙吹雪 + ファンファーレ [M] — ✅ 完了
- canvas-confetti 3波（ピンク・ラベンダー・ミント・水色のカラフル）+ 1.8秒毎の継続発射
- 3波と同期して se_cracker (クラッカー音) を発火
- 後にバースデーソング BGM (bgm.mp3) を 1秒遅延でループ再生

### 3.4 「もう一度」ボタン [S] — ✅ 完了
- 5.2秒後に表示。`white-space: nowrap` で1行化
- ボタン下に黒字「※違う画像が見れるかも！？」を追加
- 押下で BGM 停止 + replayCount++ で再マウント

### 3.5 パクパクGIF（追加機能）— ✅ 完了
- `source/挿入アイコン/Snapshot①.JPG`・`Snapshot②.JPG` から ffmpeg で 200x200 GIF を生成（黒帯 crop 済み）
- 画面4 で右→左に流れる演出、6秒毎 spawn、scale 0.7-1.3、duration 5-8秒、同時表示3つ上限
- y 範囲はチェキ (画面縦中央 28-72%) を避けて上端 3-22% or 下端 75-94% に分布
- iOS Safari の GIF キャッシュ共有問題は src に `#${id}` フラグメントで独立デコード、`will-change` / `filter` 削除で対処

---

## Phase 4: 仕上げとデプロイ — ✅ ほぼ完了

### 4.1 実機 (iPhone Safari) 動作確認 [M] — ⬜ 最終確認のみ未実施
- 段階的に iOS バグを発見・修正（タップ取りこぼし / 100%遷移失敗 / 初回音声無音 / GIFアニメ停止）
- 最終的に画面1/画面2 を物理廃止して2画面構成 (Cake + Finale) に縮小
- ROADMAP.md「次のTodo」に再確認タスクとして残置

### 4.2 GitHubリポジトリ作成 & 初回 push [S] — ✅ 完了
- `happy-bday-kocchan` を public で作成、main を push
- gh CLI に workflow scope を追加（ブラウザ承認経由、デバイスコード `D882-CC0B`）

### 4.3 GitHub Pages デプロイ [S] — ✅ 完了
- Pages ソースを Actions に設定、build/deploy 各約11秒で初回成功 (run 26400133454)
- 公開 URL: https://imay4th.github.io/happy-bday-kocchan/ （HTTP 200 確認済み）
- 注意: Node.js 20 actions が2026/06/02以降非推奨。必要に応じて FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true を deploy.yml に追加する

### 4.4 主役の写真・効果音差し替え [S] — ⬜ 必要に応じて
- 写真9枚と効果音11ファイル + BGM 2ファイル + パクパクGIF 1ファイルは配置完了
- 採用音は最終的に `se_cracker` + `bgm` のみ（うるさいので 3 → 2 に整理）
- 追加差し替えは任意

---

## 依存関係グラフ（オリジナル）

```
Phase 0:  0.1 → 0.2, 0.3, 0.4 (並行可)
Phase 1:  0.3 → 1.1 → 1.2 → 1.3, 1.4 (並行可)
Phase 2:  1.4 → 2.1 → 2.2 → 2.3
Phase 3:  2.3 → 3.1 → 3.2, 3.3 (並行可) → 3.4
Phase 4:  3.4 → 4.1 → 4.2 → 4.3 → 4.4
```

注: 後の iOS バグ対策で Phase 1 (Charge) は実質廃止され、現在のフローは Cake → Finale の2画面のみ。

---

## 時間不足の場合の削減順序（オリジナル）

1. 3.3 紙吹雪 — ファンファーレ音のみで十分演出可能
2. 1.3 粒子エフェクト — ゲージUIだけでも演出は成立
3. 3.4 「もう一度」ボタン — リロードで代替可能

---

## 進捗ログ（アーカイブ）

ROADMAP.md からアーカイブされた古い進捗ログエントリ。最新5件は ROADMAP.md に保持。

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
