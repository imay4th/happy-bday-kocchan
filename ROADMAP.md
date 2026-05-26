# 誕生日お祝いアプリ（こっちゃん用） 開発ロードマップ

最終更新: 2026-05-26 (自己レビュー体制強化 P1+Stop Hook 実装完了)

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

## Phase 0: 初期セットアップ — ✅ 全完了（詳細: ROADMAP_ARCHIVE.md）
## Phase 1: スワイプチャージ演出 — ✅ 全完了（後に画面2自体は廃止／詳細: ROADMAP_ARCHIVE.md）
## Phase 2: ケーキ＆ろうそく — ✅ 全完了（詳細: ROADMAP_ARCHIVE.md）
## Phase 3: フィナーレ — ✅ 全完了（パクパクGIF 含む／詳細: ROADMAP_ARCHIVE.md）
## Phase 4: 仕上げとデプロイ — ✅ ほぼ完了（4.1 実機最終確認のみ残／詳細: ROADMAP_ARCHIVE.md）

最終構成: 2画面フロー (Cake → Finale)。iOS Safari の致命バグ (タップ取りこぼし / 100%遷移失敗 / 初回音声無音) を物理的に回避するため画面1 / 画面2 を廃止済み。公開 URL: https://imay4th.github.io/happy-bday-kocchan/

---

## 進捗ログ

> **このセクションは各タスク完了時に追記すること（最新5件を保持、それ以前は ROADMAP_ARCHIVE.md）**

| 日付 | 完了タスク | メモ・発見した問題 |
|------|-----------|-------------------|
| 2026-05-25 | リポ片付け (c314705) | `.claude/scheduled_tasks.lock` 誤コミット → `.gitignore` で除外 |
| 2026-05-25 | 速度可変デバッグ + 9件手直し (088e806) | SpeedContext + ?debug=1 で右上速度パネル(0.25-3.0、localStorage保存) / Idle・Charge指示文の改行 / ChargeScreen 100%達成時の3連光リング+ハート脈動 / CakeScreen onPointerDown化でタップ反応安定 / 風エフェクト強化(白い雲+〜💨+ろうそく/炎が風で揺れて吹き消される) / Cake→Finale 各タメ時間を大幅延長 / FinaleScreen チェキを縦横ど真ん中 / アーチを上下二段(HAPPY BIRTHDAY / こっちゃん!!) |
| 2026-05-25 | 18件手直し (5ae6ea3) | タブタイトル「2026.5.26」へ秘匿 / Idle子要素 pointer-events:none / Charge ハート位置調整 + 指示文1行化 / 100%検出を>=0.999 + chargeAmountクランプ / heartCenter を useLayoutEffect + rAF で堅牢化 / Cake 全画面 onPointerDown + scale 0 まで縮小 + exit y動き削除 + 3層ゆめかわケーキ刷新(ピンク/ラベンダー/クリーム + ドリップ + 苺/チェリー) / Cake→Finale ケーキ縮みきり=チェキ飛び出し同期 / アーチ path拡張+fontSize縮小でH/Y収まり / アーチとチェキを同時 spring 飛び出し / 初回 pic-06.jpg 固定→再遊でランダム / 紙吹雪 1.8秒毎に上から継続発射 / もう一度遊ぶ♡ nowrap で1行化 / ボタン下に黒字「※違う画像が見れるかも！？」追加 |
| 2026-05-26 | iOS致命バグ対策・効果音整理・2画面化 (15コミット) | (1) アーチ中央ずれ修正 (motion.svg と CSS transform 競合) + パクパクGIF追加 + Playwright iPhone12 Chromiumエミュ環境 (6e3133b) (2) 効果音11ファイル wire-up + GIFサイズ拡大・速度減速 + 黒帯削除 (8d4b088) (3) intro_bgm.wav 32MB→mp3 1.9MB 圧縮 (c205c98) (4) スワイプチャージループ音 (1ad544b) (5) 100%遷移失敗の根本修正 — useSoundEffect 戻り値 useMemo 安定化 + ChargeScreen onPhaseChangeRef (f6967b1) (6) GIF 頻度密度ダウン + BGM 1秒遅延 + チェキ避け配置 (a760a99) (7) iOS Safari GIFアニメ停止修正 — src に #id フラグメントで独立デコード (2869577) (8) iOS タップ取りこぼし・100%遷移失敗を3層保険で根絶 (9f479a2 / b0da5d3) (9) 画面1 (Idle) 廃止 — Charge から開始 (0895828) (10) 画面2 (Charge) 廃止 — Cake から開始 + CakeScreen 堅牢化 (956ba33) (11) iOS 初回音声無音問題を warmup pattern で根絶 (28cae21)。最終構成は 2画面 (Cake → Finale)、採用音は se_cracker + bgm のみ |
| 2026-05-26 | プロセス改善の材料収集 (実装なし) | 「自己レビュー体制が弱い」「メイン/サブ役割分担が機能していない」とユーザー指摘 → サブ並行2回で CLAUDE.md / dev1-start skill.md から視覚確認義務 (L320: 必要に応じて条件付き) と役割分担ルール (L18: 3ファイル/50行) の所在を15箇所抽出。「網羅性のあるリストアップ・テキスト生成」の委譲先明示・「サブ起動オーバーヘッド粒度判断」「サブ成果物の独立レビューチェックリスト」は **明文化なし** と判明。対応策プランニングは未実施 (ユーザー指示で材料集めのみ) |
| 2026-05-26 | ✅ 自己レビュー体制強化 (Plan + 実装) | Plan agent でプラン起草 → P1 4件 + P2 2件 + Stop Hook を実装。改訂: skill.md L27-57/L92-101/L128-138/L373-384 (条件付き表現排除・完了条件拡張・テキスト生成委譲基準新設・独立レビュー5手順新設)、user CLAUDE.md L16 (1行ポインタ)、project CLAUDE.md L65-75 (iOS検証5項目)。Stop Hook: `~/.claude/scripts/check-ui-verification-artifact.sh` 作成+動作テスト4ケース全PASS。残: settings.json への hooks.Stop 登録 (ユーザー手動)。プラン: docs/plans/session-self-review-countermeasures.md (status: completed)、artifact: docs/verification/session-self-review-countermeasures-results.md |

