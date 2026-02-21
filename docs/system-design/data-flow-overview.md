# Data Flow Overview

> 本文件描述資料在系統中移動的四種規範路徑，並提供完整的事件匯流排目錄。
> 互動模式請參閱 [interaction-overview.md](./interaction-overview.md)。
> 原始資料流圖（含 Mermaid 時序圖）請參閱 [`src/shared/FLOWS.md`](./src/shared/FLOWS.md)。

---

## 快速決策指南

| 情境 | 使用 | 位置 |
|------|------|------|
| 單一 domain 的使用者觸發寫入 | **Flow A** — command hook | `features/{name}/_hooks/` |
| 插件 A 完成後需觸發插件 B | **Flow B** — event bus | `features/workspace-core/_components/` (WorkspaceEventBus) |
| 單一動作需 ≥2 次 Firebase 寫入 | **Flow C** — use-case | `features/{name}/_use-cases.ts` |
| 多元件共享的即時資料 | **Flow D** — provider listener | `features/{name}/_components/` (provider) |
| 純業務規則驗證 | `shared/lib` 直接呼叫 | `shared/lib/{domain}.rules.ts` |

---

## Flow A：UI 動作 → Firebase 寫入（指令流）

**適用：** 涉及單一 domain 的使用者寫入操作（書籤、按讚、任務狀態更新、排程指派等）。

### 呼叫路徑

```
1. features/{name}/_components/ or app/ component
   └── 呼叫 command hook 函式（例如 toggleLike()）

2. features/{name}/_hooks/use-daily-commands.ts
   ├── useCallback（穩定參照）
   ├── auth guard（無 activeAccount → 提早返回 + toast）
   └── await features/workspace-business.daily/_actions.ts → toggleLike(logId, userId)

3. features/workspace-business.daily/_actions.ts ("use server")
   └── await dailyRepository.toggleLike(logId, userId)

4. shared/infra/firestore/repositories/daily.repository.ts
   └── firestore.write.adapter.updateDocument(...)

5. Firestore（Google Cloud）
   └── 文件更新完成
       → (如有 onSnapshot 監聽) 觸發 Flow D 重新渲染
```

### 使用此流的 Command Hooks

| Hook | 檔案 | 主要動作 |
|------|------|---------|
| `useScheduleCommands` | `features/workspace-governance.schedule/_hooks/use-schedule-commands.ts` | approve / reject / assign / unassign |
| `useWorkspaceCommands` | `features/workspace-core/_hooks/use-workspace-commands.ts` | deleteWorkspace |
| `useDailyCommands` | `features/workspace-business.daily/_hooks/use-daily-commands.ts` | toggleLike, addComment |
| `useBookmarkCommands` | `features/workspace-business.daily/_hooks/use-bookmark-commands.ts` | toggleBookmark |

---

## Flow B：跨插件協調（事件匯流排流）

**適用：** 插件 A 完成某操作後，需要在插件 B 觸發副作用，且兩者不能直接互相 import。

### 呼叫路徑

```
1. Plugin A component（例如 tasks-plugin.tsx）
   └── const { publish } = useWorkspaceEvents()
       publish("workspace:tasks:completed", { task })

2. WorkspaceEventBus（in-memory EventEmitter）
   └── 廣播給所有訂閱者

3. app/dashboard/workspaces/[id]/_event-handlers/workspace-event-handler.tsx
   └── subscribe("workspace:tasks:completed", async ({ task }) => {
         await createScheduleItem(task)    // features/{name}/_actions.ts → schedule
         await addToQAQueue(task)          // features/{name}/_actions.ts → qa
       })

4. features/{name}/_actions.ts → {target-domain}
   └── 對應的 Firebase 寫入

5. Firestore 更新
   → (如有 onSnapshot) 觸發 Provider 重新渲染 → Plugin B 更新 UI
```

### 完整事件目錄

#### 任務事件（`workspace:tasks`）

| 事件名稱 | Payload | 觸發時機 | 主要訂閱者 |
|---------|---------|---------|-----------|
| `workspace:tasks:completed` | `{ task: WorkspaceTask }` | 任務進度達 100% 並提交 | QA（加入待驗佇列）、Schedule（自動建排程）|
| `workspace:tasks:scheduleRequested` | `{ taskName: string }` | 使用者點擊「加入排程」| AppContext（scheduleTaskRequest 狀態） |

#### QA 事件（`workspace:qa`）

| 事件名稱 | Payload | 觸發時機 | 主要訂閱者 |
|---------|---------|---------|-----------|
| `workspace:qa:approved` | `{ task, approvedBy: string }` | 任務通過 QA 驗證 | Acceptance（加入待驗收佇列） |
| `workspace:qa:rejected` | `{ task, rejectedBy: string }` | 任務未通過 QA | Issues（自動建立 High priority issue）|

#### 驗收事件（`workspace:acceptance`）

| 事件名稱 | Payload | 觸發時機 | 主要訂閱者 |
|---------|---------|---------|-----------|
| `workspace:acceptance:passed` | `{ task, acceptedBy: string }` | 任務通過最終驗收 | Finance（款項支付 / 預算結算）|
| `workspace:acceptance:failed` | `{ task, rejectedBy: string }` | 任務驗收失敗 | Issues（建立緊急 issue）|

#### 文件解析事件（`workspace:document-parser`）

| 事件名稱 | Payload | 觸發時機 | 主要訂閱者 |
|---------|---------|---------|-----------|
| `workspace:document-parser:itemsExtracted` | `{ sourceDocument, items[] }` | AI 完成文件解析 | EventHandler（確認對話框 → 批次建立任務）|

