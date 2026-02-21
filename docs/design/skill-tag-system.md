# Skill-Tag-Badge System — Design Sketch

**Status**: Design discussion complete — pending team confirmation before implementation.  
**Related PR**: https://github.com/7Spade/xuanwu-xxx/pull/25

---

## 1. Problem Statement

The `schedule` feature requires workspace managers to specify **what skills they need**
and the account layer to **match and assign personnel** from three pools:

| Pool | Model | Stored on |
|------|-------|-----------|
| Internal Teams | `Team` (type: `'internal'`) | `Account.teams[]` |
| Partner Teams | `Team` (type: `'external'`) | `Account.teams[]` |
| Individuals | `MemberReference` | `Account.members[]` |

To enable skill-based matching, every entity in these pools must be **tagged** with
proficiency-graded skills.

---

## 2. Core Vocabulary

Three domain types (see `src/domain-types/skill/skill.types.ts`):

| Type | Role | Stored on |
|------|------|-----------|
| `SkillTag` | Global library entry (what the skill is) | `Account.skillTags[]` |
| `SkillGrant` | Assignment of a skill + tier to an entity | `Team.skillGrants[]` / `MemberReference.skillGrants[]` |
| `SkillRequirement` | What a schedule proposal needs | `ScheduleItem.requiredSkills[]` |

```
Account (org)
  └─ skillTags: SkillTag[]           ← global library

  └─ teams: Team[]
       └─ skillGrants: SkillGrant[]  ← "this team has Electrical Work at Expert tier"

  └─ members: MemberReference[]
       └─ skillGrants: SkillGrant[]  ← "Alice has Project Management at Grandmaster tier"

Workspace
  └─ scheduleItems: ScheduleItem[]
       └─ requiredSkills: SkillRequirement[]
            ← "need 2× Electrical Work ≥ Expert"
```

---

## 3. Seven-Tier Proficiency Scale

| Tier | Label | XP Range (inclusive) | Colour (light) |
|------|-------|----------------------|----------------|
| 1 | Apprentice   | 0–74   | `#CCEDEB` |
| 2 | Journeyman   | 75–149 | `#A2C7C7` |
| 3 | Expert       | 150–224| `#78A1A3` |
| 4 | Artisan      | 225–299| `#4D7A7F` |
| 5 | **Grandmaster**  | 300–374| `#23545B` ← core colour |
| 6 | Legendary    | 375–449| `#17393E` |
| 7 | Titan        | 450–525| `#0A1F21` |

CSS custom properties are registered in `src/styles/globals.css` as
`--tier-N-<name>` (e.g. `--tier-3-expert`).  Dark-mode variants are also defined.

The tier palette derives from a single teal hue-ramp, darkening as rank increases,
so the darkest badges signal the rarest talent.

---

## 4. Domain Rules

Pure functions live in `src/domain-rules/skill/skill.rules.ts`:

| Function | Signature | Description |
|----------|-----------|-------------|
| `resolveSkillTier(xp)` | `(number) → SkillTier` | Derive tier from XP |
| `getTierDefinition(tier)` | `(SkillTier) → TierDefinition` | Full metadata for a tier |
| `getTierRank(tier)` | `(SkillTier) → number` | Numeric rank (1–7) |
| `tierSatisfies(granted, minimum)` | `(SkillTier, SkillTier) → boolean` | Does granted tier ≥ minimum? |
| `grantSatisfiesRequirement(grants, req)` | `(SkillGrant[], SkillRequirement) → boolean` | Does the entity meet a specific requirement? |

`TIER_DEFINITIONS` is the single source of truth for all tier metadata.

---

## 5. Firestore Schema Extension

### `organizations/{orgId}` (Account document)

```json
{
  "skillTags": [
    {
      "id": "tag-abc123",
      "name": "Electrical Work",
      "slug": "electrical-work",
      "category": "Construction",
      "createdAt": "<Timestamp>"
    }
  ]
}
```

### `organizations/{orgId}` — teams array element

```json
{
  "id": "team-xyz",
  "name": "Alpha Crew",
  "type": "internal",
  "memberIds": ["uid-1", "uid-2"],
  "skillGrants": [
    { "tagId": "tag-abc123", "tier": "expert", "xp": 180 }
  ]
}
```

### `organizations/{orgId}` — members array element

```json
{
  "id": "uid-1",
  "name": "Alice",
  "skillGrants": [
    { "tagId": "tag-abc123", "tier": "grandmaster", "xp": 310 }
  ]
}
```

