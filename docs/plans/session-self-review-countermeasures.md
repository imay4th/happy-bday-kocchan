---
status: completed
type: process-improvement
created: 2026-05-26
project: 20260525_誕生日お祝いアプリ
scope: global (~/.claude/skills/dev1-start, ~/.claude/CLAUDE.md) + project (CLAUDE.md)
related_kb: kb/development/20260525_誕生日お祝いアプリ/2026-05-26-0853_ios-safari-tap-bgm-2gamen-ka.md
related_skills: dev1-start, review-agent-essence
---

# セッション自己レビュー体制の強化対応策

**実行推奨モデル**: opus[1m] / **effortLevel**: high
(理由: グローバル skill.md / CLAUDE.md / プロジェクト CLAUDE.md の3層改訂 + Stop Hook 設計 + 自己レビュー設計判断を含むため。)

## ExitPlanMode 前セルフチェック (4 項目)

- [x] **根拠の明示**: 各対応策に「Why」を併記。事象の再発条件・観測根拠 (kb ノート L98-106) を引用
- [x] **テストケースの網羅性**: 「次回 UI 変更タスクで視覚確認をスキップしない」を Stop Hook の動作確認 (テストケース 1) + AI 行動観察 (テストケース 2-3) で機械的に検証
- [x] **実行方針の確定**: 各 skill.md/CLAUDE.md 編集の担当 (メイン/サブ) とモデル (sonnet/opus) を明記、Phase 1 の 3 編集は並行起動
- [x] **スコープの限定**: 「対象外スコープ」セクションで触らない領域 8 件を明示

---

## Context

前回セッション (2026-05-26 / 誕生日お祝いアプリ) で iOS Safari 実機の致命バグ多発の中、ユーザーから3点を指摘された:

1. `dev1-start/skill.md` L324 の視覚確認が「必要に応じて」という条件付き表現で過小評価され、ビルド/lint pass のみで完了宣言、iOS 実機で初めて致命バグが露見
2. 効果音 11 件のような網羅性が必要なテキスト生成タスクをメインが自分で実施し抜け漏れ発生、`skill.md` L17-25 の委譲ルールはコード変更基準 (3 ファイル/50 行) しかなくテキスト生成タスクの判断基準が未明文化
3. 実装サブの完了条件テンプレ (`skill.md` L60-62) が `npm run build` のみで、UI 変更でも screenshot/視覚検証項目が無いためサブが build pass で完了宣言 → メイン素通り → 実機バグ

加えて未明文化として「サブ起動の粒度判断境界」「サブ成果物の独立レビューチェックリスト」も顕在化した。本プランはこれらをルール追記 (E-2: 理由併記) + 決定論的検証 (V-1: Stop Hook) の二層で対処する。

---

## 設計原則 (本プランが従う 5 原則)

| ID | 原則 | 本プランでの適用 |
|----|------|-----------------|
| C-1 | コンテキスト帯域は有限 | ルール本文は最小化、詳細は reference ファイルにポインタ化。skill.md への追加は計 60 行程度を目標 |
| T-1 | 関心ごとの分離 | 自己レビューを 3 層に分割: (a) メインの自己レビュー (b) サブ成果物の独立レビュー (c) Stop Hook の機械的矯正 |
| K-2.1 | ポインタは百科事典より強い | 視覚検証手順の詳細は `docs/verification/` に分離し、skill.md からは 1 行ポインタで参照 |
| V-1 | 確率的を決定論で矯正 | UI 変更時の視覚 artifact 不在を Stop Hook で機械的に検出する案を P1 で提示 |
| E-2 | ルールより理由で汎化 | 各対応策末尾に「Why」段落を必ず併記 |

---

## 対応策一覧

### 対応策 1 (P1, 必須): skill.md L320-324 の検証セクションから条件付き表現を排除

**対象ファイル**: `~/.claude/skills/dev1-start/skill.md` L320-324