#### 每日日誌事件（`daily`）

| 事件名稱 | Payload | 觸發時機 | 主要訂閱者 |
|---------|---------|---------|-----------|
| `daily:log:forwardRequested` | `{ log, targetCapability, action }` | 使用者點擊「轉發日誌」| EventHandler（建立任務 or 議題）|

### 任務生命週期流（透過事件串聯）

```
Tasks Plugin
  │ workspace:tasks:completed
  ▼
QA Plugin ────── workspace:qa:approved ──────► Acceptance Plugin
  │                                                  │ workspace:acceptance:passed
  │ workspace:qa:rejected                            ▼
  ▼                                            Finance Plugin
Issues Plugin ◄──────────────────────── workspace:acceptance:failed
```

---

## Flow C：多步驟編排（Use-Cases 流）

**適用：** 單一使用者動作需要 ≥2 次 Firebase 寫入，且必須一起成功。

### 呼叫路徑

```
1. features/{name}/_components/ component（例如 CreateWorkspaceDialog）
   └── await createWorkspaceWithCapabilities(name, account, capabilities)

2. features/workspace-core/_use-cases.ts
   ├── await features/workspace-core/_actions.ts → createWorkspace(name, account)
   │     → 寫入 workspaces/{id}（得到 workspaceId）
   └── await features/workspace-core/_actions.ts → mountCapabilities(workspaceId, capabilities)
         → 寫入 workspaces/{id}/capabilities

3. _actions.ts → shared/infra/firestore repositories → Firestore

4. _use-cases.ts 回傳 workspaceId 給 UI
   → router.push(`/dashboard/workspaces/${workspaceId}`)
```

### 現有 Use-Case 函式

| 函式 | 模組 | 組合的 Actions |
|------|------|----------------|
| `completeRegistration(email, password, name)` | `features/account.auth/_use-cases.ts` | `registerUser` + `createUserProfile` |
| `setupOrganizationWithTeam(orgName, owner, teamName, type)` | `features/account/_use-cases.ts` | `createOrganization` + `createTeam` |
| `createWorkspaceWithCapabilities(name, account, caps)` | `features/workspace-core/_use-cases.ts` | `createWorkspace` + `mountCapabilities` |

---

## Flow D：實時狀態（Provider / Listener 流）

**適用：** 需要即時同步、且被多個元件共享的資料（工作區任務、排程清單、稽核日誌等）。

### 呼叫路徑

```
1. Firestore
   └── 文件發生變更（由 Flow A/B/C 觸發，或外部變更）

2. features/account/_components/account-provider.tsx（或 workspace-provider.tsx）
   └── onSnapshot callback 觸發
       dispatch({ type: 'SET_SCHEDULES', payload: newSchedules })

3. AppContext / AccountContext / WorkspaceContext 狀態更新

4. features/{name}/_hooks/use-workspace-schedule.ts
   └── useContext(WorkspaceContext)
       return { scheduleItems, isLoading }

5. view-modules component
   └── 自動重新渲染（React reconciliation）
```

### Provider 與監聽的 Firestore 集合對應

| Provider | 監聽集合 | 提供狀態 |
|----------|---------|---------|
| `AppProvider` | `accounts/{userId}`, `accounts?dimensionId=userId` | `activeAccount`, `accounts[]`, `notifications[]` |
| `AccountProvider` | `workspaces?dimensionId`, `accounts/{id}/schedules`, `dailyLogs?accountId`, `auditLogs?accountId` | `workspaces[]`, `scheduleItems[]`, `dailyLogs[]`, `auditLogs[]` |
| `WorkspaceProvider` | `workspaces/{id}`, `workspaces/{id}/tasks`, `workspaces/{id}/issues`, `workspaces/{id}/auditLogs` | `workspace`, `tasks{}`, `issues{}`, `files{}`, `auditLogs[]` |

### State Hooks 與 Provider 對應

| Hook | 讀取的 Context | 主要回傳值 |
|------|--------------|-----------|
| `useApp()` | AppContext | `activeAccount`, `accounts`, `notifications` |
| `useAccount()` | AccountContext | `workspaces`, `members`, `scheduleItems` |
| `useUser()` | AuthContext | `user`（Firebase Auth User）|
| `useWorkspaceSchedule()` | WorkspaceContext | 工作區範圍的排程項目 + 導航函式 |
| `useGlobalSchedule()` | AccountContext + AppContext | 跨工作區排程彙整 + 治理操作 |
| `useVisibleWorkspaces()` | AccountContext + AppContext | 依權限篩選後的工作區列表 |
| `useWorkspaceAudit()` | Firebase direct onSnapshot | 工作區稽核日誌（獨立監聽）|
| `useAccountAudit()` | Firebase direct onSnapshot | 帳號稽核日誌（獨立監聽）|

---

## 寫入動作 → 讀取更新 完整迴圈

所有寫入操作最終都透過 `onSnapshot` 自動反映到 UI，無需手動重新查詢：

```
使用者批准排程項目
  │ Flow A
  ▼
useScheduleCommands.approveScheduleItem(item)
  → features/workspace-governance.schedule/_actions.ts → approveScheduleItem(item)
    → schedule.repository.update({ status: 'OFFICIAL' })
      → Firestore 文件更新
        │ Flow D（自動）
        ▼
      AccountProvider.onSnapshot 觸發
        → dispatch SET_SCHEDULES
          → useGlobalSchedule() 回傳新狀態
            → AccountScheduleSection 重新渲染（顯示 OFFICIAL 狀態）
```

此迴圈保證 UI 永遠是 Firestore 的真實反映，無需樂觀更新（optimistic update）或手動 refetch。
