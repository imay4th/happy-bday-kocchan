---
status: in_progress
type: ui-restoration-ios
created: 2026-05-26
project: 20260525_誕生日お祝いアプリ
scope: src/App.tsx (主) + playwright.config.ts (オプション) + tests/screenshots.spec.ts (確認のみ)
related_kb: kb/development/20260525_誕生日お祝いアプリ/2026-05-26-0853_ios-safari-tap-bgm-2gamen-ka.md
related_plans: docs/plans/session-self-review-countermeasures.md (本プランで初運用)
---

# 画面1 (Idle) / 画面2 (Charge) の完全版復活

**実行推奨モデル**: opus[1m] / **effortLevel**: high
(理由: iOS Safari 致命バグの再発リスクがあり、復活後の検証で判断・対応の質が求められるため。実装そのものはサブ sonnet に委譲可)

---

## ExitPlanMode 前セルフチェック (4 項目)

- [x] **根拠の明示**: 復活対象の各ファイル/行を Explore 結果から特定済み (App.tsx L13/L20/L41-43/L91-105、各 Screen は変更不要)。物理廃止の本質原因はコード上で対策済みであることを 6 ファイル一次情報で確認済み (本プラン Context 参照)
- [x] **テストケースの網羅性**: 正常系 (idle→charge→cake→finale 通し) / 境界値 (100% 到達直後遷移) / 異常系 (タップ取りこぼし時の冗長経路発火) / 回帰系 (replay 後の再起動 BGM 復活) を網羅 (本プラン「テストケース」参照)
- [x] **実行方針の確定**: Phase 1 (App.tsx 編集) はサブ sonnet 委譲 / Phase 2 (検証) はメイン opus 直接実施 / Phase 3 (実機) はユーザー手動。並行起動なし (App.tsx 単一ファイル編集のため順次)
- [x] **スコープの限定**: 「対象外スコープ」で 6 件 (各 Screen 本体修正 / hooks 修正 / 新機能 / ゆめかわテーマ変更 / 効果音追加 / GH Pages デプロイ) を明示

---

## Context

前セッション (2026-05-26 / kb 0853 ノート) で iOS Safari 致命バグへの最終対策として画面 1 (Idle) と画面 2 (Charge) を物理廃止し、Cake → Finale の 2 画面構成に縮小した。今回ユーザーから「完全版を作りたい」との要望を受け、4 画面構成 (Idle → Charge → Cake → Finale) を復活させる。

Explore 調査 (一次情報 11 ファイル) の結論:

1. **IdleScreen.tsx / IdleScreen.css / ChargeScreen.tsx / ChargeScreen.css は完全な状態で残存**
2. **全 iOS Safari 対策がコンポーネント側に実装済み** (3 経路イベント + button overlay + tappedRef / onPhaseChangeRef + 同期即時遷移 + chargeAmount>=0.999 二重保険 / useMemo + warmup pattern / onPointerCancel + onPointerLeave + setPointerCapture)
3. **物理廃止の直接原因となったバグへの対策は全てコード上に存在**
4. **未使用化は App.tsx の 3 箇所のみで実施** (Phase 型から idle/charge 除外、初期値 cake、import 削除)
5. **App.tsx に wiring を復活させるだけで完全版が動作する**

これは本来プロジェクト CLAUDE.md L65-75 (iOS 検証チェックリスト) と前回新設した自己レビュー体制を **初運用で実証する** タスクでもある。視覚 artifact + iOS webkit + 実機の三段階検証で判定する。

---

## 対応策一覧

### 対応策 1 (P1, 必須): App.tsx Phase 型を 4 値に復元

**対象**: `src/App.tsx` L13

**Before**:
```ts
type Phase = 'cake' | 'finale';
```

**After**:
```ts
type Phase = 'idle' | 'charge' | 'cake' | 'finale';
```

**Why**: TypeScript の網羅性チェックで未対応 Phase の早期検出を有効化するため。

