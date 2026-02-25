# Features Tree — 理想化架構

> 依據 `docs/overview/logic-overview_v5.md` 設計。
> 本文件定義 `src/features/` 的**目標狀態**（target state）。

## 命名規則

切片名稱遵循 **`{主體}-{子類型或次命名空間}.{功能}`** 格式：

- **`-`（連字號）** 分隔主體與子類型／次命名空間（如 `identity-account`、`workspace-core`）
- **`.`（點）** 分隔子類型與具體功能（如 `identity-account.auth`、`workspace-core.event-bus`）
- 若一個次命名空間只有單一功能（無需再細分），則以 `{主體}-{次命名空間}` 命名，不加 `.`

| 前綴 | 適用範圍 | 範例 |
|------|----------|------|
| `identity-*` | 身份驗證 BC（Identity Layer：auth 操作及身份狀態管理） | `identity-account.auth` |
| `account-user.*` | 個人使用者功能（User 是 Account 的子類型） | `account-user.profile` |
| `account-organization.*` | 組織功能（Organization 也是 Account 的子類型） | `account-organization.core` |
| `account-governance.*` | 帳號層級的橫切治理（角色、政策、通知路由） | `account-governance.role` |
| `workspace-*` | 工作區功能（位於 Subject Center 之外，獨立 BC） | `workspace-core` |

> **為何 `workspace-*` 不用 `account-workspace.*`？**
> Workspace 屬於 Workspace Container，在架構圖中位於 Subject Center **之外**，
> 是獨立的 Bounded Context。Organization 則位於 Subject Center **之內**，
> 是 Account 的子類型，因此納入 `account-organization.*` 命名空間。

> **為何是 `identity-account.auth`，而非 `account-auth`？**
> 架構圖中的 `AUTHENTICATION + IDENTITY` 區塊是一個真實的 Bounded Context（有具名 subgraph `IDENTITY_LAYER`）。
> `ACCOUNT_AUTH` 節點與 `IDENTITY_LAYER` 使用相同的 `identity` 樣式，
> 且架構的流向是 `FIREBASE_AUTHENTICATION → ACCOUNT_AUTH → IDENTITY_LAYER`，
> 表示 `ACCOUNT_AUTH` 是 **Identity BC 的應用層入口**。
> Identity Layer 的 sub-node（`authenticated-identity`、`account-identity-link`、
> `active-account-context`、`custom-claims`）均屬 Identity BC 的可擴充切片空間，
> 因此 `identity-*` 並非單一切片命名空間，而是完整的 BC 前綴。
> 命名為 `identity-account.auth` 表示：在 Identity BC 中，針對 Account 身份的驗證操作。

## 狀態說明

| 符號 | 狀態 |
|------|------|
| ✅ | 已實作（exists） |
| 🔧 | Stub / 部分實作，需擴充（partial） |

---

## 完整資料夾樹

