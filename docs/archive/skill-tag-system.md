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

Three domain types (see `src/shared/types/skill.types.ts`):

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

Pure functions live in `src/shared/lib/skill.rules.ts`:

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
// shared/ai/flows/auto-assign.flow.ts
// input: ScheduleItem with requiredSkills
// output: suggested assigneeIds ranked by tier score
```

---

## 8. UI Component Plan (pending implementation)

| Component | Location (proposed) | Shadcn primitives |
|-----------|---------------------|-------------------|
| `SkillBadge` | `src/shared/ui/shadcn-ui/skill-badge.tsx` (or features/{name}/_components) | `Badge` + CSS var |
| `SkillTagPicker` | `features/workspace-governance.schedule/_components/` | `Command` + `Badge` |
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
位置：features/user-settings/_components/
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
位置：features/workspace-governance.members/_components/members-view.tsx 的成員卡片
路由：已有 app/dashboard/account/members/
```

**職責**：Owner/Admin 可編輯；成員本人可查看（唯讀）

| UI 元素 | 描述 |
|--------|------|
| `SkillGrantList` | 成員卡片底部顯示已授予技能的 `SkillBadge` 列表 |
| 編輯入口 | 點擊「管理技能」打開一個 Sheet |
| `SkillGrantEditor` | Command 選擇 tag + 直接選擇 SkillTier（下拉） |
| XP 顯示 | 只讀，顯示目前 xp 值和進度條 |

**架構位置**：`features/workspace-governance.members/_components/` （已存在）

---

#### 區域 C：團隊 / 夥伴技能授予（Detail View 內嵌）

```
位置 (內部團隊)：features/workspace-governance.teams/_components/team-detail-view.tsx
路由：已有 app/dashboard/account/teams/[id]/page.tsx

位置 (外部夥伴)：features/workspace-governance.partners/_components/partner-detail-view.tsx
路由：已有 app/dashboard/account/partners/[id]/page.tsx
```

**職責**：Owner/Admin 可編輯

| UI 元素 | 描述 |
|--------|------|
| 技能徽章區塊 | Team 卡片新增 "Team Skills" 區塊，顯示 `SkillBadge` 列表 |
| `SkillGrantEditor` (Team) | 同區域 B，但授予對象是 `Team.skillGrants` |
| XP 進度 | 顯示團隊在每個技能的 XP 和等級 |

**架構位置**：`features/workspace-governance.teams/_components/` + `features/workspace-governance.partners/_components/` （均已存在）

---

#### 區域 D：排班提案中的技能需求表單

```
位置：features/workspace-governance.schedule/_components/proposal-dialog.tsx（已存在）
路由：app/dashboard/workspaces/[id]/@modal/(.)schedule-proposal/（已存在）
```

**職責**：Workspace Manager/Contributor 在提案時填寫

| UI 元素 | 描述 |
|--------|------|
| `SkillRequirementForm` | 提案 Dialog 下方新增「技能需求」區塊 |
| 新增需求列 | Command 選擇 SkillTag + 下拉選 minimumTier + 數字 Input 填 quantity |
| 需求摘要 | 所有已添加需求以 Chip 形式顯示，可刪除 |

**架構位置**：`features/workspace-governance.schedule/_components/`（已存在），
只需在 `proposal-dialog.tsx` 末尾增加此區塊。

---

#### 區域 E：帳戶排班審批面板中的智慧指派面板

```
位置：features/workspace-governance.schedule/_components/governance-sidebar.tsx（已存在）
路由：app/dashboard/account/schedule/（已存在）
```

**職責**：Org Admin/Owner 審批提案並指派人員

| UI 元素 | 描述 |
|--------|------|
| 提案技能需求摘要 | 顯示 `scheduleItem.requiredSkills[]` |
| 候選人列表 | 依需求技能過濾 Teams + Members，顯示 `SkillBadge` |
| 技能符合度指標 | 每位候選人旁顯示「符合 N/M 個需求」 |
| 指派操作 | 選取並保存到 `scheduleItem.assigneeIds` |

**架構位置**：`features/workspace-governance.schedule/_components/`（已存在），
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