---

### 対応策 2 (P1, 必須): App.tsx 初期 Phase を 'idle' に戻す

**対象**: `src/App.tsx` L20

**Before**:
```ts
const [phase, setPhase] = useState<Phase>('cake');
```

**After**:
```ts
const [phase, setPhase] = useState<Phase>('idle');
```

**Why**: 完全版 4 画面の起点に戻す。

---

### 対応策 3 (P1, 必須): IdleScreen / ChargeScreen の import 復元

**対象**: `src/App.tsx` L4-8 付近 (CakeScreen / FinaleScreen の隣)

**追加**:
```ts
import { IdleScreen } from './components/IdleScreen';
import { ChargeScreen } from './components/ChargeScreen';
```

**Why**: 復活する画面コンポーネントを利用可能にする。

---

### 対応策 4 (P1, 必須): loadSound に Idle/Charge 用音源 7 種を追加

**対象**: `src/App.tsx` L41-43 付近 (現在 `se_cracker` / `bgm` のみロード中)

**追加する音源 (constants.ts SOUNDS に既に定義済み)**:
- `intro_bgm` — Idle/Charge 中の BGM
- `se_pop` — Idle 画面のキラキラ
- `se_letter` — Charge 画面の文字出現
- `se_sparkle` — 装飾
- `se_swipe` — スワイプ開始 SE
- `se_halfway` — 50% 到達 SE
- `se_charge_loop` — スワイプ中ループ音

**実装パターン**: 現状 `se_cracker` / `bgm` で使われている `loadSound('key', SOUNDS.path)` パターンを 7 件分追加。

**Why**: 完全版に必要な音源を初期化時に並行ロード。ファイル未配置時は既存の loadSound 失敗フォールバックで無音動作。

---

### 対応策 5 (P1, 必須): intro_bgm 制御の追加

**対象**: `src/App.tsx` 全体

**実装内容**:
- `bgmStartTimerRef` (L24 既存) と並んで `introBgmStartedRef` 等の制御 ref を追加
- 初回 Idle タップ (= handleIdle) で `intro_bgm` を loop 再生開始
- Cake 遷移 (= handleCharge) で `intro_bgm` を停止 + 既存の 1 秒遅延 BGM (`bgm` キー) 再生に切替
- handleReplay 内で `intro_bgm` も含めて全停止 → 'idle' に戻すので intro_bgm は次回の handleIdle で再開

**Why**: 元設計では Idle/Charge 期間中に intro_bgm がループしていたはずなので、原状回復。Cake 以降の BGM とは別ソース。

---

### 対応策 6 (P1, 必須): handleIdle 新規追加 (idle → charge)

**対象**: `src/App.tsx` handler 群 (L45-80 付近)

**実装**:
```ts
const handleIdle = useCallback(() => {
  sound.warmup();
  void sound.resume();
  void sound.playSound('intro_bgm', { loop: true, volume: 0.5 }); // 既存 playSound API に応じて調整
  setPhase('charge');
}, [sound]);
```

**Why**:
1. **warmup を idle 遷移時にも実行** ← Explore 結論「IdleScreen から ChargeScreen への遷移時に handleIdle 内で sound.warmup() を呼ぶ必要がある」(現状 handleBlow / Cake タップ時しか warmup していない)
2. iOS Safari の AudioContext を idle タップの user-gesture 同期コンテキスト中で起こす (kb L71-87 の warmup pattern)

---

### 対応策 7 (P1, 必須): handleCharge 新規追加 (charge → cake)

**対象**: `src/App.tsx` handler 群

**実装**:
```ts
const handleCharge = useCallback(() => {
  sound.stopSound('intro_bgm');
  void sound.playSound('se_cracker'); // 既存 handleBlow の cracker パターンを流用
  setPhase('cake');
}, [sound]);
```

**Why**: Charge 終了 → Cake 開始の節目に音響の切替を入れる (intro_bgm を止めて cracker を一発)。