```
src/features/
│
├── ── VS0 · Shared Kernel + Tag Authority Center ─────────────────
│   └── centralized-tag/                  ✅  全域標籤語義字典（Tag Authority Center）
│                                               · createTag / updateTag / deprecateTag / deleteTag
│                                               · TagLifecycleEvent → Integration Event Router
│                                               · Invariants: #17, A6, T1
│
├── ── Identity Layer ─────────────────────────────────────────────
│   └── identity-account.auth/            ✅  登入 · 註冊 · 重設密碼（Firebase Auth 入口）
│
├── ── Account Layer（含 Organization sub-type）───────────────────
│   │
│   │   ── 帳號共用 ──
│   ├── account-governance.role/           🔧  帳號角色管理 → CUSTOM_CLAIMS 簽發
│   ├── account-governance.policy/         🔧  帳號政策管理
│   └── account-governance.notification-router/ 🔧  通知路由器（FCM 第 2 層 · 依 TargetAccountID 分發）
│   │
│   │   ── User sub-type ──
│   ├── account-user.profile/              ✅  使用者個人資料 · 偏好設定 · FCM Token
│   ├── account-user.wallet/               🔧  個人錢包 · 代幣積分
│   ├── account-user.notification/         🔧  個人推播通知（FCM 第 3 層）
│   └── account-user.skill/               🔧  個人技能 XP 成長 · Ledger · Tier 推導（Invariant #11-13）
│   │
│   │   ── Organization sub-type ──
│   ├── account-organization.core/         🔧  組織聚合實體（aggregate）· binding
│   ├── account-organization.event-bus/    🔧  組織事件總線（含 ScheduleProposalCancelled 補償事件）
│   ├── account-organization.member/       🔧  組織成員邀請／移除
│   ├── account-organization.team/         🔧  團隊管理（內部組視圖）
│   ├── account-organization.partner/      🔧  合作夥伴管理（外部組視圖）
│   ├── account-organization.policy/       🔧  組織政策管理
│   ├── account-organization.skill-tag/    🔧  職能標籤庫（Tag Authority 組織作用域快照 · 被動消費 TagLifecycleEvent）
│   └── account-organization.schedule/     🔧  人力排程管理 · ScheduleAssigned 事件（FCM 第 1 層）
│                                               · Scheduling Saga: ScheduleAssignRejected / ScheduleProposalCancelled
│
├── ── Workspace Application Layer ────────────────────────────────
│   └── workspace-application/             🔧  指令處理器 · Scope Guard · 政策引擎
│                                               · org-policy 防腐層快取 · 交易執行器 · Outbox
│
├── ── Workspace Core ─────────────────────────────────────────────
│   ├── workspace-core/                    ✅  Workspace CRUD · shell · provider · list · settings · aggregate
│   ├── workspace-core.event-bus/          ✅  工作區事件總線
│   └── workspace-core.event-store/        🔧  事件儲存（僅供重播／稽核，非 CRUD）
│
├── ── Workspace Governance ───────────────────────────────────────
│   ├── workspace-governance.members/      ✅  工作區成員存取管理
│   ├── workspace-governance.role/         🔧  角色管理（從 members 拆分）
│   ├── workspace-governance.teams/        🔧  Stub — 視圖已遷移至 account-organization.team
│   ├── workspace-governance.partners/     🔧  Stub — 視圖已遷移至 account-organization.partner
│   ├── workspace-governance.schedule/     🔧  Stub — 實作已遷移至 workspace-business.schedule
│   └── workspace-governance.audit/        ✅  稽核足跡 · 事件時序（實務暫置；非 WORKSPACE_GOVERNANCE 架構邊界）
│
├── ── Workspace Business · 輔助與靜態單元 ────────────────────────
│   ├── workspace-business.daily/          ✅  手寫施工日誌 · 留言 · 書籤
│   ├── workspace-business.schedule/       ✅  排程管理 · 提案 · 決策（由 workspace-governance.schedule 遷移）
│   ├── workspace-business.files/          ✅  檔案上傳 · 管理
│   └── workspace-business.document-parser/ ✅  AI 文件解析 · ParsingIntent（Digital Twin）
│
├── ── Workspace Business · A 軌（主流程）─────────────────────────
│   │   ※ 架構設計意圖（logic-overview_v5.md A3）：
│   │     tasks / qa / acceptance / finance 為 workspace-business.workflow.aggregate
│   │     的「階段視圖」（stage-view），不是四個獨立原子流程。
│   │     WORKFLOW_AGGREGATE 為整體 A 軌狀態機的不變量邊界（尚未獨立實作切片）。
│   ├── workspace-business.tasks/          ✅  任務樹 · CRUD（A 軌起點）
│   ├── workspace-business.quality-assurance/ ✅  品質驗證（A 軌）
│   ├── workspace-business.acceptance/     ✅  驗收（A 軌）
│   └── workspace-business.finance/        ✅  財務處理（A 軌終點）
│
├── ── Workspace Business · B 軌（異常處理中心）───────────────────
│   └── workspace-business.issues/         ✅  問題追蹤單 · IssueResolved 事件（B 軌）
│
└── ── Projection Layer ───────────────────────────────────────────
    ├── projection.event-funnel/            ✅  事件漏斗（EVENT_FUNNEL_INPUT · Projection Layer 唯一外部入口）
    │                                           · registerWorkspaceFunnel / registerOrganizationFunnel / registerTagFunnel
    ├── projection.workspace-view/          🔧  工作區讀模型（Workspace 投影視圖）
    ├── projection.workspace-scope-guard/   🔧  Scope Guard 專用讀模型
    ├── projection.account-view/            🔧  帳號讀模型 · 權限快照（authority-snapshot 合約）
    ├── projection.account-audit/           🔧  帳號稽核投影
    ├── projection.account-schedule/        🔧  帳號排程投影（過濾可用帳號）
    ├── projection.organization-view/       🔧  組織讀模型
    ├── projection.account-skill-view/      🔧  帳號技能讀模型（accountId / skillId / xp · 不存 tier）
    ├── projection.org-eligible-member-view/ 🔧  排程資格讀模型（orgId / accountId / eligible · Invariant #14）
    ├── projection.tag-snapshot/            ✅  Tag Authority 全域語義字典讀模型（T5 · 消費方唯讀）
    └── projection.registry/               ✅  事件串流偏移量 · 讀模型版本對照表
```

---

## 切片計數

| Bounded Context | ✅ 已實作 | 🔧 需擴充 | 小計 |
|-----------------|-----------|-----------|------|
| VS0 Tag Authority Center | 1 | 0 | **1** |
| Identity Layer | 1 | 0 | **1** |
| Account Layer (共用 + governance) | 0 | 3 | **3** |
| Account Layer (user sub-type) | 1 | 3 | **4** |
| Account Layer (organization sub-type) | 0 | 8 | **8** |
| Workspace Application | 0 | 1 | **1** |
| Workspace Core | 2 | 1 | **3** |
| Workspace Governance | 2 | 4 | **6** |
| Workspace Business (support) | 4 | 0 | **4** |
| Workspace Business (A-track) | 4 | 0 | **4** |
| Workspace Business (B-track) | 1 | 0 | **1** |
| Projection Layer | 3 | 8 | **11** |
| **Total** | **19** | **28** | **47** |

---

## 切片內部標準結構