**Before (現状)**:
```markdown
## 検証（各フェーズ完了時）

1. ビルド成功確認（例: `npm run build`）
2. リントエラーなし確認（例: `npm run lint`）
3. UI/レイアウト変更時は、必要に応じて Playwright でスクリーンショット撮影・computed style 確認を行い、視覚的に検証する（ビルド成功やCSS生成の確認だけでは不十分な場合がある）
```

**After (改訂方針)**:
```markdown
## 検証（各フェーズ完了時）

1. ビルド成功確認（例: `npm run build`）— **必要条件であって十分条件ではない**
2. リントエラーなし確認（例: `npm run lint`）
3. **UI/レイアウト/挙動変更を 1 行でも含む場合は必ず以下を実行する** (条件付き省略禁止):
   - 3a. Playwright で screenshot 撮影 (該当画面 / 該当 viewport / 該当 state)
   - 3b. computed style 観測 (修正対象の CSS プロパティを `evaluate` で取得)
   - 3c. 観測結果を `docs/verification/<タスク名>-results.md` に PASS/FAIL 形式で記録 (V-1 artifact 最小必須セット準拠)
   - 3d. ターゲット環境が iOS Safari の場合、Playwright の `webkit` プロジェクトで `--device='iPhone 14'` を使用する
4. 3 の artifact ファイル名はプラン名と対応させる (`docs/plans/<タスク名>-plan.md` ↔ `docs/verification/<タスク名>-results.md`)。Stop Hook がこの対応を機械的に検証する

**Why (E-2):** 「必要に応じて」「適宜」のような条件付き表現は AI に「省略可」と解釈される確率が高い (kb ノート L102 で実例観測)。条件付きを排除し、「UI 変更を含むなら例外なく実行」に固定することで、ビルド/lint pass による完了短絡を構造的に防ぐ。
```

**Why (このルール追加の理由)**: V-1「確率的を決定論で矯正」の prompt-level 強化。完了宣言の必要条件と十分条件の区別を明示することで、サブ報告を素通りさせる事故 (kb L102) を防ぐ。条件付き表現が混じると配下要素にカスケードする問題は user CLAUDE.md L46-53 の「skill.md セルフチェック」と整合。

---

### 対応策 2 (P1, 必須): 実装サブエージェント指示テンプレートの「完了条件」拡張

**対象ファイル**: `~/.claude/skills/dev1-start/skill.md` L42-65 (実装サブエージェント指示テンプレート)

**Before (L60-62 該当部のみ)**:
```markdown
## 完了条件
- [ ] `npm run build` が通ること
```

**After (改訂方針)**:
```markdown
## 完了条件
- [ ] `npm run build` が通ること
- [ ] `npm run lint` がエラー 0 件で通ること
- [ ] **(UI/レイアウト/挙動変更を含む場合のみ必須)** 以下の artifact を `docs/verification/<タスク名>-results.md` に記録すること:
  - [ ] Playwright screenshot を該当画面・該当 viewport で撮影し、ファイルパスを記載
  - [ ] 修正対象 CSS の computed style を `evaluate` で取得し、期待値と一致することを PASS/FAIL で記録
  - [ ] ターゲットが iOS Safari なら webkit プロジェクトで実行 (`--project=webkit`)
- [ ] **(網羅性が必要なテキスト生成を含む場合のみ必須)** 入力ソース (例: `public/sounds/` 直下のファイル一覧) を一次情報で引用し、出力リストとの差分を `docs/verification/` に記録
- [ ] **メイン報告時のフォーマット**: 上記 artifact ファイルのパスと PASS/FAIL の主要行を応答内に転載すること (要約禁止)

**Why (E-2):** ビルド/lint は文法・型の検証であり、UI の見た目・iOS Safari 固有の挙動・テキストの網羅性は検証しない。完了条件にこれらが含まれていないと、サブは「build pass = 完了」と宣言し、メインはそれを信用する構造になっていた (kb L104)。完了条件に「artifact ファイルへの PASS/FAIL 記録」を組み込むことで、サブ自身が決定論的検証フローを実行せざるを得なくなる。
```