---

### 対応策 8 (P1, 必須): ChargeScreen サブ handler 4 種を新規追加

**対象**: `src/App.tsx` handler 群

ChargeScreen.tsx L8-14 の props 仕様に対応する handler:

| Handler | SE | 発火条件 |
|---------|-----|---------|
| `handleLetterAppear` | se_letter | 文字が画面に出現 |
| `handleSwipeStart` | se_swipe | 初回スワイプ開始 |
| `handleSwipeActive` (active: boolean) | se_charge_loop start/stop | スワイプ中ループ音制御 |
| `handleHalfway` | se_halfway | 50% 到達 |

**Why**: ChargeScreen が定義する props インターフェースを完全実装。各 handler は単純な playSound 呼び出しに留め、ロジックは ChargeScreen に閉じる。

---

### 対応策 9 (P1, 必須): JSX 分岐に idle/charge を追加

**対象**: `src/App.tsx` JSX L91-105 付近

**追加 (cake 分岐の前に挿入)**:
```tsx
{phase === 'idle' && <IdleScreen onPhaseChange={handleIdle} />}
{phase === 'charge' && (
  <ChargeScreen
    onPhaseChange={handleCharge}
    onLetterAppear={handleLetterAppear}
    onSwipeStart={handleSwipeStart}
    onSwipeActive={handleSwipeActive}
    onHalfway={handleHalfway}
  />
)}
```

**Why**: Phase に応じたコンポーネント描画。既存の cake/finale 分岐と同じパターン。

---

### 対応策 10 (P1, 必須): handleReplay を 'idle' 戻りに修正

**対象**: `src/App.tsx` L58-66 (handleReplay)

**Before** (現状):
```ts
const handleReplay = useCallback(() => {
  sound.stopSound('bgm');
  setReplayCount((c) => c + 1);
  setPhase('cake');
}, [sound]);
```

**After**:
```ts
const handleReplay = useCallback(() => {
  sound.stopSound('bgm');
  sound.stopSound('intro_bgm');
  setReplayCount((c) => c + 1);
  setPhase('idle');
}, [sound]);
```

**Why**: 完全版なので「もう一度遊ぶ」は最初の Idle 画面に戻す。intro_bgm は次回の handleIdle で再開。

---

## 検証 (V-1 artifact 必須セット)

新しい skill.md L373-384 と project CLAUDE.md L65-75 (iOS Safari 検証チェックリスト) に従い、以下 3 段階で検証する。

### 検証 1 (P1, 必須): Playwright Chromium + iPhone UA エミュレーション

**目的**: 自動回帰テスト。既存 `playwright.config.ts` 設定 (Chromium + iPhone 14 UA, viewport 390x844, isMobile, hasTouch) で `tests/screenshots.spec.ts` を実行。

**実行**:
```bash
npm run build && npx playwright test
```

**判定基準**:
- idle / charge / cake / finale の 4 フェーズすべてで screenshot が撮影される (現状 idle 起点に戻せばそのまま動作する見込み — Explore 結論)
- 各遷移が timeout なく完了する
- console error が 0 件

**artifact 記録先**: `docs/verification/restore-idle-charge-screens-results.md` の「検証 1」セクション

---

### 検証 2 (P2, 推奨): Playwright webkit プロジェクト追加 (iOS Safari エンジン)

**目的**: 実機 iOS Safari に最も近い WebKit エンジンで検証する。`playwright.config.ts` 現状コメント L3 「WebKit ブラウザは未インストール」を解消する。

**手順**:
1. `npx playwright install webkit` を実行
2. `playwright.config.ts` の projects 配列に以下を追加:
   ```ts
   {
     name: 'webkit-iphone',
     use: {
       ...devices['iPhone 14'],
       baseURL: 'http://localhost:4173', // 本番 URL ではなく vite preview を使用
     },
   }
   ```