---

## 11. XP 永久性問題 — 最優架構設計

> **觸發點**：團隊（`Team`）和夥伴（外部 `Team`）隨時可以被用戶刪除，
> 組織（`Account.accountType === 'organization'`）也可被 Owner 刪除。
> 這些刪除事件會消滅 `Account.teams[]` 和 `Account.members[]` 中的所有 XP 記錄。
> **我們該讓 XP 隨之流失，還是僅把 XP 系統擺放在個人用戶？**

---

### 11-A. 先把資料結構說清楚（從程式碼出發）

```
Firestore:
  accounts/{userId}          ← Firebase Auth 錨定，PERMANENT
    accountType: 'user'
    name, email, photoURL…

  accounts/{orgId}           ← Owner 可刪除，EPHEMERAL
    accountType: 'organization'
    members: MemberReference[]    ← 嵌入陣列，arrayRemove() 可刪除
    teams: Team[]                 ← 嵌入陣列，包含 internal + external Teams
```

關鍵觀察：`MemberReference.id` **等於** `accounts/{userId}` 的文件 ID，
也就是 Firebase Auth UID。因此每個成員都有一個永久的 Firestore 文件做錨點，
只是目前 XP 並不存在那裡。

---

### 11-B. 三種方案的完整評估

#### 方案一：接受流失（維持現狀）

```
個人 XP → accounts/{orgId}.members[].skillGrants  ← 隨 org/dismiss 消失
團隊 XP → accounts/{orgId}.teams[].skillGrants     ← 隨 org/delete 消失
```

| 優點 | 缺點 |
|------|------|
| 實作最簡單，不改現有 schema | 用戶被踢出組織就失去所有技能記錄 |
| XP 具備清晰的組織邊界 | 組織被刪除後無法重建歷史 |
| — | 用戶無法「帶走」自己的技能聲譽 |

**結論：不適合。** 技能是屬於人的，不是屬於組織的。讓組織刪除決定一個人的技能歸零，
邏輯上說不通。

---

#### 方案二：完全移到個人帳戶（User-Only）

```
個人 XP → accounts/{userId}.skillGrants  ← PERMANENT
團隊 XP → 廢除（不設）
```

| 優點 | 缺點 |
|------|------|
| 個人技能永久保留，跨組織可攜帶 | 無法為「作為一個整體的團隊」記錄表現 |
| 符合直覺（技能屬於人） | 排班匹配時必須每次查詢多個用戶 profile |
| 刪除組織/踢出成員不影響技能 | SkillTag 是 org-local 的，跨 org 的 tagId 無意義 |

**問題**：`SkillTag.id` 是 org-local 的 UUID，若把 XP 存在用戶帳戶，
跨組織後 `tagId` 就變成孤兒引用。

**解法**：以 `tagSlug`（如 `"electrical-work"`）作為跨組織的可攜帶識別符，
同時在授予時快照 `tagName`，讓記錄即使在 org 被刪後仍自我完備。

---

#### 方案三（推薦）：用戶錨定 + 組織快照 + 團隊信譽分離

這是最優設計，核心洞察是：**技能熟練度是個人資產，而團隊信譽是組織上下文的產物**。

```
accounts/{userId}          ← 永久個人技能檔案
  skillGrants: [
    {
      tagSlug: "electrical-work",   ← 可攜帶識別符（不用 orgId-bound tagId）
      tagName: "Electrical Work",   ← 快照，防標籤被刪後失去顯示名稱
      tier: "expert",
      xp: 180,
      earnedInOrgId: "org-abc"      ← 歸因審計用（選填）
    }
  ]

accounts/{orgId}.teams[]   ← 團隊信譽（intentionally ephemeral）
  skillGrants: [
    { tagId: "...", tagSlug: "electrical-work", tier: "expert", xp: 90 }
  ]

accounts/{orgId}.members[] ← 僅作顯示快取（display cache）
  skillGrants → 從 accounts/{userId}.skillGrants 讀取後快取
```

---

### 11-C. 為什麼「讓團隊 XP 流失」是正確的？

這是整個設計最反直覺也最重要的結論，請仔細聽：