### `scheduleItems/{itemId}` — or inline on ScheduleItem

```json
{
  "title": "Main Panel Upgrade",
  "requiredSkills": [
    { "tagId": "tag-abc123", "minimumTier": "expert", "quantity": 2 }
  ]
}
```

---

## 6. Matching Flow (Manual)

```
WorkspaceSchedule proposes item with requiredSkills
        ↓
AccountScheduleSection receives PROPOSAL
        ↓
Admin opens "Assign" panel
        ↓
System queries Account.teams + Account.members
  → filters by grantSatisfiesRequirement(entity.skillGrants, req)
        ↓
Admin selects entities → stored in ScheduleItem.assigneeIds
        ↓
Proposal approved → becomes OFFICIAL
```

---

## 7. AI-Agent Readiness

All identifiers are designed for semantic clarity:

- `SkillTier` literals (`'expert'`, `'grandmaster'`) are LLM-safe tokens
- `SkillTag.slug` (e.g. `"electrical-work"`) provides unambiguous tag identity
- `SkillRequirement.quantity` expresses headcount as a plain integer
- `tierSatisfies()` / `grantSatisfiesRequirement()` are pure, deterministic functions
  the AI can replicate in a prompt or call via a Genkit tool

Future Genkit flow entry point (not yet implemented):
```typescript
// genkit-flows/schedule/auto-assign.flow.ts
// input: ScheduleItem with requiredSkills
// output: suggested assigneeIds ranked by tier score
```

---

## 8. UI Component Plan (pending implementation)

| Component | Location (proposed) | Shadcn primitives |
|-----------|---------------------|-------------------|
| `SkillBadge` | `src/shared/shadcn-ui/skill-badge.tsx` (or view-modules) | `Badge` + CSS var |
| `SkillTagPicker` | `view-modules/schedule/_components/` | `Command` + `Badge` |
| `SkillGrantEditor` | account settings / member editor | `Command` + `Badge` + `Slider` |
| `SkillRequirementForm` | `WorkspaceSchedule` proposal dialog | `Command` + `Input` |

`SkillBadge` renders a `Badge` with inline style `backgroundColor: var(--tier-N-name)`
and a dark/light text colour derived from the tier rank (tiers 5–7 need white text).

---

## 9. Open Questions (for team discussion)

1. **Tag library granularity** — Should `category` be a fixed enum or a free string?  
   *Proposal*: Free string for now; enum after we see real usage patterns.

2. **XP vs. direct tier** — Should admins set XP or pick the tier directly?  
   *Proposal*: Direct tier selection in UI (simpler); store `xp` as the midpoint of
   the tier range for future precision. `resolveSkillTier(xp)` is the canonical source.

3. **Team-level vs. member-level grants** — When a team is assigned, should the system
   auto-resolve individual members for shift tracking?  
   *Proposal*: Out of scope for v1; teams are assigned as units.

4. **Firestore sub-collection vs. inline array** — `skillTags` is stored as an array
   on the org document. With many tags (hundreds), this may approach document size limits.  
   *Proposal*: Migrate to `/organizations/{orgId}/skillTags/{tagId}` sub-collection when
   tag count > 50.  The type definitions are sub-collection-compatible.

---

## 10. Design Discussion — XP System Architecture

> **Status**: Pending team confirmation. No code changes until consensus is reached.

---

### 10-A. 問題一：經驗值來源 — 任務 vs 工作區結束？

#### 現有任務生命週期（從程式碼觀察）

```
WorkspaceTask.progressState:
  todo → doing → completed (等待 QA) → verified (等待驗收) → accepted (完成)
```

`WorkspaceLifecycleState`:
```
preparatory → active → stopped
```

已知事件匯流排已定義以下事件：
- `workspace:tasks:completed` — 任務完成
- `workspace:qa:approved` + `approvedBy: string` — QA 通過
- `workspace:acceptance:passed` + `acceptedBy: string` — 驗收通過
- `workspace:tasks:scheduleRequested` — 任務觸發排班申請

#### 分析

| 來源觸發點 | 優點 | 缺點 |
|-----------|------|------|
| `progressState === 'accepted'` (任務驗收) | 細粒度、有 `assigneeId` 指向具體人員、必須通過 QA + 驗收雙重關卡、難以造假 | 需要逐任務追蹤 |
| `lifecycleState === 'stopped'` (工作區結束) | 單一重大里程碑 | 無法歸因到個人、一個大工作區可能延誤很久才結束、激勵過早關閉工作區 |
| 兩者結合 | 兼顧 | 需要防止同一工作的 XP 重複計算 |