3. `npm run preview` を `run_in_background: true` + `> /tmp/preview.log 2>&1` で起動
4. `npx playwright test --project=webkit-iphone` 実行

**判定基準**:
- 4 フェーズすべて Chromium と同様に PASS
- 特に IdleScreen タップ取りこぼし・ChargeScreen 100% 遷移失敗が **webkit でも** 再発しないこと
- AudioContext 関連の console warning は許容 (実機でないと完全再現できないため)

**スキップ条件**: webkit install で >300MB 追加 + 実機検証で代替可能なため、ユーザーが webkit セットアップを希望しない場合は検証 2 をスキップして検証 3 で代替。

**artifact 記録先**: 「検証 2」セクション、または「スキップ理由」を明記。

---

### 検証 3 (P1, 必須): iPhone Safari 実機テスト

**目的**: 最終ゲート。自動テストで再現不能な iOS 固有挙動 (タップ合成イベント、AudioContext 起動、GIF キャッシュ、Low Power Mode) を最終確認。

**手順**: ユーザーが iPhone Safari で `https://imay4th.github.io/happy-bday-kocchan/` (デプロイ後) にアクセスし以下を確認:

| # | 確認項目 | 期待 |
|---|---------|------|
| 1 | 起動直後に Idle 画面が表示される | ハートのチャージ画面ではなく従来の画面1 |
| 2 | Idle 画面のタップが 1 回で反応する (取りこぼしなし) | 旧バグの再発防止確認 |
| 3 | Charge 画面でスワイプチャージが累積する | 100% 達成可能 |
| 4 | 100% 達成後に Cake 画面へ確実に遷移する | 旧バグの再発防止確認 |
| 5 | Idle タップ時点で intro_bgm が鳴り始める | warmup pattern が動作 |
| 6 | Cake 遷移時に intro_bgm が止まり 1 秒後に bgm が始まる | BGM 切替が動作 |
| 7 | Cake → Finale → Replay → Idle のループが破綻なく動作 | 状態管理確認 |
| 8 | Low Power Mode でも 1-3 のクリティカルパスが動作 (確認できるなら) | 実機固有 |

**artifact 記録先**: 「検証 3」セクション、各項目 PASS/FAIL を記録。

---

## 実装手順

### Phase 1: App.tsx 編集 (サブ sonnet 委譲)

| Step | 担当 | モデル | 内容 |
|------|------|--------|------|
| 1.1 | サブ (実装) | sonnet | `src/App.tsx` への対応策 1-10 を **単一ファイル全面書き換え (Write)** で実施。10 箇所改訂のため 1 ファイル 5 箇所以上ルール (skill.md L82) で Write 一括 |
| 1.2 | メイン | opus | 1.1 の結果を Read で独立確認、対応策 10 件が全て反映されていることを項目別に検証 |
| 1.3 | メイン | opus | `npm run build` 実行 (背景化 + ログリダイレクト)、TypeScript エラー 0 を確認 |
| 1.4 | メイン | opus | `npm run lint` 実行、エラー 0 を確認 |

**サブ起動時のモデル選択 (Why)**:
- 1.1 は対応策本文がプランで完全確定、ファイル:行レベルで指示が出せるため sonnet。設計判断不要。
- 1.2-1.4 は独立レビュー + 決定論的検証で opus が直接実施 (T-1: レビューを実装と分離)。

**サブへの指示 (UI 変更を含むため inline 必須事項を含める)**:
- `docs/verification/restore-idle-charge-screens-results.md` に PASS/FAIL を記録すること
- Loop 上限 = 3
- 既存 IdleScreen / ChargeScreen / hooks は **絶対に触らない** (対象外スコープ参照)

---

### Phase 2: Playwright Chromium 検証 (メイン opus)