#### 哲學層面

一個「團隊」的本質是「在特定組織脈絡下被創建的協作單位」。
Alpha Crew 在 Org ABC 完成了 5 個排班 → 這份信譽是「Alpha Crew 對 Org ABC 的貢獻」，
而不是 Alpha Crew 在宇宙中的永恆屬性。

當 Org ABC 被刪除時，Alpha Crew 這個實體本身就消失了。
**沒有自然的「用戶」可以繼承團隊 XP** — 因為 5 個成員各自的貢獻份額不同，
沒有辦法公平分配。

#### 現實層面

Alpha Crew 的 5 個成員在每次任務中各自有 `task.assigneeId` 指向他們，
所以他們的**個人 XP** 已經在任務驗收時被記錄到各自的 `accounts/{userId}` 上了。
團隊 XP 只是對「這個團隊整體可信度」的額外度量，不是個人能力的替代品。

**因此：個人 XP 在用戶帳戶上是完整的；團隊 XP 的流失不是資料損失，
而是符合業務語意的生命週期結束。**

---

### 11-D. 修訂後的最優 Firestore 結構

```
────────────────────────────────────────────────────────
PERMANENT (不受 org 刪除影響)
────────────────────────────────────────────────────────

accounts/{userId}
  accountType: 'user'
  skillGrants: SkillGrant[]   ← 個人技能檔案，永久保留

  SkillGrant {
    tagSlug: string           ← 跨 org 可攜帶識別符（取代 tagId）
    tagName: string           ← 快照（防標籤被刪後失去名稱）
    tier: SkillTier           ← 目前等級
    xp: number                ← 累積 XP
    earnedInOrgId?: string    ← 歸因審計（選填，可選擇不存）
  }

────────────────────────────────────────────────────────
EPHEMERAL (org 刪除後消失 — 設計如此)
────────────────────────────────────────────────────────

accounts/{orgId}
  skillTags: SkillTag[]
    SkillTag {
      id: string       ← org-local UUID
      slug: string     ← 可攜帶識別符（授予 XP 時用 slug 而非 id）
      name: string
      category?: string
    }

  members: MemberReference[]
    MemberReference {
      id: string       ← 等於 accounts/{userId} 的 UID
      skillGrants: SkillGrant[]  ← 顯示快取（可選）
                                    當渲染 org member 列表時
                                    從 accounts/{uid}.skillGrants 填入
    }

  teams: Team[]
    Team {
      skillGrants: SkillGrant[]  ← 團隊信譽（intentionally ephemeral）
    }
```

---

### 11-E. SkillTag 跨組織兼容性問題

目前 `SkillGrant.tagId` 引用的是 org-local 的 UUID。
當 XP 被儲存到用戶永久帳戶時，這個 ID 的引用在 org 消失後失效。

**解法：授予時快照 `tagSlug` + `tagName`**

```
授予 XP 的流程：
  1. 從 org.skillTags 找到 tag: { id, slug, name }
  2. 將 XP 寫入 accounts/{userId}.skillGrants:
     { tagSlug: tag.slug, tagName: tag.name, tier, xp, earnedInOrgId: orgId }
  3. XP 記錄現在自我完備，不依賴 org 存在
```

```
讀取個人技能的流程（跨 org）：
  → 直接讀 accounts/{userId}.skillGrants
  → 以 tagSlug 作為分組鍵（"electrical-work" = 同類技能）
  → tagName 用於 UI 顯示
```

```
排班匹配的流程：
  scheduleItem.requiredSkills[].tagSlug = "electrical-work"
    →  For each candidate member:
         read accounts/{uid}.skillGrants where tagSlug === req.tagSlug
         check: tierSatisfies(grant.tier, req.minimumTier)
    → For each candidate team:
         read org.teams[id].skillGrants where tagSlug === req.tagSlug
         check: tierSatisfies(grant.tier, req.minimumTier)
```

---

### 11-F. 修訂後的 SkillGrant 型別

目前的型別（`src/shared/types/skill.types.ts`）：
```typescript
export interface SkillGrant {
  tagId: string;   ← org-local，跨 org 會成為孤兒引用
  tier: SkillTier;
  xp: number;
}
```