#### 建議方案：**任務驗收為主，工作區完成為補充獎勵**

```
主要 XP 來源：
  WorkspaceTask.progressState === 'accepted'
  → XP += f(task.subtotal)     ← 正比於任務工程價值
  → 歸因：task.assigneeId (個人) 或 scheduleItem.assigneeIds (團隊/夥伴)

補充獎勵：
  WorkspaceLifecycleState === 'stopped' 且所有任務均 accepted
  → 全體參與者各獲得小額固定 Bonus XP (e.g., +5 XP)
  → 補充「工程完整性」而非主要積分
```

**核心理由**：
1. `accepted` 狀態是整個任務鏈中驗證最嚴的終點（需要 QA → 驗收兩道關）
2. `task.assigneeId` 已提供個人歸因的天然錨點
3. `task.subtotal`（工程金額）提供 XP 數量的自然比例依據，難以人為膨脹
4. 工作區結束獎勵金額極小，不足以作為主要刷分動機

#### XP 計算函數建議

```
個人 XP(task) = clamp(log10(task.subtotal + 1) × 10, 1, 15)
```

| subtotal | XP 獲得 |
|----------|---------|
| 100      | ≈ 20    |
| 1,000    | ≈ 30    |
| 10,000   | ≈ 40    |
| 100,000  | ≈ 50    |

使用對數曲線的原因：避免高金額任務讓 XP 暴增（防止「接大案刷等級」漏洞）。
上限 50 XP / 任務確保進入最高階需要多次驗收，而非單一超大任務。

---

### 10-B. 問題二：團隊/夥伴/個人的 XP 分配公平性

#### 本質問題

程式碼中，`Team` 和合作夥伴團隊（`Team.type === 'external'`）本質上都是多人
組成的實體，而 `WorkspaceTask.assigneeId` 是一個單一 `string`，無法直接對應到
「整個團隊」。

```
問題：
- Task 指派給 Alice（個人）→ 非常清楚
- Schedule 指派給「Alpha Crew 團隊」→ 誰得 XP？所有成員？還是團隊實體本身？

漏洞風險：
- 重複計算：Alice 既在團隊 A，又在團隊 B，若同一任務的 XP 廣播給所有隸屬團隊，
  她可能從同一工作中獲得多次 XP
- 搭便車：不做事的成員跟著得 XP
- 空殼膨脹：建立大量團隊成員然後刷 XP
```

#### 解決方案：雙帳本架構（Dual-Ledger Architecture）

關鍵洞察：**個人熟練度** 和 **團隊交付信譽** 是兩個不同的概念，
應使用兩個獨立的 XP 軌道，對應到不同的觸發來源。

| 帳本 | 持有者 | XP 觸發來源 | 意義 |
|------|--------|------------|------|
| 個人 XP | `MemberReference.skillGrants[].xp` | `WorkspaceTask` `accepted` | 該個人有多熟練？ |
| 實體 XP | `Team.skillGrants[].xp` | `ScheduleItem` 狀態轉為 `OFFICIAL`（帳戶 Admin 審核通過） | 該團隊/夥伴有多可靠？ |

##### 個人 XP 流程（無漏洞）

```
WorkspaceTask.progressState: accepted
  → task.assigneeId === member.id  ← 一對一，無廣播
  → member.skillGrants 中對應 tagId 的 xp += Δ
  → 觸發條件：task 必須有關聯的 SkillTag（透過 schedule 的 requiredSkills）
```

漏洞防護：
- 只有 `assigneeId` 直接指向的個人才得 XP，不廣播給所屬團隊的其他成員
- 個人加入多個團隊不影響個人 XP 計算——因為 XP 來自任務指派，不來自成員資格

##### 實體 XP 流程（防搭便車）

```
ScheduleItem.status: PROPOSAL → OFFICIAL  (帳戶 Admin/Owner 審核通過)
  → scheduleItem.assigneeIds.includes(team.id)  ← 明確指派的實體
  → Team.skillGrants 中對應 tagId 的 xp += Δ
  → 觸發條件：ScheduleItem 必須有 requiredSkills 且 Admin 批准
```

漏洞防護：
- 實體 XP 來自「帳戶治理層審核通過的排班」，無法自授
- 只有被明確列入 `assigneeIds` 的實體才得 XP，不廣播給所有工作區成員
- 合作夥伴的 `expiryDate` 自然限制了其 XP 累積期限