---

## 次のTodo

> **このセクションはセッション終了時に更新すること。次回セッション開始時にここから再開。**

- [ ] **iPhone Safari 実機での最終動作確認（2画面構成 + warmup pattern 後）** — https://imay4th.github.io/happy-bday-kocchan/ で「初回プレイで BGM・紙吹雪音が鳴る」「ケーキタップが確実に効く」「タップ後に確実に画面4 に遷移する」を確認
- [x] 「自己レビュー体制が弱い」問題への具体的対応策（完了: docs/plans/session-self-review-countermeasures.md / Phase 1+2 完了 / settings.json への Stop Hook 登録のみユーザー手動が残）
- [ ] **ユーザー手動タスク**: `~/.claude/settings.json` の `hooks.Stop` に `check-ui-verification-artifact.sh` を登録 (artifact: docs/verification/session-self-review-countermeasures-results.md L62-77 参照)
- [ ] (任意) ChargeScreen / IdleScreen の完全削除判断（現状ファイルとして残しているが未使用）
- [ ] (任意) deploy.yml の actions 各バージョン更新（Node.js 24 対応、2026/06/02 まで猶予あり）
- [ ] (任意) Phase 4.4 写真・効果音の追加差し替え

---

## 検証方法

各フェーズ完了時に:
1. `npm run build` 成功確認
2. `npm run lint` エラーなし確認
3. ローカル `npm run dev` で動作確認
4. **UI/レイアウト変更時は Playwright (`npx playwright test`) でスクリーンショット撮影し視覚確認**
5. iPhone Safari でも実機確認（タッチ・音・レイアウト）