**建議修訂**（讓用戶個人帳戶上的授予記錄可自我完備）：
```typescript
export interface SkillGrant {
  tagId?: string;          // org-local UUID（org-scoped 場景，選填）
  tagSlug: string;         // 跨 org 可攜帶識別符（必填）
  tagName?: string;        // 快照顯示名稱（user 帳戶上的授予必填）
  tier: SkillTier;
  xp: number;
  earnedInOrgId?: string;  // 歸因審計（選填）
}
```

`tagId` 改為選填，`tagSlug` 升為必填。這個修改向下相容（現有有 `tagId` 的記錄仍有效）。

---

### 11-G. 最終結論與設計決策

| 問題 | 最優答案 | 理由 |
|------|---------|------|
| 個人 XP 放哪裡？ | `accounts/{userId}.skillGrants` — **用戶自己的帳戶** | 技能屬於人，不屬於組織；跨 org 可攜帶 |
| 組織/成員刪除時個人 XP 流失嗎？ | **不流失** | XP 在用戶帳戶上，不在 org 嵌入陣列裡 |
| 團隊 XP 流失嗎？ | **流失，設計如此** | 無自然繼承人；個人 XP 已完整記錄個別貢獻 |
| `MemberReference.skillGrants` 的角色 | **顯示快取** | 讀取時從 `accounts/{uid}` 填入，不是 XP 的來源 |
| SkillTag 跨 org 兼容 | 使用 `tagSlug` 而非 `tagId` | slug 是語意可讀的跨 org 標識 |
| 需要型別修改嗎？ | `SkillGrant` 加入 `tagSlug` + `tagName?` + `earnedInOrgId?` | `tagId` 降為選填 |

#### 一句話設計原則

> 「讓 XP 跟著**人**走，而不是跟著**組織的成員資格**走。
> 團隊和夥伴是組織上下文的產物，其信譽的消失是有意為之的生命週期，
> 不是需要修補的資料漏洞。」

---

### 11-H. 對現有 `§10-B 雙帳本架構` 的修訂

§10-B 中的「個人帳本」需要做以下調整：

```
原設計（§10-B）：
  個人 XP 位置：MemberReference.skillGrants[].xp  ← 在 org 文件內
  問題：隨 org 刪除或成員被踢出而流失

修訂設計（§11）：
  個人 XP 位置：accounts/{userId}.skillGrants[].xp  ← 在用戶自己的文件
  MemberReference.skillGrants  → 顯示快取（唯讀投影，非來源）

雙帳本架構不變，只是個人帳本的儲存位置改了：
  帳本 1（個人）：accounts/{userId}.skillGrants  — PERMANENT
  帳本 2（團隊信譽）：Team.skillGrants           — EPHEMERAL（設計如此）
```

§10-B 其餘的防漏洞設計（對數縮放、雙重把關、無廣播等）全部保留。

---

## 12. 最終簡化設計 — 人本 XP + Coin 預埋

> **決策日期**：2026-02-21  
> **狀態**：已確認，進入實施

---

### 12-A. 核心決策摘要

| 決策 | 結論 |
|------|------|
| 誰持有 XP？ | **個人用戶** (`accounts/{userId}`) — 唯一 XP 持有者 |
| 團隊 XP？ | **完全移除** — 不追蹤，不保留 |
| 夥伴 XP？ | **不適用** — 夥伴成員以個人身分累積 XP |
| MemberReference.skillGrants | **顯示快取**（唯讀投影，非 XP 來源） |
| 貨幣系統 | **預埋 `coin: number`** 在 `Account` 上，供未來擴展 |

---

### 12-B. 最終 Firestore 結構