**Why (このルール追加の理由)**: T-1「関心ごとの分離」の運用化。完了条件 = サブの責任範囲、artifact = メインの再検証用入力、と役割を分離する。`review-agent-essence/reference/decisive-verification.md` L38-41「サブエージェント出力の再検証 3 ステップ」と完全に整合させる。

---

### 対応策 3 (P1, 必須): 「網羅性が必要なテキスト生成」の委譲基準を新規追加

**対象ファイル**: `~/.claude/skills/dev1-start/skill.md` L17-25 (運用ルール) の直下に新規セクション追加

**追加内容**:
```markdown
### サブエージェントへの委譲基準 — テキスト生成タスク

コード変更の 3 ファイル/50 行基準に加え、以下のテキスト生成タスクはメインで実施せず **必ずサブに委譲する**:

1. **網羅性が成果物の品質を決めるリストアップ**
   - 例: ファイル一覧の列挙、効果音/画像/フォントの wire-up 対象列挙、ROADMAP の Todo 抽出、テストケース列挙
   - 判定基準: 「漏れ 1 件で機能不全が起きるか」が Yes ならサブ委譲
2. **一次情報のスキャンが必要なドラフト**
   - 例: ディレクトリツリーから対応漏れを特定、kb ノート全文から論点抽出、CHANGELOG から破壊的変更抽出

**サブへの指示テンプレート (テキスト生成版)**:

| # | 項目 | 一次情報での位置 |
|---|------|-----------------|
| 1 | ... | path:line       |

**完了条件**:
- [ ] 入力ソースのファイル数 N と出力リストの行数 N が一致することを自分で grep/wc で確認し artifact に記録
- [ ] 漏れチェック: 入力ソースの ls 結果と出力の差分を diff で示し PASS/FAIL を記録

**Why (E-2):** メインは複数タスクを同時並行で処理しており、網羅性が必要なタスクをやると注意散逸で漏れが発生しやすい (kb L103: 効果音 11 件の wire-up でメイン作成 → ユーザー指摘で発覚)。サブは単一タスクに集中でき、かつ「入力ソースと出力数の一致確認」を完了条件に組み込めば決定論的に網羅性を検証できる。コード変更基準 (3 ファイル/50 行) と並列の「テキスト網羅性基準」を明文化し、判断の確率性を下げる。
```

**Why (このルール追加の理由)**: 既存ルール (L17-25) はコード変更量しか基準にしておらず、テキスト生成タスクの粒度判断が未定義領域として残っていた (kb L103)。「メイン = 判断と統合 / サブ = 列挙と検証」の分業を確立する。

---

### 対応策 4 (P1, 必須): サブ成果物の独立レビューチェックリストを明文化

**対象ファイル**: `~/.claude/skills/dev1-start/skill.md` の「サブエージェントの効率化ルール」(L81-87) の直下に新規セクション追加

**追加内容**:
```markdown
### サブ成果物の独立レビュー (メイン必須手順)

サブが完了報告した直後、メインは以下を **省略せず順次実行** する:

1. **artifact ファイルの実在確認**: サブ報告に記載されたパスを Read で開き、存在すること + PASS/FAIL 記録があることを確認 (`decisive-verification.md` の最小必須セット準拠)
2. **artifact の主要 PASS/FAIL を応答内に転載**: 要約ではなく一次情報を引用。「サブが PASS と言った」は不十分
3. **UI 変更を含むタスクは screenshot artifact を視覚確認**: パスを Read で開き、自分の目で画像を確認する (ファイル存在だけでは不十分)
4. **網羅性タスクは入力ソースの 1 次確認**: サブが出した出力リストに対し、メインも `Glob` または `Bash(ls)` で入力ソースを 1 回だけスキャンし、件数の一致を独立検証
5. **iOS Safari 等の固有環境**: webkit プロジェクトでの実行ログが artifact に含まれていることを確認

レビューで FAIL/不整合を 1 件でも検出したら、サブに修正再委譲する (メインが代行修正しない)。再委譲時は失敗理由を artifact 引用付きで指示する。

**Why (E-2):** サブ報告を素通りさせる事故 (kb L104) は「メインが自分でも検証する手順が未定義」が根本原因。「再 Read 禁止」(L83) は調査効率化のための原則であり、検証フェーズには適用しない。検証目的の Read は L84「再Readが許容される例外」の (1)「新たな疑義」に該当する。
```

