# Interaction Overview

> 本文件描述各層之間在執行時期的互動關係：誰呼叫誰、以何種方式呼叫、React 元件的生命週期邊界在哪裡。
> 依賴規則（靜態 import 限制）請參閱 [dependency-overview.md](./dependency-overview.md)。
> 資料流細節請參閱 [data-flow-overview.md](./data-flow-overview.md)。

---

## 一、全域啟動順序

應用程式啟動時，Provider 由外向內依序掛載：

```
src/app/layout.tsx
  ├── FirebaseProvider          ← 注入 Firebase App, Firestore, Auth, Storage 實例
  │     └── AuthProvider       ← onAuthStateChanged 監聽；提供 { user, authInitialized }
  │           └── ThemeProvider← next-themes
  │                 └── I18nProvider
  │                       └── AppProvider  ← accounts, activeAccount, notifications, capabilitySpecs
```

```
src/app/dashboard/layout.tsx   ← 含 auth guard（若未登入 → /login）
  └── AccountProvider          ← 監聽當前帳號的 workspaces, members, schedules, dailyLogs, auditLogs
        └── [page children]
              └── WorkspaceProvider  ← 掛載於 workspaces/[id]/layout.tsx；監聽單一 workspace 的 tasks, issues, files
```

**互動關係：** 每一個 Provider 在 `useEffect` 中呼叫 `shared/infra/firestore` 的 `onSnapshot`，並在 `setState` 變更時通知所有消費者（透過 `useContext`）。

---

## 二、層間呼叫關係圖

```
┌──────────────────────────────────────────────────────────┐
│  app/  (純路由組裝，無業務邏輯)                            │
│    ↓ renders                                             │
│  features/{name}/_components/  (功能 UI)                 │
│    ↓ calls                    ↓ reads context via        │
│  features/{name}/_hooks/      features/{name}/_hooks/    │
│  (command hooks)              (state hooks, useContext)  │
│    ↓ await                      ↑ onSnapshot             │
│  features/{name}/_actions.ts  features/{name}/_queries.ts│
│    ↓ calls                    (provider)                 │
│  shared/infra/firestore/repositories/                    │
│    ↓ read/write                                          │
│  Firestore (Google Cloud)                                │
└──────────────────────────────────────────────────────────┘
```

---

## 三、React 元件互動邊界

### 3.1 Server Component vs Client Component

| 位置 | 渲染方式 | 原因 |
|------|---------|------|
| `app/**/page.tsx` | 大多為 Client Component（`"use client"`） | 需要 useContext（Auth guard、Provider 資料） |
| `app/**/layout.tsx` | Client Component | 需要 useRouter、useState（auth guard + 導航邏輯） |
| `app/**/loading.tsx` | Server Component | 純 Skeleton UI，無互動 |
| `features/{name}/_components/**` | Client Component | 所有元件均依賴 Context 或 Hook |
| `features/{name}/_actions.ts → **` | Server-safe（無 React） | Next.js Server Action 相容 |

### 3.2 Page → View Module 互動

每個 `page.tsx` 只做一件事：**import 並渲染 view-module**。

```
app/dashboard/account/schedule/page.tsx
  → import { AccountScheduleSection } from '@/features/{name}/_components/schedule'
  → return <AccountScheduleSection />
```

`AccountScheduleSection` 內部：
```
AccountScheduleSection
  ├── useGlobalSchedule()          ← 讀取 AppContext / AccountContext
  ├── useScheduleCommands()        ← 呼叫 features/{name}/_actions.ts → schedule
  └── <UnifiedCalendarGrid />      ← 純展示子元件
      <GovernanceSidebar />        ← 呼叫 useScheduleCommands().approve/reject
```

### 3.3 平行路由 Slot 互動（Parallel Routes）

Dashboard 的 `layout.tsx` 接收三個 slot 作為 `ReactNode` prop：

```tsx
// app/dashboard/layout.tsx
<SidebarProvider>
  {sidebar}      ← @sidebar/default.tsx → <DashboardSidebar />
  <SidebarInset>
    {header}     ← @header/default.tsx  → <Header />
    <main>{children}</main>
  </SidebarInset>
  {modal}        ← @modal/default.tsx   → null（或攔截路由渲染的 Dialog）
</SidebarProvider>
```

**Slot 間通訊：** Slot 之間不能直接互相呼叫。所有共享狀態必須透過 React Context（`AppProvider`、`WorkspaceProvider`）。

例：`@sidebar` 中的 AccountSwitcher 呼叫 `setActiveAccount()`（AppContext action），`@header` 中的 Breadcrumb 讀取 `usePathname()`（Next.js hook），兩者**不直接互動**。

### 3.4 攔截路由（Intercepting Routes）互動

攔截路由讓同一個 URL 在導航時呈現為 Dialog，在直接訪問時呈現為全頁：