```
accounts/{userId}                    ← PERMANENT (Firebase Auth 錨定)
  accountType: 'user'
  skillGrants: SkillGrant[]          ← 個人技能 + XP，永久保留
  coin?: number                      ← 貨幣餘額預埋，預設 undefined/0

  SkillGrant {
    tagSlug: string       ← 必填，跨 org 可攜帶識別符
    tagName?: string      ← 快照，org 消失後仍可顯示
    tagId?: string        ← 選填，org-local UUID（backward compat）
    tier: SkillTier       ← 目前等級
    xp: number            ← 累積 XP（必填，從 0 開始）
    earnedInOrgId?: string ← 歸因審計
    grantedAt?: Timestamp
  }

accounts/{orgId}                     ← EPHEMERAL
  skillTags: SkillTag[]              ← 組織技能標籤庫
  members: MemberReference[]
    MemberReference.skillGrants      ← 顯示快取（從 accounts/{uid} 讀取填入）
  teams: Team[]                      ← 不再有 skillGrants（已移除）
```

---

### 12-C. `coin` 設計邊界

`coin` 故意設計為最簡單的 `number` 型別，理由：

1. **避免過度設計**：還不知道貨幣系統的完整需求（贈送？扣除？匯率？）
2. **零破壞性預埋**：新增選填 `number` 欄位對現有所有程式碼完全透明
3. **型別擴展路徑**：未來若需要多貨幣或交易歷史，可以：
   - 增加 `coinHistory?: CoinTransaction[]` 選填欄位
   - 或遷移到 `accounts/{userId}/wallet` 子集合
   - 現有 `coin` 欄位成為快取摘要

```typescript
// 現在（預埋）
coin?: number   // 餘額

// 未來（若需要）
coin?: number            // 快取餘額
coinHistory?: CoinTransaction[]  // 交易歷史（選填，按需追加）
```

---

### 12-D. `SkillRequirement` 的對應修改

`ScheduleItem.requiredSkills[]` 中的 `SkillRequirement` 同步更新：

```typescript
interface SkillRequirement {
  tagSlug: string     ← 必填，主要匹配鍵（對應個人 SkillGrant.tagSlug）
  tagId?: string      ← 選填，org-local UUID（UI 連結標籤庫用）
  minimumTier: SkillTier
  quantity: number    ← 需要幾個「人」（不再是「團隊或人」）
}
```

---

### 12-E. `grantSatisfiesRequirement` 更新

`shared/lib/skill.rules.ts` 中的匹配函數改為：

```typescript
// 以 tagSlug 為主要匹配鍵，tagId 為向下相容備選
slugMatch = grant.tagSlug === requirement.tagSlug
idMatch   = requirement.tagId !== undefined && grant.tagId === requirement.tagId
return (slugMatch || idMatch) && tierSatisfies(grant.tier, requirement.minimumTier)
```

---

### 12-F. 已從先前設計移除的部分

| 移除項目 | 理由 |
|---------|------|
| `Team.skillGrants` | 團隊不再是 XP 持有者；個人已完整記錄 |
| §10-B 雙帳本（實體帳本） | 簡化為單一帳本（個人）|
| 「實體 XP 從 ScheduleItem OFFICIAL 觸發」| 不再有實體 XP |
| `MemberReference.skillGrants` 作為寫入目標 | 降級為唯讀快取 |

---

## 13. 貨幣系統 — `Wallet` 結構決策

> **決策日期**：2026-02-21  
> **觸發問題**：`coin?: number` 直接改成 wallet 會不會對未來更有利？  
> **答案**：**是，改成 `wallet?: Wallet` 結構。**

---

### 13-A. 三個方案的比較

| 方案 | 現在 | 未來新增交易歷史 | 主要風險 |
|------|------|-----------------|---------|
| A：`coin?: number` | 0 成本預埋 | 必須**重命名欄位**或在旁邊尷尬地加 `coinHistory[]`；文件大小風險 | 製造唯一一次的遷移成本 |
| **B：`wallet?: Wallet`（採用）** | **6 行 interface**，仍然是單次文件讀取 | 直接向 struct 加選填欄位；交易歷史用子集合正交擴展 | **無** |
| C：`walletTransactions` 子集合 | 需要額外 Firestore read 才能顯示餘額 | 原生交易歷史，但現在根本不需要 | 過度設計 |

**方案 B 是甜蜜點：** 比 `number` 多 6 行，換來永遠不需要做欄位遷移。

---

### 13-B. 類比：`ThemeConfig` 模式