##### 為什麼不讓個人 XP 從團隊任務中自動分配？

```
危險的方案（❌ 不採用）：
  Team 得 XP → 分配給所有 team.memberIds → 每個成員都得 XP

問題：
1. Alice 可以是 10 個團隊的成員，同一個排班她得 10× XP
2. 不活躍成員只靠掛名就累積 XP
3. 外部夥伴成員無法追蹤實際貢獻
```

```
正確的方案（✅ 採用）：
  個人 XP ← 任務驗收（唯一來源，需明確 assigneeId）
  實體 XP ← 排班審批（治理層驗證，明確指定實體）
  兩者互相獨立，不互相換算
```

##### 完整防漏洞清單

| 漏洞類型 | 防護機制 |
|---------|---------|
| 刷任務 XP | `accepted` 需通過 QA + 驗收；XP 上限 50/任務；對數縮放 |
| 搭便車（團隊） | 實體 XP 只歸被指派的團隊，不廣播給成員 |
| 空殼帳號膨脹 | 個人 XP 需 `assigneeId` 直指，且任務需有 SkillTag 關聯 |
| 自授 XP | 實體 XP 需 Admin/Owner 批准排班，非自動；個人 XP 需他人驗收任務 |
| 多重身分重複 | 個人 XP 與成員資格無關，不因加入多個團隊而倍增 |
| 外部夥伴濫用 | 合約到期後自動停止累積；XP 歷史保留但不再增加 |
| 工作區速通 | 工作區獎勵 XP 很小（+5），不足以作為動機 |

---

### 10-C. 問題三：應設計哪些頁面，安置於何處？

基於程式碼現有路由結構分析，共識別出 **5 個 UI 區域**。
全部利用現有路由，無需新增頂層路由段。

#### 區域 A：全域技能標籤庫管理

```
位置：view-modules/account/settings/
路由：已有 app/dashboard/account/settings/page.tsx
```

**職責**：僅 Owner/Admin 可見

| UI 元素 | 描述 |
|--------|------|
| 技能標籤列表 | 顯示現有 `SkillTag[]`，含 name / slug / category |
| 新增標籤 | Command + Input，輸入 name 自動生成 slug |
| 分類管理 | 自由字串 category（初期不強制 enum） |
| 刪除標籤 | 帶 confirmation，刪除前檢查是否有 SkillGrant 引用 |

**理由**：技能標籤是組織資產，自然納入 Account 設定頁，
如同現有的 `updateOrganizationSettings` 操作邊界。

---

#### 區域 B：個人技能授予（成員資料卡內嵌）

```
位置：view-modules/members/members-view.tsx 的成員卡片
路由：已有 app/dashboard/account/members/
```

**職責**：Owner/Admin 可編輯；成員本人可查看（唯讀）

| UI 元素 | 描述 |
|--------|------|
| `SkillGrantList` | 成員卡片底部顯示已授予技能的 `SkillBadge` 列表 |
| 編輯入口 | 點擊「管理技能」打開一個 Sheet |
| `SkillGrantEditor` | Command 選擇 tag + 直接選擇 SkillTier（下拉） |
| XP 顯示 | 只讀，顯示目前 xp 值和進度條 |

**架構位置**：`view-modules/members/` （已存在）

---

#### 區域 C：團隊 / 夥伴技能授予（Detail View 內嵌）

```
位置 (內部團隊)：view-modules/teams/team-detail-view.tsx
路由：已有 app/dashboard/account/teams/[id]/page.tsx

位置 (外部夥伴)：view-modules/partners/partner-detail-view.tsx
路由：已有 app/dashboard/account/partners/[id]/page.tsx
```

**職責**：Owner/Admin 可編輯

| UI 元素 | 描述 |
|--------|------|
| 技能徽章區塊 | Team 卡片新增 "Team Skills" 區塊，顯示 `SkillBadge` 列表 |
| `SkillGrantEditor` (Team) | 同區域 B，但授予對象是 `Team.skillGrants` |
| XP 進度 | 顯示團隊在每個技能的 XP 和等級 |

**架構位置**：`view-modules/teams/` + `view-modules/partners/` （均已存在）

---

#### 區域 D：排班提案中的技能需求表單

```
位置：view-modules/schedule/_components/proposal-dialog.tsx（已存在）
路由：app/dashboard/workspaces/[id]/@modal/(.)schedule-proposal/（已存在）
```

**職責**：Workspace Manager/Contributor 在提案時填寫