```
使用者從 schedule 插件點擊「新建排程」:
  → router.push('/dashboard/workspaces/[id]/schedule-proposal')
  → @modal/(.)schedule-proposal/page.tsx 攔截
  → 渲染 ScheduleProposalContent 包裹在 Dialog 中

使用者直接訪問 /dashboard/workspaces/[id]/schedule-proposal:
  → schedule-proposal/page.tsx（canonical）
  → 渲染 ScheduleProposalContent 作為全頁
```

**共用邏輯：** `ScheduleProposalContent` 元件被兩個路由共用，確保 Dialog 版與全頁版行為一致。

---

## 四、Command Hook 互動模式

Command Hook 是 UI 與 Firebase 寫入之間的標準橋樑：

```
useScheduleCommands()
  ├── approveScheduleItem(item)
  │     ├── 驗證 activeAccount guard
  │     ├── await features/workspace-governance.schedule/_actions.ts → approveScheduleItem(item)
  │     └── toast.success("Schedule approved")
  ├── rejectScheduleItem(item, reason)
  │     ├── 驗證 activeAccount guard
  │     ├── await features/workspace-governance.schedule/_actions.ts → rejectScheduleItem(item, reason)
  │     └── toast.success("Schedule rejected")
  └── assignScheduleItem(itemId, assigneeIds)
        └── await features/workspace-governance.schedule/_actions.ts → assignScheduleMembers(...)
```

**互動規則：**
- Command Hook 以 `useCallback` 包裝所有函式，確保參照穩定性
- 失敗時 `toast.destructive`；成功時 `toast.success`
- 不持有本地狀態（狀態由 Provider 的 `onSnapshot` 自動更新）

---

## 五、事件匯流排互動（跨插件協調）

事件匯流排解決「插件 A 完成後需通知插件 B」的問題，兩者**不直接 import**。

### 事件發布（Publisher）

```
tasks-plugin.tsx
  → const { publish } = useWorkspaceEvents()
  → publish("workspace:tasks:completed", { task })
```

### 事件訂閱（Subscriber）

```
app/dashboard/workspaces/[id]/_event-handlers/workspace-event-handler.tsx
  → useEffect(() => {
      subscribe("workspace:tasks:completed", async ({ task }) => {
        await createScheduleItem(...)   // features/{name}/_actions.ts → schedule
        await createQAItem(...)         // features/{name}/_actions.ts → qa
      })
    }, [])
```

### 完整事件流拓撲

```
Tasks Plugin   ──── workspace:tasks:completed ────►  EventHandler
                                                        ├── features/{name}/_actions.ts → schedule
                                                        └── features/{name}/_actions.ts → qa

QA Plugin      ──── workspace:qa:approved ──────────►  EventHandler
                                                        └── features/{name}/_actions.ts → acceptance

QA Plugin      ──── workspace:qa:rejected ──────────►  EventHandler
                                                        └── features/{name}/_actions.ts → issue (create issue)

Acceptance     ──── workspace:acceptance:passed ────►  EventHandler
                                                        └── features/{name}/_actions.ts → finance

Acceptance     ──── workspace:acceptance:failed ────►  EventHandler
                                                        └── features/{name}/_actions.ts → issue

Tasks Plugin   ──── workspace:tasks:scheduleRequested►  AppContext (scheduleTaskRequest state)
                                                        └── UI prompt to user

Document Parser ─── workspace:document-parser:itemsExtracted ► EventHandler
                                                        └── confirmation dialog → bulk task import

Daily Plugin   ──── daily:log:forwardRequested ─────►  EventHandler
                                                        └── features/workspace-business.tasks/_actions.ts →  or /issue
```

---

## 六、Firestore 實時監聽互動

Provider 層設定 `onSnapshot` 監聽，當 Firestore 資料變更時自動觸發 React 重新渲染：

```
Firestore 文件變更
  → AccountProvider.onSnapshot(accounts/{accountId}/schedules)
    → dispatch({ type: 'SET_SCHEDULES', payload })
      → useGlobalSchedule() 讀取最新 schedules
        → AccountScheduleSection 重新渲染（無需使用者操作）
```

**重要：** Provider 的 `onSnapshot` 在元件 unmount 時由 `useEffect` 的回傳函式自動取消訂閱，防止記憶體洩漏。

---

## 七、認證流程互動

```
使用者提交登入表單
  → LoginForm.handleSubmit()
    → features/account.auth/_use-cases.ts: completeRegistration() 或 features/account.auth/_actions.ts → signIn()
      → shared/infra/auth/auth.adapter.signIn()
        → Firebase Auth（Google Cloud）
          → onAuthStateChanged 觸發
            → AuthProvider.setState({ user })
              → DashboardLayout auth guard 解除
                → router.push('/dashboard')
```

**登出流程：**
```
NavUser.handleSignOut()
  → features/account.auth/_actions.ts → signOut()
    → shared/infra/auth/auth.adapter.signOut()
      → onAuthStateChanged({ user: null })
        → AuthProvider.setState({ user: null })
          → DashboardLayout → router.push('/login')
```