專案裡已有相同的設計模式：`ThemeConfig` 是一個三欄 struct 而不是三個分散的原始型別。
`Wallet` 遵循完全相同的邏輯——把一個概念的相關欄位組合在一起。

```typescript
// 已有（ThemeConfig 模式）
interface ThemeConfig {
  primary: string;
  background: string;
  accent: string;
}

// 新增（同樣模式）
interface Wallet {
  balance: number;
}
```

---

### 13-C. 擴展路線圖（不需要遷移）

```typescript
// v1（現在）
interface Wallet {
  balance: number;
}

// v2（若需要多貨幣，直接加欄位）
interface Wallet {
  balance: number;
  currency?: string;      // e.g. 'COIN', 'CREDIT'
  pendingBalance?: number; // earned but not yet settled
}

// v3（若需要交易歷史）
// Wallet struct 保持不變，成為快速讀取的摘要
// 歷史記錄移到 Firestore 子集合：
//   accounts/{userId}/walletTransactions/{txId}
// 這兩件事完全正交，不相互干擾
```

---

### 13-D. Firestore 最終結構（含 Wallet）

```
accounts/{userId}
  wallet?: Wallet
    balance: number           ← 快速讀取的權威餘額

accounts/{userId}/walletTransactions/{txId}  ← 未來按需增加，不影響 wallet
  amount: number
  type: 'earn' | 'spend'
  reason: string
  timestamp: Timestamp
```

Wallet 永遠跟 User Profile 在同一個文件讀取，**零額外 Firestore read**。
交易歷史是一個完全獨立的子集合，當需要時直接建，當不需要時完全不存在。

---

### 13-E. 更新 §12 的對應修訂

§12-A 的「貨幣系統」欄位從 `coin?: number` 更新為 `wallet?: Wallet`：

```
舊：coin?: number                 ← 直接是一個數字
新：wallet?: Wallet { balance: number }  ← 有結構的概念單元
```

§12-B 的 Firestore 結構中 `coin?: number` 同步更新為：
```
wallet?: Wallet
  balance: number
```

---

## 14. Profile 頁面設計分析

> **觸發問題**：目前結構要擴展 profile 頁面，因為單純 settings 已無法滿足  
> **本節僅討論，不產生代碼**

---

### 14-A. 現狀診斷

從程式碼讀出的事實：

```
src/app/dashboard/account/settings/page.tsx
  → UserSettingsView
    → UserSettings（smart container）
      ├── ProfileCard    — 編輯 name, bio, avatar, ExpertiseBadges（checkbox）
      ├── PreferencesCard — 開關：Auto-adapt UI Resonance, Notifications
      └── SecurityCard   — 刪除帳戶 / 登出
```

**問題 1：位置錯誤**  
`account/settings` 被放在 `NavMain` 的「Account Governance」collapsible 裡，
這個 collapsible 只有 `isOrganizationAccount === true` 時才出現。
個人用戶（user account）找不到 Settings，因為 nav 完全不顯示它。

**問題 2：概念混淆**  
「編輯個人資料」和「查看個人名片」是兩件截然不同的事：
- Settings = 私人配置介面（填表、儲存）
- Profile  = 公開身份頁（展示、閱讀）

加入技能徽章、XP 進度條、Wallet 餘額後，Settings 頁要渲染的東西會超過它的職責範圍。

**問題 3：`nav-user` 入口重複**  
sidebar footer 的用戶 dropdown 也有一個「User Settings」連結（UserCircle icon）指向同一個 settings 路由。
未來需要區分「看我的 Profile」和「修改設定」這兩個不同入口。

---

### 14-B. Profile vs Settings 的邊界劃分

