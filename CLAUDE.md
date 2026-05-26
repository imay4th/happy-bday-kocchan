# 誕生日お祝いアプリ プロジェクト指針

## プロジェクト概要
友人「こっちゃん」の誕生日を祝うための iPhone Safari 向けジョーク系サプライズWebアプリ。スワイプチャージ → ケーキ吹き消し → 写真飛び出しの3段構成の演出。

## 開発ワークフロー
- 開発開始・再開: `/dev1-start` で前回の続きから再開
- 進捗保存: `/dev2-save` でROADMAP.mdに進捗を記録
- プロジェクト管理: ROADMAP.md / REQUIREMENTS.md で進捗を追跡
- タスク完了時はROADMAP.mdの⚠️進捗管理ルールに従うこと

## 主役の名前
- ハードコード値: **こっちゃん**
- `src/assets/constants.ts` に集約し、文中表示は必ずこの定数を参照すること

## 動作環境
- **対象**: iPhone Safari（縦画面、`100dvh` 基準）
- **タッチ操作**: `touch-action: none` でデフォルトスクロールを抑止
- **音声**: iOS Safari の制約上、初回ユーザー操作で AudioContext を resume すること

## デプロイ先
- GitHub Pages（無料、公開URL配布）
- `vite.config.ts` の `base` をリポジトリ名に合わせる必要あり

## アニメーション
- 第一選択: **Framer Motion**（宣言的、`motion` コンポーネント主体）
- 紙吹雪のみ canvas-confetti を使用検討

## デザインテーマ「ゆめかわ系」

全UIでこのテーマに統一すること。

### カラーパレット（CSS変数として `src/styles/theme.css` に集約）
- `--yk-pink`: `#FFB6D9` （メインピンク）
- `--yk-pink-light`: `#FFE4F1` （極淡ピンク）
- `--yk-lavender`: `#C5A3FF` （ラベンダー）
- `--yk-mint`: `#B7F0DC` （ミントグリーン）
- `--yk-sky`: `#A8E1FF` （水色）
- `--yk-cream`: `#FFF8E7` （クリーム）
- `--yk-text`: `#6B4E7D` （深い紫グレーの本文色）
- `--yk-accent`: `#FF6FA8` （CTA・強調ピンク）
- 背景: ピンク → ラベンダー → 水色の斜めグラデーション

### フォント
- 日本語: **Mochiy Pop One** （主役テキスト・大きな見出し）
- 補助: **M PLUS Rounded 1c** （本文・ボタン）
- 英字（HAPPY BIRTHDAY）: **Mochiy Pop One** か **Fredoka** （丸い表情）
- Google Fonts から読み込み、`index.html` で `<link rel="preconnect">` を入れる

### 装飾要素
- ハート (♡)、星 (✦)、キラキラ (✨) をふんだんに使う
- 角丸 (border-radius: 16px〜32px) を多用、シャープな直線は避ける
- box-shadow にピンク・ラベンダー系のソフトな影 (`0 8px 24px rgba(255, 182, 217, 0.35)` など)
- ボーダー: 太め (3-4px) のパステル色

### アニメーション
- ゆったり弾むイージング (`cubic-bezier(0.34, 1.56, 0.64, 1)` / Framer Motion の `type: 'spring'` `bounce: 0.5`)
- 常に何かが揺れている・キラキラしている状態を作る（無音の静止は避ける）

## 効果音ファイルの扱い
- `public/sounds/` 配下に配置（charge.mp3 / blow.mp3 / fanfare.mp3）
- 実ファイルはユーザーが手動で配置するため、コード側はパスのみ参照
- ファイル未配置時もアプリ自体は動作するよう、ロード失敗時のフォールバックを入れる

## UI/挙動変更時の必須検証 (iOS Safari)

本プロジェクトは iPhone Safari 専用のため、UI/挙動を変更したら以下を **必ず** 実行:

1. **Playwright webkit プロジェクトで該当画面の screenshot 撮影**: `npx playwright test --project=webkit --device='iPhone 14' <spec>`
2. **AudioContext 関連変更時は warmup pattern の生存確認**: 「初回 user gesture の同期 context 中に AudioBufferSourceNode.start() を呼ぶ」が壊れていないか
3. **タッチ操作変更時の 3 経路イベント生存確認**: `onPointerDown` / `onClick` / `onTouchEnd` のどれが発火しているかを `console.log` で観測
4. **GIF を扱う場合の src フラグメント生存確認**: `<img src={\`${path}#${id}\`}>` の `#id` 部が削られていないか
5. **artifact 配置先**: `docs/verification/<タスク名>-results.md`

**Why:** iOS Safari は通常の Chromium デバッグツールでは観測できない固有挙動 (AudioContext 同期起動、GIF 同時表示制約、タッチ合成イベントの取りこぼし) を持つ。デスクトップ Chrome で PASS でも iOS で FAIL する事故が頻発するため、プロジェクト固有チェックリストを skill.md とは別レイヤーで持つ。