| Step | 担当 | 内容 |
|------|------|------|
| 2.1 | メイン | `npx playwright test` 実行 (Chromium + iPhone UA)、結果を `docs/verification/restore-idle-charge-screens-results.md` の「検証 1」に PASS/FAIL 記録 |
| 2.2 | メイン | 撮影された screenshot を Read で視覚確認 (skill.md L132 独立レビュー手順 3 準拠)、ファイルパスを artifact に記録 |
| 2.3 | メイン | console error がないことを確認、Playwright 出力 (`test-results/`) を確認 |

---

### Phase 3: Playwright webkit 検証 (オプション)

| Step | 担当 | 内容 |
|------|------|------|
| 3.1 | **ユーザー判断** | webkit セットアップを希望するか確認 (ディスク 300MB 追加 + install 5-10 分) |
| 3.2 (希望時) | サブ sonnet | `npx playwright install webkit` + `playwright.config.ts` に webkit-iphone プロジェクト追加 |
| 3.3 (希望時) | メイン | `npm run preview` 背景起動 + `npx playwright test --project=webkit-iphone` 実行、artifact に記録 |

---

### Phase 4: iPhone Safari 実機検証 (ユーザー手動)

| Step | 担当 | 内容 |
|------|------|------|
| 4.1 | メイン | 全変更を commit + push、GH Actions 自動デプロイ完了を待つ (約 1-2 分) |
| 4.2 | **ユーザー手動** | iPhone Safari で公開 URL にアクセス、検証 3 の 8 項目を確認 |
| 4.3 | メイン | ユーザー報告を受けて artifact に PASS/FAIL を記録、FAIL があれば再修正計画 |

---

## 対象外スコープ (今回触らない領域)

1. **`src/components/IdleScreen.tsx` 本体への修正**: iOS 対策が全て実装済み (Explore 確認)、触る必要なし
2. **`src/components/ChargeScreen.tsx` 本体への修正**: 同上
3. **`src/hooks/useSoundEffect.ts` / `useSwipeCharge.ts` への修正**: warmup pattern / useMemo / onPointerCancel/Leave / setPointerCapture が全て実装済み
4. **新機能の追加**: replay 履歴の永続化、設定画面、デバッグパネルの拡張等は別タスク
5. **ゆめかわテーマの変更**: カラー・フォント・装飾は現状維持
6. **効果音ファイルの追加配置**: `public/sounds/` の中身はユーザー責任で配置済みの前提 (未配置時はフォールバックで無音動作、kb L60 確認済み)
7. **GH Pages デプロイ作業そのもの**: commit + push のみメインが実施、デプロイは GH Actions が自動
8. **Stop Hook の settings.json 登録**: 別タスク (前セッション ROADMAP 残 Todo)。本プランは Stop Hook が登録されていなくても進行可能

---

## テストケース (機械的検証)

### テストケース 1 (検証 1 内): 正常系 — idle → charge → cake → finale 通し

1. App 起動 → idle 表示
2. Idle タップ → charge 遷移
3. スワイプチャージ累積 → 100% 達成
4. Cake 遷移 → ケーキタップ
5. Finale 遷移 → アーチ・チェキ表示

期待: 4 フェーズすべてで screenshot 取得、console error 0、各遷移 5 秒以内

### テストケース 2 (検証 1 内): 境界値 — 100% 到達直後遷移

ChargeScreen で chargeAmount === 1.0 に達した瞬間 (rAF 1 フレーム以内) に setPhase('cake') が呼ばれる

期待: useEffect 二重保険のいずれか先に発火しても多重発火なし (`transitionFiredRef` ガード)

### テストケース 3 (検証 1 内): 異常系 — 高速連打タップ

Idle 画面で 100ms 以内に 5 連打 → 1 回しか handleIdle が発火しない (tappedRef ガード)

期待: charge 遷移 1 回、intro_bgm 再生 1 回 (重複再生なし)

### テストケース 4 (検証 1 内): 回帰系 — Replay ループ

finale → 「もう一度遊ぶ」タップ → idle 表示 → Idle タップ → charge 遷移