每個切片遵循以下佈局（`_` 前綴表示切片私有，不得跨切片直接引用）：

```
features/{name}/
├── GEMINI.md            ← 切片 AI 指令（必要）
├── _actions.ts          ← "use server" 指令變更（可選）
├── _queries.ts          ← Firestore reads / onSnapshot（可選）
├── _types.ts            ← 切片私有型別擴展（可選）
├── _hooks/              ← React hooks（可選）
├── _components/         ← UI 元件（可選）
└── index.ts             ← 公開 API，唯一跨切片引用入口（必要）
```

### workspace-application 內部結構（應用層特化）

```
features/workspace-application/
├── GEMINI.md
├── _command-handler.ts    ← Command 接收與分派
├── _scope-guard.ts        ← 作用域守衛（讀 projection.workspace-scope-guard）
├── _policy-engine.ts      ← 政策驗證
├── _org-policy-cache.ts   ← 組織政策本地防腐層（Anti-Corruption Layer）
├── _transaction-runner.ts ← 聚合執行 + Outbox 彙整
├── _outbox.ts             ← 交易內發信箱 → workspace-core.event-bus
└── index.ts
```

### projection.* 切片內部結構（讀模型特化）

```
features/projection.{name}/
├── GEMINI.md
├── _projector.ts    ← 事件 → 讀模型更新函式
├── _read-model.ts   ← Firestore 讀模型 schema
├── _queries.ts      ← 讀模型查詢
└── index.ts         ← 公開 query hooks / types
```

---

## 跨切片共享（shared/）

```
src/shared/
├── types/       ← 所有 TypeScript 領域型別
├── lib/         ← 純工具函式 + 領域規則
├── infra/       ← Firebase 適配器 · repository · Event Funnel（事件漏斗統一入口）
│                     └── observability/ ✅  trace-identifier · domain-metrics · domain-error-log
├── ai/          ← Genkit AI flows
├── ui/          ← shadcn-ui · app-providers · i18n · constants
└── kernel/      🆕  Shared Kernel 顯式合約
                      ├── event-envelope.ts     ← 事件信封契約（所有 BC 遵循）
                      └── authority-snapshot.ts ← 權限快照契約（projection 遵循）
```

> **Observability**（trace-identifier · domain-metrics · domain-error-log）屬橫切關注點，
> 實作置於 `shared/infra/observability/`（✅ 已實作），不作為獨立功能切片。

---

## FCM 通知三層架構對應

| 層級 | 職責 | 切片 |
|------|------|------|
| 第 1 層（觸發） | 宣告事實（ScheduleAssigned），不關心誰收通知 | `account-organization.schedule` |
| 第 2 層（路由） | 依 TargetAccountID 分發至目標帳號 | `account-governance.notification-router` |
| 第 3 層（交付） | 依帳號標籤過濾敏感內容後推播 FCM | `account-user.notification` |

FCM Token 儲存於 `account-user.profile`；`account-user.notification` 唯讀查詢，不寫入 profile。

---

## AB 雙軌業務流程對應

```
workspace-business.document-parser → [ParsingIntent]
                                             │
               ┌─────────────────────────────┼──────────────────────┐
               ↓                             ↓                      ↓
  workspace-business.tasks          workspace-business.finance  workspace-business.issues
               ↓                                                     ↑
  workspace-business.quality-assurance  ←─── 任一 A 軌異常 ─────────┤
               ↓                                                     ↑
  workspace-business.acceptance  ───────────── 異常 ────────────────┘
               ↓
  workspace-business.finance

B 軌解鎖：workspace-business.issues 發送 IssueResolved → workspace-core.event-bus
          A 軌切片自行訂閱後恢復進度（不直接回流 B 軌）
```

---

## Scope Guard 讀模型依賴鏈

```
account-organization.event-bus ──政策變更事件──► workspace-application (org-policy-cache)
                                                          │
                                                          ↓ 更新本地 read model
                                              projection.workspace-scope-guard
                                                          │
                                              workspace-application (scope-guard) 讀取
```

Scope Guard 只讀本地 `projection.workspace-scope-guard`，不直接依賴外部 Event Bus（遵循不變量 #7）。

---

## 架構偏差備註

| 切片 | 偏差說明 | 長期目標 |
|------|----------|----------|
| `workspace-governance.audit/` | 不在 `logic-overview.v3.md` 的 `WORKSPACE_GOVERNANCE` 架構邊界內；為實務交付暫置的 UI 稽核視圖 | 遷移至 `workspace-core.event-store` + `projection.account-audit` |
| `workspace-business.workflow.aggregate` | 架構圖定義節點（A3 決策）；目前 A 軌透過 `progressState` 欄位協調，尚未獨立成切片 | 獨立成 aggregate 切片，統一 A 軌狀態機 |

---

## 參考

- 架構圖：[`docs/overview/logic-overview_v5.md`](../../docs/overview/logic-overview_v5.md)
- 切片開發規範：[`src/features/GEMINI.md`](./GEMINI.md)
- 全域設計原則：[`GEMINI.md`](../../GEMINI.md)（倉庫根目錄）