**Why (このルール追加の理由)**: T-1「関心ごとの分離」の最終層。サブの完了条件 (対応策 2) とメインの独立レビューを分けることで、二段ゲートが成立する。サブが PASS と書いても、メインの独立確認で FAIL が出れば差し戻せる。

---

### 対応策 5 (P2, 推奨): プロジェクト CLAUDE.md に iOS Safari 検証チェックリスト追記

**対象ファイル**: `C:\dev\20260525_誕生日お祝いアプリ\CLAUDE.md` の末尾に新規セクション追加

**追加内容**:
```markdown
## UI/挙動変更時の必須検証 (iOS Safari)

本プロジェクトは iPhone Safari 専用のため、UI/挙動を変更したら以下を **必ず** 実行:

1. **Playwright webkit プロジェクトで該当画面の screenshot 撮影**: `npx playwright test --project=webkit --device='iPhone 14' <spec>`
2. **AudioContext 関連変更時は warmup pattern の生存確認**: 「初回 user gesture の同期 context 中に AudioBufferSourceNode.start() を呼ぶ」が壊れていないか
3. **タッチ操作変更時の 3 経路イベント生存確認**: `onPointerDown` / `onClick` / `onTouchEnd` のどれが発火しているかを `console.log` で観測
4. **GIF を扱う場合の src フラグメント生存確認**: `<img src={`${path}#${id}`}>` の `#id` 部が削られていないか
5. **artifact 配置先**: `docs/verification/<タスク名>-results.md`

**Why:** iOS Safari は通常の Chromium デバッグツールでは観測できない固有挙動 (AudioContext 同期起動、GIF 同時表示制約、タッチ合成イベントの取りこぼし) を持つ (kb ノート L116-138)。デスクトップ Chrome で PASS でも iOS で FAIL する事故が頻発するため、プロジェクト固有チェックリストを skill.md とは別レイヤーで持つ。
```

**Why (このルール追加の理由)**: K-2.1「ポインタは百科事典より強い」。グローバル skill.md には「UI 変更は視覚検証必須」という汎用ルールだけ置き、iOS Safari 固有の確認項目はプロジェクト CLAUDE.md に分離する。グローバルが肥大化しない。

---

### 対応策 6 (P2, 推奨): user CLAUDE.md の Usage 効率化セクションに「視覚検証の優先順位」を 1 行追記

**対象ファイル**: `~/.claude/CLAUDE.md` L14-15 (Usage 効率化セクション)

**追加内容 (L15 末尾に 1 行追加)**:
```markdown
UI/挙動変更を 1 行でも含むタスクは、ビルド/lint pass のみで完了宣言しない（視覚 artifact を `docs/verification/` に必須）。詳細は `~/.claude/skills/dev1-start/skill.md` 「検証」セクション。
```

**Why (このルール追加の理由)**: C-1「コンテキスト帯域は有限」。CLAUDE.md は短い入口に保ち詳細は skill.md にポインタ化する。ただし最重要原則は入口に 1 行だけ置くことで、context compaction 後も生存しやすくする (`decisive-verification.md` L169「context compaction 希薄化」対策)。

---

### 対応策 7 (P3, 将来検討): サブ起動オーバーヘッドの粒度判断境界を明文化

**対象ファイル**: `~/.claude/skills/dev1-start/skill.md` L17-25 の直下、対応策 3 の追加とは別セクションとして追記候補

**追加内容 (案)**:
```markdown
### サブ起動の粒度判断 — 起動オーバーヘッド vs 品質ゲイン