| 區域 | Profile（`/account/profile`） | Settings（`/account/settings`） |
|------|-------------------------------|--------------------------------|
| **核心職責** | 身份展示 / 公開名片 | 私人配置 / 管理操作 |
| **主要動作** | 瀏覽（讀多寫少） | 編輯（寫多） |
| **avatar 顯示** | ✅ 大尺寸展示 | ✅ 小尺寸 + 上傳按鈕 |
| **name / bio** | ✅ 唯讀展示 | ✅ 表單編輯 |
| **SkillGrant 徽章** | ✅ 技能卡片 + XP 進度條 + tier 色彩 | ❌ 不適合放在設定頁 |
| **Wallet 餘額** | ✅ coin balance 摘要 | ❌ 不適合放在設定頁 |
| **Preferences** | ❌ | ✅ 通知、UI 自適應等開關 |
| **Security** | ❌ | ✅ 刪除帳號、密碼等危險操作 |
| **外部可見性** | 未來可公開（組織內其他成員可查看） | 永遠私有 |

---

### 14-C. 路由方案

```
/dashboard/account/profile   ← 新增（個人 Profile 頁）
/dashboard/account/settings  ← 保留（設定，只留 Preferences + Security）
```

**為什麼 profile 和 settings 是兩個路由，而不是 tab？**

1. **可分享 URL**：未來若允許組織成員查看彼此 profile，URL 可以擴展為
   `/dashboard/account/members/[userId]/profile` — 同一個 view-module 直接複用。
2. **導航意圖清晰**：`nav-user` dropdown 可以有兩個明確入口：
   - 「View Profile」→ `/account/profile`
   - 「Settings」     → `/account/settings`
3. **職責單一**：每個路由只做一件事，符合 Occam's Razor。

---

### 14-D. Profile 頁面的區塊組成

```
/dashboard/account/profile
├── Hero 區
│   ├── Avatar（大尺寸，帶 tier 最高技能的光環色）
│   ├── Display Name
│   ├── Bio
│   └── 快速 Edit 按鈕 → 跳到 /account/settings
│
├── Skill Grants 區（核心新功能）
│   ├── 每個 SkillGrant 一張技能卡
│   │   ├── tagName（技能名稱）
│   │   ├── tier badge（色彩從 CSS --tier-N-* token）
│   │   ├── XP 進度條（xp / maxXp for this tier）
│   │   └── earnedInOrgId → org 名稱（若 org 仍存在）
│   └── 「No skills yet」empty state
│
└── Wallet 區（輕量預覽）
    └── balance: number（coin 餘額）
```

---

### 14-E. Settings 頁面的精簡後組成

```
/dashboard/account/settings（保留，只精簡）
├── ProfileCard（改小）
│   ├── Avatar 上傳
│   ├── Display Name 編輯
│   └── Bio 編輯
│   （移除：ExpertiseBadges checkbox — 技能改由 admin 在 members 頁授予）
│
├── PreferencesCard（不變）
│   └── 通知、UI 自適應開關
│
└── SecurityCard（不變）
    └── 刪除帳號
```

`ExpertiseBadge` checkbox 可以在 settings 中移除，因為新的 SkillGrant 系統由 org admin 授予，不是用戶自己勾選。

---

### 14-F. 影響到的檔案清單（實施時參考）

```
新增：
  src/app/dashboard/account/profile/page.tsx
  src/features/user-settings/_components/              ← 新 view-module
    user-profile-view.tsx                     ← 頁面組合（smart container）
    profile-hero-card.tsx                     ← Avatar + name + bio
    skill-grants-section.tsx                  ← 技能徽章列表
    wallet-summary-card.tsx                   ← Wallet 餘額預覽

修改：
  src/shared/constants/routes.ts              ← 加入 ACCOUNT_PROFILE
  src/features/workspace-core/_shell/nav-user.tsx  ← 分拆兩個入口
  src/features/workspace-core/_shell/nav-main.tsx  ← 個人 Profile 入口（永遠可見，不限 org）
  src/features/user-settings/_components/profile-card.tsx  ← 移除 ExpertiseBadges checkbox
```

---

### 14-G. 導航入口設計

```
Sidebar footer（nav-user dropdown）：
  ├── View Profile  → /dashboard/account/profile   ← 新
  └── Settings      → /dashboard/account/settings  ← 已有

Sidebar nav（NavMain）：
  ├── 個人 Profile（永遠顯示，不限 org context）  ← 新
  └── Account Governance（只對 org 顯示，不變）
        ├── Members, Teams, Partners, Settings, Matrix, Schedule, Daily, Audit
```

---

### 14-H. 問題確認

