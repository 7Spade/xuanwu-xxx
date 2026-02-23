# Architecture Overview

> 本文件是 `logic-overview.v3.md` 的配套架構參考。  
> `logic-overview.v3.md` 描述**領域邏輯流程**；本文件描述**功能切片的資料夾結構設計**與其對應的架構原則。

---

## 一、logic-overview.v3.md 評估與改良說明

| # | 項目 | 原始狀態 | 改良後 | 理由 |
|---|------|----------|--------|------|
| 1 | `account.auth` 切片缺失 | 只有 Firebase Authentication 外部服務節點 | 新增 `account.auth` 節點，位於 Firebase 與 Identity Layer 之間 | 登入／註冊／重設密碼是一個完整業務切片 |
| 2 | `user-account.settings` 獨立節點 | 有 `user-account.settings` 獨立節點 | 合併至 `account-user.profile` | 新設計將設定納入個人資料切片，避免碎片化 |
| 3 | `organization-account.aggregate` 缺失 | 只有 `organization-account` 與 `.settings` | 新增 `organization-account.aggregate` 節點 | 作為組織帳號的聚合根並連接 Organization Layer |
| 4 | `workspace-settings` 獨立於容器頂層 | `workspace-settings` 懸掛在容器外層 | 移入 `workspace-core` 成為 `workspace-core.settings` | 設定是聚合根的核心配置，屬於 Core 職責 |
| 5 | `workspace-business.audit-log` 放在業務層 | `audit-log` 在 `workspace-business` 子圖中 | 移入 `workspace-governance` 成為 `workspace-governance.audit-log` | 工作區操作稽核是治理／合規職責，不是業務功能 |
| 6 | 業務模組順序無結構 | 模組排列無明確流向 | tasks → quality-assurance → acceptance → finance → daily → document-parser → files → issues → schedule | 反映業務執行流向：任務產生 → 品質把關 → 驗收結案 → 財務結算 |
| 7 | `issues` 模式未標注 | `issues` 作為普通業務模組 | 標注為 AB 雙軌問題單 | 任何問題（任務、品質、驗收等）都透過開問題單（issues）進行追蹤，採 AB 雙軌：A = 問題描述軌，B = 解決方案軌 |
| 8 | `workspace-business` 內部流向不可見 | 業務模組為無邊的平鋪節點清單 | 細化為帶流向邊的 AB 雙軌圖：A 軌正常順位箭頭、異常箭頭指向 B 軌六角形節點、處理完成虛線回流、輔助模組虛線關聯 | 讓圖表直接表達業務邏輯流轉，不需額外文字說明 |

---

## 二、核心設計原則

### Occam's Razor

> 不引入超過需求所必要的複雜度。

所有架構決策優先選擇**最簡單且能完整滿足需求的方案**。

### Vertical Slice Architecture（垂直功能切片）

> **目標：AI 開發零認知 — 實作任何功能只需讀一個資料夾。**

每個功能切片是其業務領域的**唯一真相來源**，自包含型別、Server Action、查詢、hooks 和 UI 元件。

---

## 三、Features 資料夾階層設計