サブ起動には固定オーバーヘッド (プロンプト構築 + context 再ロード + 報告解析) があり、以下を判断目安にする:

| 状況 | 判断 |
|------|------|
| 1 ファイル 10 行未満の修正 | メイン直接 |
| 1 ファイル 10-50 行の修正 + テストなし | メイン直接、ただし完了時セルフ視覚検証 |
| 複数ファイル、または網羅性必要 (対応策 3) | サブ委譲 |
| 調査 (2 ファイル以上) | Explore 委譲 (既存 L86) |
| プラン初稿ドラフト | Plan agent 委譲 (既存 L113) |

**Why:** サブ起動が常に正しいわけではない。10 行の typo 修正をサブに投げると、サブ起動コスト > 品質ゲインで非効率。一方、品質ゲートが必要な領域 (UI 変更・網羅性) では小規模でもサブ委譲が正解。
```

**Why (P3 で見送る理由)**: P1/P2 で「サブに委譲すべきケース」を強化したため、過剰委譲のリスクも顕在化する可能性はある。しかし現時点では過小委譲のほうが課題が大きいため、まず P1/P2 を運用し、過剰委譲の兆候が出てから P3 を導入する。

---

## 対応策の優先度マトリクス

| # | 対応策 | 優先度 | 対象ファイル | 推定行数 |
|---|--------|--------|-------------|---------|
| 1 | skill.md 検証セクションから条件付き表現排除 | **P1 (即必須)** | `~/.claude/skills/dev1-start/skill.md` L320-324 | 改訂 +10 行 |
| 2 | 実装サブテンプレートの完了条件拡張 | **P1 (即必須)** | `~/.claude/skills/dev1-start/skill.md` L60-62 | 改訂 +12 行 |
| 3 | 網羅性テキスト生成の委譲基準新規追加 | **P1 (即必須)** | `~/.claude/skills/dev1-start/skill.md` L25 直下 | 新規 +25 行 |
| 4 | サブ成果物の独立レビューチェックリスト | **P1 (即必須)** | `~/.claude/skills/dev1-start/skill.md` L87 直下 | 新規 +15 行 |
| 5 | プロジェクト CLAUDE.md に iOS 検証追記 | P2 (推奨) | `C:\dev\20260525_誕生日お祝いアプリ\CLAUDE.md` 末尾 | 新規 +15 行 |
| 6 | user CLAUDE.md に 1 行ポインタ追記 | P2 (推奨) | `~/.claude/CLAUDE.md` L15 末尾 | 改訂 +1 行 |
| 7 | サブ起動粒度判断の明文化 | P3 (将来) | `~/.claude/skills/dev1-start/skill.md` L25 直下 | 新規 +15 行 (今回見送り) |

**合計**: P1 (4 件) + P2 (2 件) で skill.md +62 行、project CLAUDE.md +15 行、user CLAUDE.md +1 行。

---

## 決定論的検証の検討 (Stop Hook / pre-commit hook)

prompt-level のルール追加 (上記 P1-P3) は確率的にしか守られない。`decisive-verification.md` L10-15 の多層防御の考え方に従い、Stop Hook で機械的矯正を併設する。

### 候補 1 (P1 強く推奨): UI 変更プランに対応する screenshot artifact 不在を Stop で検出

**目的**: 対応策 1+2 で `docs/verification/<タスク名>-results.md` を必須化したが、AI が忘れる可能性がある。Stop Hook で完了宣言を物理的に抑止する。

**スクリプト案** (`~/.claude/scripts/check-ui-verification-artifact.sh`):

```bash
#!/usr/bin/env bash
# UI 変更を含むプランに対応する artifact ファイルの存在を確認
set -e