在實施前，需要確認以下幾點：

1. **Profile 是否允許其他組織成員查看？**  
   若是 → URL 設計為 `/members/[userId]/profile`（view-module 複用）  
   若否 → 只有 `/account/profile`（自己看自己）

2. **Skill grants 是否可在 profile 頁顯示 org 名稱？**  
   需要從 `earnedInOrgId` 反查 org 的 `name` — 若 org 已刪除則顯示 `(expired org)` 或隱藏

3. **Settings 中的 `ExpertiseBadges` checkbox 何時廢棄？**  
   建議：等 skill-grant 系統的管理 UI（admin 授予流程）完成後一併移除，避免空白期


---

## 15. 靜態技能常量庫 — 取代 Firestore SkillTag Collection

> **觸發決策**：「讓技能不受限於組織，讓組織保持單純」

---

### 15-A. 決策摘要

**之前（本次前）：**  
`SkillTag` 是存在 Firestore `accounts/{orgId}.skillTags[]` 的組織私有文件。  
每個組織各自維護自己的技能庫，且 `SkillTag.createdAt` 包含 Firestore Timestamp 依賴。

**之後（本次）：**  
技能庫改為 `src/shared/constants/skills.ts` 中的靜態常量陣列。  
無 Firestore 讀寫、無組織依賴、全域可用。

---

### 15-B. 因此做出的三項代碼變更

| 文件 | 變更 |
|------|------|
| `src/shared/constants/skills.ts` | **新增** — 31 個工程施工技能定義 |
| `src/shared/types/skill.types.ts` | `SkillTag` 移除 `id` 和 `createdAt: any`，變成純值類型 |
| `src/shared/types/account/account.types.ts` | `Account` 移除 `skillTags?: SkillTag[]`（組織不再擁有技能庫） |

---

### 15-C. 靜態技能庫的結構

```typescript
// src/shared/constants/skills.ts
export const SKILLS: readonly SkillDefinition[] = [
  { slug: 'concrete-work',      name: 'Concrete Work',       category: 'Civil'          },
  { slug: 'rebar-installation', name: 'Rebar Installation',  category: 'Civil'          },
  { slug: 'electrical-wiring',  name: 'Electrical Wiring',   category: 'Electrical'     },
  { slug: 'crane-operation',    name: 'Crane Operation',     category: 'HeavyEquipment' },
  { slug: 'project-management', name: 'Project Management',  category: 'Management'     },
  // ... 31 total
]
```

**分類：** Civil / Electrical / Mechanical / Finishing / HeavyEquipment / Safety / Engineering / Management

**輔助函式：**
- `findSkill(slug)` → `SkillDefinition | undefined`（O(1) Map 查找）
- `SKILL_BY_SLUG` — 預建 Map，供組件直接讀取
- `SkillSlug` — TypeScript 型別，限定為陣列中的合法 slug

---

### 15-D. 優勢對比

| 面向 | 舊設計（Firestore） | 新設計（靜態常量） |
|------|--------------------|-------------------|
| Firestore 讀寫 | 每次渲染需 query | 零 I/O |
| 組織間共用 | 每個 org 各自一份，不一致 | 全域唯一，永遠一致 |
| 新增技能 | 需要管理員 UI + Firestore write | 改一行代碼，PR 合併即生效 |
| AI Agent 枚舉 | 需 query 才能知道有哪些技能 | 直接 import `SKILLS` |
| 刪除 org 後 | 技能庫消失 | 不受影響 |
| TypeScript 安全 | `id: string`（執行期才知道） | `SkillSlug` union type（編譯期檢查） |

---

### 15-E. `SkillGrant` 的銜接

`SkillGrant.tagSlug` 繼續作為跨組織識別符，
現在它同時也是 `SkillSlug`（`SKILLS` 中的合法 slug）。
驗證：`findSkill(grant.tagSlug) !== undefined`

---

### 15-F. 未來擴展策略

需要新增工程技能時：在 `SKILLS` 陣列中 append 一個新物件即可。  
**絕不刪除或重命名現有 slug** — 否則會孤兒化使用者的 SkillGrant 記錄。