期待: replayCount が 1 増加、intro_bgm が再開、Phase が正しく idle に戻る

### テストケース 5 (検証 3, 実機): iOS Low Power Mode

iPhone を Low Power Mode に設定して通しプレイ

期待: 全フェーズ動作 (実機固有のため自動化対象外、ベストエフォート確認)

---

## リスクと緩和策

| リスク | 影響 | 緩和策 |
|--------|------|--------|
| 物理廃止の本質原因が再発 (IdleScreen タップ取りこぼし / Charge 100% 未遷移) | 完全版が不動 | 既存対策が全て適用済みなので原則再発しない見込み。再発時は Loop 上限 3 で停止し、検証 artifact に観測根拠を記録、再修正プランを別途起こす |
| intro_bgm のループ・停止タイミングずれ | 体験劣化 (cake 遷移後も bgm が二重再生) | handleCharge 内で `stopSound('intro_bgm')` を確実に呼ぶ + replay 時も同様 |
| iOS AudioContext が idle タップで起こせない (rare) | intro_bgm 無音 | `sound.warmup()` を handleIdle 内で呼ぶ (kb L71-87 の warmup pattern)。失敗時はフォールバックで無音動作、機能的には影響なし |
| webkit install のディスク消費 | 開発体験悪化 | 検証 2 をオプション化、ユーザー判断で省略可。検証 3 (実機) が最終ゲート |
| Playwright Chromium と実機 iOS の挙動差 | 自動 PASS でも実機 FAIL | 検証 3 を必須にする。検証 1 だけで完了宣言しない |
| 復活させた結果ユーザーが「やっぱり 2 画面のほうが良い」と判断 | 手戻り | 旧版へのロールバック手順を artifact に記録 (git revert <commit>) |

---

## 完了の定義

このプラン自身の `status: completed` 条件:

- [ ] 対応策 1-10 の全て (10 件) が `src/App.tsx` に反映済み
- [ ] `npm run build` PASS
- [ ] `npm run lint` PASS (エラー 0)
- [ ] 検証 1 (Playwright Chromium): 4 フェーズ screenshot 取得 + console error 0 を artifact に PASS 記録
- [ ] 検証 2 (Playwright webkit): 実施 PASS または「ユーザー判断でスキップ」を artifact に記録
- [ ] 検証 3 (iPhone Safari 実機): ユーザー報告を artifact に記録 (PASS なら ROADMAP 残 Todo「実機最終確認」も同時に完了)
- [ ] commit + push 完了、GH Actions デプロイ成功
- [ ] ROADMAP.md 進捗ログに完了行を追加、「次のTodo」を更新

検証 3 が FAIL した場合は本プラン status を `in_progress` に保ち、再修正プランを別途起こす (旧版にロールバックする選択肢も含めてユーザー判断)。

---

## 設計原則の適用 (前回新設の自己レビュー体制を実証)

| 原則 | 本プランでの実証 |
|------|----------------|
| C-1 (帯域有限) | プラン本体は対応策 10 件を必要最小限の差分で記述、Explore の詳細結果に拡張ポインタ |
| T-1 (関心分離) | 実装 (サブ sonnet) / レビュー (メイン opus) / 検証 1-2 (メイン opus) / 検証 3 (ユーザー実機) の 4 層分離 |
| K-2.1 (ポインタ) | iOS 固有チェックは project CLAUDE.md L65-75 を参照 (本プランで再記述しない) |
| V-1 (決定論的) | docs/verification/restore-idle-charge-screens-results.md を成果物として要求、Stop Hook (登録後) で自動検出可能な形式に |
| E-2 (理由併記) | 各対応策に Why、各リスクに緩和策の理由を併記 |

新設したルール (skill.md L92-101) の「(UI/レイアウト/挙動変更を含む場合のみ必須) artifact 記録」「メイン報告時 artifact 引用必須」をサブ指示で完全適用する。これがプロセス改善の第一の本番テストとなる。