| UI 元素 | 描述 |
|--------|------|
| `SkillRequirementForm` | 提案 Dialog 下方新增「技能需求」區塊 |
| 新增需求列 | Command 選擇 SkillTag + 下拉選 minimumTier + 數字 Input 填 quantity |
| 需求摘要 | 所有已添加需求以 Chip 形式顯示，可刪除 |

**架構位置**：`view-modules/schedule/_components/`（已存在），
只需在 `proposal-dialog.tsx` 末尾增加此區塊。

---

#### 區域 E：帳戶排班審批面板中的智慧指派面板

```
位置：view-modules/schedule/_components/governance-sidebar.tsx（已存在）
路由：app/dashboard/account/schedule/（已存在）
```

**職責**：Org Admin/Owner 審批提案並指派人員

| UI 元素 | 描述 |
|--------|------|
| 提案技能需求摘要 | 顯示 `scheduleItem.requiredSkills[]` |
| 候選人列表 | 依需求技能過濾 Teams + Members，顯示 `SkillBadge` |
| 技能符合度指標 | 每位候選人旁顯示「符合 N/M 個需求」 |
| 指派操作 | 選取並保存到 `scheduleItem.assigneeIds` |

**架構位置**：`view-modules/schedule/_components/`（已存在），
擴展現有 `governance-sidebar.tsx` 的提案卡片。

---

### 10-D. 頁面地圖總覽

```
app/dashboard/
  account/
    settings/           ← 區域 A：技能標籤庫管理（新增 Tab 或 Section）
    members/            ← 區域 B：個人技能授予（成員卡片內嵌）
    teams/[id]/         ← 區域 C：團隊技能授予（Detail View 內嵌）
    partners/[id]/      ← 區域 C：夥伴技能授予（Detail View 內嵌）
    schedule/           ← 區域 E：智慧指派面板（治理側邊欄擴展）
  workspaces/[id]/
    @modal/(.)schedule-proposal/  ← 區域 D：技能需求表單（提案 Dialog 擴展）
```

**關鍵設計原則**：所有 5 個區域均利用現有路由和 view-module，
無需建立新的頂層路由段，完全符合奧卡姆剃刀定律。

---

### 10-E. 組件樹與 Shadcn 映射

```
SkillBadge (最小單位)
  └─ shadcn/Badge + CSS var(--tier-N-name)
  └─ 文字顏色：tier 1-4 用深色文字，tier 5-7 用白色文字

SkillGrantList (成員/團隊卡片中的技能列表)
  └─ 水平排列的 SkillBadge[]
  └─ 截斷超過 5 個時顯示 "+N more"

SkillGrantEditor (Sheet 內的編輯器)
  └─ shadcn/Command (搜索技能標籤)
  └─ shadcn/Select (選擇 SkillTier)
  └─ shadcn/Button (確認授予 / 移除)

SkillRequirementForm (提案 Dialog 中)
  └─ shadcn/Command (搜索技能標籤)
  └─ shadcn/Select (minimumTier)
  └─ shadcn/Input[type=number] (quantity)
  └─ SkillBadge (顯示已添加的需求)

SkillMatchPanel (治理側邊欄中)
  └─ SkillGrantList (候選人技能)
  └─ shadcn/Badge (符合度：3/3 ✓ 或 1/2 ⚠)
  └─ shadcn/Checkbox (多選指派)
```

---

### 10-F. 待確認事項（請團隊回應）

> 以下議題請在實施前達成共識

| # | 議題 | 方案 A | 方案 B | 建議 |
|---|------|--------|--------|------|
| F-1 | 個人 XP 歸因 | 只從有 SkillTag 關聯的 Task 累積 | 所有 accepted Task 均累積 | **方案 A**（確保 XP 對應技能） |
| F-2 | XP 計算公式 | 對數縮放（log10(subtotal)×10） | 線性縮放（subtotal/100） | **方案 A**（防暴增） |
| F-3 | 工作區完成獎勵 | 小額固定 Bonus (+5 XP) | 不設工作區獎勵 | 待討論 |
| F-4 | Team XP 對個人的影響 | 完全獨立，不互換 | Team XP 可部分轉化個人 | **完全獨立**（防漏洞） |
| F-5 | 管理員手動調整 | 允許 Owner 手動設置 tier（直接設定，不過 XP） | 完全由計算決定 | **允許手動**（行政彈性） |
| F-6 | 技能標籤分類 | 自由字串（v1） | 預設枚舉類別 | **自由字串先行** |