```
src/
└── features/
    ├── GEMINI.md                              ← AI 開發指南（整層）
    │
    ├── identity/                              ← 身份層（Identity Layer）
    │   ├── authenticated-identity/            ← 已驗證身份
    │   ├── account-identity-link/             ← firebaseUserId ↔ accountId
    │   ├── active-account-context/            ← 作用中帳號上下文
    │   └── custom-claims/                     ← 自訂權限宣告
    │
    ├── account/                               ← 帳號層（Account Layer）
    │   ├── account.auth/                      ← 登入／註冊／重設密碼
    │   ├── account-user.profile/              ← 使用者資料與設定
    │   ├── account-user.wallet/               ← 錢包（代幣／積分，stub）
    │   ├── account-organization/              ← 組織帳號群組
    │   │   ├── organization-account.settings/ ← 組織設定
    │   │   └── organization-account.aggregate/← 組織帳號聚合根
    │   └── account-governance/                ← 帳號治理群組
    │       ├── account-governance.role/       ← 帳號角色
    │       ├── account-governance.policy/     ← 帳號政策
    │       └── account-governance.audit-log/  ← 帳號稽核記錄
    │
    ├── organization/                          ← 組織層（Organization Layer）
    │   ├── organization-core/                 ← 組織核心群組
    │   │   ├── organization-core.aggregate/   ← 組織聚合實體
    │   │   └── organization-core.event-bus/   ← 組織事件總線
    │   ├── organization-governance/           ← 組織治理群組
    │   │   ├── organization-governance.member/  ← 組織成員
    │   │   ├── organization-governance.team/    ← 團隊管理
    │   │   ├── organization-governance.partner/ ← 合作夥伴
    │   │   ├── organization-governance.policy/  ← 政策管理
    │   │   └── organization-governance.audit-log/ ← 稽核紀錄
    │   └── organization-schedule/             ← 人力排程管理
    │
    └── workspace/                             ← 工作區容器（Workspace Container）
        ├── workspace-application/             ← 應用層群組（請求管道）
        │   ├── workspace-application.command-handler/    ← 指令處理器
        │   ├── workspace-application.scope-guard/        ← 作用域守衛
        │   ├── workspace-application.policy-engine/      ← 政策引擎
        │   ├── workspace-application.transaction-runner/ ← 交易執行器
        │   └── workspace-application.outbox/             ← 交易內發信箱
        ├── workspace-core/                    ← 核心層群組（聚合根 + 設定）
        │   ├── workspace-core.settings/       ← 工作區設定（屬於核心配置）
        │   ├── workspace-core.aggregate/      ← 核心聚合實體
        │   ├── workspace-core.event-bus/      ← 事件總線
        │   └── workspace-core.event-store/    ← 事件儲存（可選）
        ├── workspace-governance/              ← 工作區治理群組（存取控制 + 稽核）
        │   ├── workspace-governance.member/   ← 工作區成員
        │   ├── workspace-governance.role/     ← 角色管理
        │   └── workspace-governance.audit-log/ ← 工作區操作稽核（治理職責）
        └── workspace-business/                ← 業務層群組（任務流水線 + 輔助功能）
            ├── workspace-business.tasks/           ← 任務管理
            ├── workspace-business.quality-assurance/ ← 品質保證
            ├── workspace-business.acceptance/      ← 業務受理／驗收
            ├── workspace-business.finance/         ← 財務處理
            ├── workspace-business.daily/           ← 日常作業
            ├── workspace-business.document-parser/ ← 文件解析
            ├── workspace-business.files/           ← 檔案管理
            ├── workspace-business.issues/          ← 問題追蹤（AB 雙軌問題單，見下方說明）
            └── workspace-business.schedule/        ← 任務排程產生
```

### workspace-business.issues — AB 雙軌問題單

> **任何問題都透過開問題單進行追蹤。**

`issues` 是業務層的橫切關注點（cross-cutting concern）。無論任務、品質、驗收或財務環節發現問題，都使用同一個問題單系統記錄，採用 **AB 雙軌**：

| 軌 | 職責 |
|----|------|
| A 軌（問題描述軌） | 記錄問題來源、現象、影響範圍、優先級 |
| B 軌（解決方案軌） | 記錄解決方案、責任人、驗收標準、結案狀態 |

業務模組（tasks / quality-assurance / acceptance）發現異常 → 建立 Issue（A 軌）→ 指派解決方案（B 軌）→ 驗收結案。

---

## 四、Domain Layer → Feature Slice 對照表

### Identity Layer（身份層）

| Feature Slice | 領域職責 | logic-overview 節點 |
|---------------|----------|---------------------|
| `account.auth` | Firebase 登入／註冊／重設密碼的 UI 與 Server Action | `ACCOUNT_AUTH` |
| `identity/authenticated-identity` | 持有 Firebase User，提供已驗證狀態 | `AUTHENTICATED_IDENTITY` |
| `identity/account-identity-link` | 維護 `firebaseUserId ↔ accountId` 映射 | `ACCOUNT_IDENTITY_LINK` |
| `identity/active-account-context` | 組織／工作區的作用中帳號 Context | `ACTIVE_ACCOUNT_CONTEXT` |
| `identity/custom-claims` | 解析 Firebase Custom Claims 作為授權資料 | `CUSTOM_CLAIMS` |

### Account Layer（帳號層）