PLAN_DIR="docs/plans"
VERIFY_DIR="docs/verification"

[ ! -d "$PLAN_DIR" ] && exit 0

# status: in_progress + type に "ui" または "frontend" を含むプランを抽出
in_progress=$(grep -lE "^status: in_progress" "$PLAN_DIR"/*.md 2>/dev/null || true)
[ -z "$in_progress" ] && exit 0

missing=()
while IFS= read -r plan; do
  # type フィールドに ui/frontend/visual を含む or 本文に "UI 変更" "screenshot" を含む
  if grep -qiE "^type:.*(ui|frontend|visual)|UI 変更|screenshot" "$plan"; then
    basename=$(basename "$plan" .md)
    expected="${VERIFY_DIR}/${basename%-plan}-results.md"
    if [ ! -f "$expected" ]; then
      missing+=("$expected (plan: $basename)")
    elif ! grep -qE "(PASS|FAIL)" "$expected"; then
      missing+=("$expected (PASS/FAIL 記録なし)")
    elif ! grep -qiE "screenshot|\.png|\.jpg" "$expected"; then
      missing+=("$expected (screenshot 言及なし — UI 変更プランなのに視覚 artifact が無い)")
    fi
  fi
done <<< "$in_progress"

if [ ${#missing[@]} -gt 0 ]; then
  echo "UI 変更プラン検証違反: 以下の artifact が未整備のため Stop を抑止します" >&2
  printf '  - %s\n' "${missing[@]}" >&2
  exit 2
fi
exit 0
```

**settings.json への追加 (ユーザー手動)**:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/scripts/check-ui-verification-artifact.sh"
          }
        ]
      }
    ]
  }
}
```

**Why:** `decisive-verification.md` L13「Stop Hook = 強(バイパス困難)」の層を実装する。「UI 変更を含むプラン」を type/本文キーワードで検出し、対応する artifact が screenshot 言及付きで存在しなければ exit 2 で Stop を抑止する。

---

### 候補 2 (P2 推奨): pre-commit hook で「サブ報告のコピペ」を検出

**目的**: メインがサブ報告を要約だけ転載し、artifact ファイルへの一次情報リンクを欠く事故を防ぐ。

**スクリプト案** (`~/.claude/scripts/check-subagent-citation.sh`):

```bash
#!/usr/bin/env bash
# commit 直前に、ROADMAP.md の進捗ログに artifact パスへの参照があるかチェック
# (UI 変更コミットに限定)

CHANGED=$(git diff --cached --name-only)
if echo "$CHANGED" | grep -qE "\.(tsx?|jsx?|css|scss)$"; then
  if [ -f "ROADMAP.md" ]; then
    last_log=$(tail -50 ROADMAP.md)
    if ! echo "$last_log" | grep -qE "docs/verification/.*\.md"; then
      echo "警告: UI 関連ファイルの変更だが ROADMAP.md 進捗ログに verification artifact 参照が無い" >&2
      echo "(コミットは続行されますが artifact パスを追記推奨)" >&2
    fi
  fi
fi
exit 0
```

**注意**: exit 1 にすると確定的すぎて誤検出時に困るため、警告のみ (exit 0) として運用しつつ累積で改善する。

**Why:** pre-commit はサブ報告素通りの最後の砦。完全に止めると誤検出のコストが高いため、warning として観測する設計。

---

### 候補 3 (P3 将来): dev-retro での累積観測

既存の週次 dev-retro (CronCreate) で `docs/verification/` 配下のファイル増加数を集計し、「UI 変更コミット数 / artifact 数」の比率が悪化したら警告する。

**Why:** `decisive-verification.md` L168「グラデュアルスライド」対策。月単位で見ないと検出できない劣化パターンに対する低頻度の retro 観測。今回のプランでは候補リストアップのみ、実装は将来。

---

## 実装手順

### Phase 1: グローバル skill.md / CLAUDE.md 改訂 (P1 + P2)

| Step | 担当 | モデル | 内容 | 並行可否 |
|------|------|--------|------|---------|
| 1.1 | サブ (実装) | sonnet | `~/.claude/skills/dev1-start/skill.md` の 4 箇所改訂 (対応策 1/2/3/4) を Edit で実施 | (1.2 / 1.3 と並行可) |
| 1.2 | サブ (実装) | sonnet | `~/.claude/CLAUDE.md` L15 末尾に 1 行追記 (対応策 6) | (1.1 / 1.3 と並行可) |
| 1.3 | サブ (実装) | sonnet | プロジェクト `CLAUDE.md` 末尾に iOS 検証セクション追記 (対応策 5) | (1.1 / 1.2 と並行可) |
| 1.4 | メイン | opus | 1.1-1.3 の独立レビュー: 改訂後ファイルを Read で確認、対応策の意図と一致するか PASS/FAIL を `docs/verification/session-self-review-countermeasures-results.md` に記録 | 1.1-1.3 完了後 |

**サブ起動時のモデル選択 (Why)**:
- 1.1-1.3 は対応策本文がプランで完全に確定しており、サブは Edit/Write するだけ。設計判断不要のため sonnet。
- 1.4 は独立レビューでメイン (opus + high) が直接担当 (T-1: レビューを実装と分離)。

### Phase 2: Stop Hook 設置 (候補 1, P1 推奨)

| Step | 担当 | 内容 |
|------|------|------|
| 2.1 | サブ (実装) sonnet | `~/.claude/scripts/check-ui-verification-artifact.sh` を新規作成、`chmod +x` 付与 |
| 2.2 | **ユーザー手動** | `~/.claude/settings.json` の `hooks.Stop` にエントリ追加 (AI は settings.json 編集不可) |
| 2.3 | メイン opus | 動作テスト: `status: in_progress` プランがあって対応 artifact が無い状態で完了しようとしたとき exit 2 で抑止されることを確認、結果を artifact に記録 |

### Phase 3: pre-commit hook (候補 2, P2)

| Step | 担当 | 内容 |
|------|------|------|
| 3.1 | サブ (実装) sonnet | `~/.claude/scripts/check-subagent-citation.sh` を新規作成 |
| 3.2 | **ユーザー手動** | プロジェクト `.git/hooks/pre-commit` または lefthook 等から呼び出し設定 |

---

## 対象外スコープ (今回触らない領域)

明示的に **このプランでは触らない領域** を以下に列挙する。スコープ拡散を防ぐため。

1. **iOS Safari 致命バグそのものの追加対策**: warmup pattern / GIF キャッシュ回避 / 3 経路イベントは既に kb ノートに記録済みで本プランの対象外。本プランは「次回これらが起きないようにする自己レビュー体制」が焦点
2. **dev2-save スキル改訂**: セッション保存フローは現状機能している。今回の課題はセッション中の検証フローに限定
3. **review-agent-essence スキル改訂**: `decisive-verification.md` は完成度が高く参照ポインタで活用、改訂対象外
4. **新規スキル作成**: 既存 dev1-start / CLAUDE.md の改訂で十分。新規スキルは context 帯域を消費するため作らない (C-1)
5. **playwright 自動 e2e 実装そのもの**: e2e の書き方ルールは `skill.md` L67-79 で別途規定済み、本プランは「実行を強制する仕組み」のみ追加
6. **ROADMAP.md / REQUIREMENTS.md フォーマット改訂**: 進捗管理フォーマットは現状維持
7. **対応策 7 (サブ起動粒度) の今回実装**: P3 として記録、実装は次回以降の判断
8. **dmm-english / kb-* / その他スキルへの波及**: 自己レビュー強化は dev1-start に閉じる

---

## テストケース (機械的検証)

「次回 UI 変更タスクで視覚確認をスキップしない」を機械的に検証する手段。

### テストケース 1: Stop Hook の動作確認 (Phase 2 完了後)

1. ダミープランを作成: `docs/plans/dummy-ui-test-plan.md`
   ```yaml
   ---
   status: in_progress
   type: ui-improvement
   ---
   UI 変更を含む
   ```
2. 対応する `docs/verification/dummy-ui-test-results.md` を **作成せず** Stop を試みる
3. **期待**: `exit 2` で Stop が抑止され、stderr に「UI 変更プラン検証違反」が表示される
4. `docs/verification/dummy-ui-test-results.md` を「`PASS: screenshot at docs/verification/dummy.png`」で作成
5. **期待**: Stop が正常に通る

### テストケース 2: skill.md 改訂後の AI 行動観察 (Phase 1 完了後)

1. 次回任意の UI 変更タスクをメインに依頼
2. **観察項目**:
   - メインが artifact ファイル名を ExitPlanMode 前に明示するか
   - 実装サブの指示プロンプトに「screenshot 必須」が含まれているか (対応策 2 の効果)
   - メインがサブ報告後に artifact を Read で確認しているか (対応策 4 の効果)
3. 1 件でも欠落すれば skill.md 追加改訂

### テストケース 3: 網羅性テキスト生成タスクの委譲挙動 (Phase 1 完了後)

1. 「`public/sounds/` 配下の全 mp3 を列挙してください」と依頼
2. **期待**: メインが自分で ls せず、サブ (sonnet) に委譲し、サブが Glob 結果と出力行数を artifact に PASS で記録
3. 失敗時: 対応策 3 のテンプレ表現を強化

### テストケース 4: 視覚 artifact 不在検出 (実例ベース)

前回セッションの「効果音 11 件 wire-up」「画面 2 廃止後の Cake 画面挙動」を題材に、改訂後 skill.md で同じシナリオを走らせる (dry-run 形式)。AI が screenshot artifact を要求するなら PASS。

---

## リスクと緩和策

| リスク | 影響 | 緩和策 |
|--------|------|--------|
| ルール追加で skill.md が肥大化 (C-1 違反) | context 帯域圧迫 | 対応策 3-4 の詳細を `~/.claude/skills/dev1-start/reference/subagent-delegation.md` に分離する選択肢を Phase 1.4 のレビュー時に判断 |
| Stop Hook 誤検出で開発が止まる | 生産性低下 | 候補 1 のスクリプトは type フィールド + 本文キーワード両方を見る。バイパス用に環境変数 `SKIP_UI_HOOK=1` を用意する設計も検討 |
| サブが artifact 作成を忘れ続ける | 改訂効果なし | テストケース 2 で 2 セッション連続して失敗を観測したら、対応策 2 の完了条件を強い文言に書き換え |
| 視覚検証の Playwright 実行コスト過大 | 開発体験悪化 | webkit プロジェクト + screenshot のみに限定、フル e2e は強制しない |

---

## 完了の定義

このプラン自身の `status: completed` 条件:

- [ ] P1 の 4 件 (対応策 1/2/3/4) が `~/.claude/skills/dev1-start/skill.md` に反映済み
- [ ] P2 の 2 件 (対応策 5/6) が反映済み
- [ ] Phase 2 の Stop Hook スクリプトが作成済み + 実行権限付与済み + ユーザーが settings.json に登録済み
- [ ] テストケース 1 が PASS で `docs/verification/session-self-review-countermeasures-results.md` に記録
- [ ] テストケース 2 のために、次回 UI 変更タスク 1 件で観察ログを同 artifact に追記する宿題を残す
- [ ] kb ノート `2026-05-26-0853_ios-safari-tap-bgm-2gamen-ka.md` L112 の「自己レビュー体制が弱い」Todo を ✅ に変更