| Feature Slice | 領域職責 | logic-overview 節點 |
|---------------|----------|---------------------|
| `account-user.profile` | 使用者個人資料、偏好設定、安全設定 | `USER_ACCOUNT_PROFILE` |
| `account-user.wallet` | 個人錢包（代幣／積分，stub） | `USER_ACCOUNT_WALLET` |
| `account-organization/organization-account.settings` | 組織設定 CRUD | `ORGANIZATION_ACCOUNT_SETTINGS` |
| `account-organization/organization-account.aggregate` | 組織帳號聚合根，連接 Organization Layer | `ORGANIZATION_ACCOUNT_AGGREGATE` |
| `account-governance/account-governance.role` | 帳號層角色定義 | `ACCOUNT_ROLE` |
| `account-governance/account-governance.policy` | 帳號層政策規則 | `ACCOUNT_POLICY` |
| `account-governance/account-governance.audit-log` | 帳號層稽核記錄 | `ACCOUNT_AUDIT_LOG` |

### Organization Layer（組織層）

| Feature Slice | 領域職責 | logic-overview 節點 |
|---------------|----------|---------------------|
| `organization-core/organization-core.aggregate` | 組織聚合實體，擁有工作區 | `ORGANIZATION_ENTITY` |
| `organization-core/organization-core.event-bus` | 組織領域事件總線 | `ORGANIZATION_EVENT_BUS` |
| `organization-governance/organization-governance.member` | 組織成員管理 | `ORGANIZATION_MEMBER` |
| `organization-governance/organization-governance.team` | 團隊結構管理 | `ORGANIZATION_TEAM` |
| `organization-governance/organization-governance.partner` | 外部合作夥伴 | `ORGANIZATION_PARTNER` |
| `organization-governance/organization-governance.policy` | 組織政策管理 | `ORGANIZATION_POLICY` |
| `organization-governance/organization-governance.audit-log` | 組織稽核紀錄 | `ORGANIZATION_AUDIT_LOG` |
| `organization-schedule` | 人力排程管理 | `ORGANIZATION_SCHEDULE` |

### Workspace Container（工作區容器）

#### workspace-core（核心層）

| Feature Slice | 領域職責 | logic-overview 節點 |
|---------------|----------|---------------------|
| `workspace-core/workspace-core.settings` | 工作區設定（聚合根核心配置） | `WORKSPACE_SETTINGS` |
| `workspace-core/workspace-core.aggregate` | 工作區聚合根 | `WORKSPACE_AGGREGATE` |
| `workspace-core/workspace-core.event-bus` | 工作區事件總線 | `WORKSPACE_EVENT_BUS` |
| `workspace-core/workspace-core.event-store` | 事件溯源儲存（可選） | `WORKSPACE_EVENT_STORE` |

#### workspace-application（應用層）

| Feature Slice | 領域職責 | logic-overview 節點 |
|---------------|----------|---------------------|
| `workspace-application/workspace-application.command-handler` | 接收業務指令，分派至 scope-guard | `WORKSPACE_COMMAND_HANDLER` |
| `workspace-application/workspace-application.scope-guard` | 驗證 identity context + custom-claims | `WORKSPACE_SCOPE_GUARD` |
| `workspace-application/workspace-application.policy-engine` | 評估業務政策規則 | `WORKSPACE_POLICY_ENGINE` |
| `workspace-application/workspace-application.transaction-runner` | 執行聚合交易並協調 outbox | `WORKSPACE_TRANSACTION_RUNNER` |
| `workspace-application/workspace-application.outbox` | Transactional Outbox，保證事件投遞 | `WORKSPACE_OUTBOX` |

#### workspace-governance（工作區治理）

| Feature Slice | 領域職責 | logic-overview 節點 |
|---------------|----------|---------------------|
| `workspace-governance/workspace-governance.member` | 工作區成員存取控制 | `WORKSPACE_MEMBER` |
| `workspace-governance/workspace-governance.role` | 工作區角色管理 | `WORKSPACE_ROLE` |
| `workspace-governance/workspace-governance.audit-log` | 工作區操作稽核（治理職責） | `WORKSPACE_AUDIT_LOG` |

#### workspace-business（業務層，按執行流向排序）

| Feature Slice | 領域職責 | logic-overview 節點 |
|---------------|----------|---------------------|
| `workspace-business/workspace-business.tasks` | 任務管理 | `WORKSPACE_BUSINESS_TASKS` |
| `workspace-business/workspace-business.quality-assurance` | 品質保證 | `WORKSPACE_BUSINESS_QUALITY_ASSURANCE` |
| `workspace-business/workspace-business.acceptance` | 業務受理／驗收 | `WORKSPACE_BUSINESS_ACCEPTANCE` |
| `workspace-business/workspace-business.finance` | 財務處理 | `WORKSPACE_BUSINESS_FINANCE` |
| `workspace-business/workspace-business.daily` | 日常作業記錄 | `WORKSPACE_BUSINESS_DAILY` |
| `workspace-business/workspace-business.document-parser` | AI 文件解析 | `WORKSPACE_BUSINESS_DOCUMENT_PARSER` |
| `workspace-business/workspace-business.files` | 檔案管理 | `WORKSPACE_BUSINESS_FILES` |
| `workspace-business/workspace-business.issues` | 問題追蹤（AB 雙軌問題單） | `WORKSPACE_BUSINESS_ISSUES` |
| `workspace-business/workspace-business.schedule` | 任務排程產生 → 推送至 organization-schedule | `WORKSPACE_BUSINESS_SCHEDULE` |

---

## 五、標準切片內部結構

每個 `features/{domain}/{slice}/` 資料夾遵循：

```
{slice}/
├── GEMINI.md        ← AI 指示（必填）
├── index.ts         ← 公開 API（必填，唯一對外出口）
├── _actions.ts      ← "use server" mutations（選填）
├── _queries.ts      ← Firestore reads / onSnapshot（選填）
├── _types.ts        ← 切片私有型別擴充（選填）
├── _hooks/          ← React hooks（選填）
└── _components/     ← UI 元件（選填）
```

> `_` 前綴表示**切片私有**。其他切片只能透過 `index.ts` 匯入。

---

## 六、依賴規則

### 單向依賴流

```
app/  →  features/{domain}/{slice}/index.ts  →  shared/*
```

- `app/` 只從 `features/*/index.ts`（公開 API）和 `shared/*` 匯入
- `features/*` 只從 `shared/*` 和其他切片的 `index.ts` 匯入
- `shared/*` 不依賴任何 feature slice

### 領域層級依賴方向

```
workspace-business  →  workspace-application  →  workspace-core
         ↓                      ↑
organization-schedule  ←  workspace-business.schedule
         ↑
organization-core.event-bus  →  workspace-application.scope-guard（事件橋接）

workspace-event-bus  →  workspace-governance.audit-log（操作稽核訂閱）
```

### 禁止規則

```ts
// ✅ 允許：透過公開 API 跨切片
import { useWorkspaceCommands } from "@/features/workspace/workspace-application/workspace-application.command-handler";

// ❌ 禁止：直接存取其他切片的私有路徑
import { someHook } from "@/features/workspace/workspace-core/_hooks/some-hook";

// ❌ 禁止：跨領域直接耦合（應透過 event-bus）
import { orgEntity } from "@/features/organization/organization-core/organization-core.aggregate";
```

---

## 七、Shared 基礎設施模組

```
src/shared/
├── types/     ← 所有跨切片 TypeScript 型別
├── lib/       ← 純工具函式與領域規則
├── infra/     ← Firebase 適配器與 Repository
├── ai/        ← Genkit AI flows
└── ui/        ← shadcn-ui、app-providers、i18n、常數
```

---

## 八、與 logic-overview.v3.md 的對應關係

| logic-overview 層 | features 資料夾群組 |
|-------------------|---------------------|
| Firebase Authentication | 外部服務（不在 features） |
| Identity Layer | `features/identity/` |
| Account Layer | `features/account/` |
| Organization Layer | `features/organization/` |
| Workspace Container | `features/workspace/` |
| Projection Layer | `shared/infra/` 讀取模型（不建切片） |
| Observability Layer | `shared/infra/` 可觀測性（不建切片） |

> 詳細領域邏輯流程請參閱 [`logic-overview.v3.md`](./logic-overview.v3.md)。  
> 請求執行流程請參閱 [`request-execution-overview.v3.md`](./request-execution-overview.v3.md)。  
> 指令與事件系統請參閱 [`command-event-overview.v3.md`](./command-event-overview.v3.md)。  
> 持久化模型請參閱 [`persistence-model-overview.v3.md`](./persistence-model-overview.v3.md)。  
> 基礎設施整合請參閱 [`infrastructure-overview.v3.md`](./infrastructure-overview.v3.md)。
