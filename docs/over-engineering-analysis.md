# 過度工程分析報告 (Over-Engineering Analysis)

> **原則**：Occam's Razor — 不要引入超過嚴格必要的複雜性。
>
> 本文件記錄通過 repomix 全景掃描後發現的「明明可以很簡單、卻搞得很複雜」的具體案例，供團隊討論並決定是否重構。
>
> **狀態**：僅討論，不改代碼。

---

## 問題 1 — 12 個完全相同的 `error.tsx` 檔案

### 現狀

`@plugin-tab/` 平行路由下的 12 個插件目錄（acceptance、audit、capabilities、daily、document-parser、files、finance、issues、members、qa、schedule、tasks）各自都有一個 `error.tsx`。

```bash
$ md5sum src/app/dashboard/workspaces/[id]/@plugin-tab/*/error.tsx
5c7d67e2c33d24d2ef6684f280b46d25  acceptance/error.tsx
5c7d67e2c33d24d2ef6684f280b46d25  audit/error.tsx
5c7d67e2c33d24d2ef6684f280b46d25  capabilities/error.tsx
# ... 所有 12 個的 md5 完全一致
```

**12 個檔案，內容 100% 相同，沒有任何差異。**

### 為什麼複雜？

Next.js 的 `error.tsx` 需要放在路由段（route segment）裡，**但它並不強制每個目錄都要有自己的實作**。如果父層 `@plugin-tab/` 目錄有一個 `error.tsx`，Next.js 會向上冒泡（bubble up）找到最近的 error boundary。

因此，整個 12 個目錄可以共用**一個** `@plugin-tab/error.tsx`（或在 `[id]/` 層），其餘 12 個 `*/error.tsx` 全部刪除。

### 建議

```
@plugin-tab/
  error.tsx        ← 一個，共用
  default.tsx
  acceptance/
    loading.tsx
    page.tsx       ← 刪掉 error.tsx
  audit/
    loading.tsx
    page.tsx       ← 刪掉 error.tsx
  ...
```

**減少：12 個檔案 → 1 個。節省 ~330 行 boilerplate。**

---

## 問題 2 — 8 個內容相同的 `loading.tsx` 檔案

### 現狀

12 個插件的 `loading.tsx` 中，有 8 個（acceptance、capabilities、document-parser、files、finance、issues、members、qa）使用完全相同的通用 skeleton 佈局：

```tsx
// 所有 8 個的內容一模一樣
import { Skeleton } from "@/shared/shadcn-ui/skeleton"
export default function Loading() {
  return (
    <div className="space-y-4 pt-4">
      <Skeleton className="h-7 w-2/5" />
      <Skeleton className="h-56 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  )
}
```

剩下 4 個（audit、daily、schedule、tasks）有自己特定的 skeleton 佈局，這是正確的。

### 建議

同上，`@plugin-tab/loading.tsx` 放通用版本，8 個相同的刪除，4 個有意義的保留。

**減少：8 個檔案 → 0 個（由父層承接）。**

---

## 問題 3 — 4 層傳遞鏈（Pass-Through Delegation）

### 現狀

以「卸載能力（unmountCapability）」為例，追蹤整個調用鏈：

```
WorkspaceProvider.unmountCapability (useCallback)
  └─ server-commands/workspace/index.ts → unmountCapabilityFacade(...)
       └─ firebase/firestore/firestore.facade.ts → repositories.unmountCapability
            └─ firebase/firestore/repositories/index.ts → export * from './workspace.repository'
                 └─ firebase/firestore/repositories/workspace.repository.ts  ← 實際代碼在這
```

**5 個檔案（4 個都是純中繼），才能到達真正的 Firestore 邏輯。**

### 逐層分析

| 層 | 檔案 | 做了什麼 | 有意義嗎？ |
|---|---|---|---|
| `server-commands/workspace/index.ts` | 每個函數都是 `return functionFacade(args)` | 純 pass-through | ❌ |
| `firestore.facade.ts` | 100% re-export：`export const X = repositories.X` | 純 re-export | ❌ |
| `repositories/index.ts` | `export * from './workspace.repository'` | 純 barrel | ⚠️ (barrel 本身有用，但不需要 facade 再包一層) |
| `repositories/workspace.repository.ts` | 真正的業務邏輯 | ✅ 有意義 |

`server-commands/workspace/index.ts` 的 9 個函數全部都是：
```ts
export async function createWorkspace(name, account) {
  return createWorkspaceFacade(name, account)  // 唯一一行，只是轉發
}
```

**這不是「業務邏輯隔離」，這是「名義上的隔離，實際上的噪音」。**

`firestore.facade.ts` 也只是 `repositories` barrel 的鏡像，加了命名空間但沒有新邏輯。

### 建議

`WorkspaceProvider` 可以直接 import `@/firebase/firestore/repositories`（或直接從 `@/firebase` 的 barrel）。可去掉：
- `server-commands/workspace/index.ts` 的 pass-through 函數（真正有邏輯的 `schedule/index.ts` 等保留）
- `firestore.facade.ts`（直接用 `repositories` barrel）

---

## 問題 4 — `view-modules` 反向引入 `app/` 層（架構違規）

### 現狀

專案架構明確規定單向依賴：`app → view-modules → hooks → infra → ...`

但 `view-modules` 層中有多個檔案直接從 `@/app/` 導入：

```ts
// view-modules/audit/audit-view.tsx
import { WorkspaceAudit } from "@/app/dashboard/workspaces/[id]/plugins"

// view-modules/files/files-view.tsx
import { WorkspaceFiles } from "@/app/dashboard/workspaces/[id]/plugins"

// view-modules/finance/finance-view.tsx
import { WorkspaceFinance } from "@/app/dashboard/workspaces/[id]/plugins"

// view-modules/workspace-members/workspace-members-view.tsx
import { WorkspaceMembers } from "@/app/dashboard/workspaces/[id]/plugins"

// view-modules/dashboard/dashboard-view.tsx
import { StatCards, AccountGrid, WorkspaceList, PermissionTree }
  from "@/app/dashboard/_route-components/overview/..."

// view-modules/auth/login-view.tsx
import { AuthBackground } from "@/app/(auth-routes)/login/_route-components/auth-background"
import { AuthTabsRoot } from "@/app/(auth-routes)/login/_route-components/auth-tabs-root"
```

而 `app/` 也同時引用 `view-modules`（正確方向）：
```ts
// app/@plugin-tab/audit/page.tsx
import { AuditCapabilityView } from "@/view-modules/audit/audit-view"
```

這形成了循環依賴：`app ↔ view-modules`。

### 為什麼這樣發生？

這些 `view-modules` 只是空殼包裹，沒有自己的邏輯：

```ts
// audit-view.tsx 的完整內容：
export function AuditCapabilityView() {
  return <WorkspaceAudit />  // 只有這一行
}
```

**這一層存在的唯一理由是「架構規定 app/ 層要通過 view-modules 橋接」，但它同時向 app/ 反向引用，讓這個規定自我矛盾。**

### 建議

這 4 個 `view-modules` wrapper（audit、files、finance、workspace-members）毫無邏輯，應直接在 `@plugin-tab/*/page.tsx` 裡從 `../../plugins` 導入（正如 acceptance、tasks、schedule 等已經在做的）：

```ts
// 現在（多餘的繞路）
import { AuditCapabilityView } from "@/view-modules/audit/audit-view"
// view-modules/audit-view.tsx → import { WorkspaceAudit } from "@/app/..."

// 應該（直接，且符合 @plugin-tab 的規定）
import { WorkspaceAudit } from "../../plugins"
```

---

## 問題 5 — `use-cases/` 層混用真實用例和視圖組件 re-export

### 現狀

`use-cases/` 目錄應該是「無 React、無 UI、可在 hooks/context/Server Actions 中調用的純業務邏輯」（見 `GEMINI.md` 原則）。

但實際情況：

```ts
// use-cases/members/index.ts
export { MembersView } from "@/view-modules/members/members-view"
// ❌ MembersView 是一個 React UI 組件，不是 use-case

// use-cases/teams/index.ts
export { TeamsView } from "@/view-modules/teams/teams-view"
export { TeamDetailView } from "@/view-modules/teams/team-detail-view"
// ❌ 同上

// use-cases/partners/index.ts
export { PartnersView } from "@/view-modules/partners/partners-view"
export { PartnerDetailView } from "@/view-modules/partners/partner-detail-view"
// ❌ 同上

// use-cases/user-settings/index.ts
export { UserSettingsView } from "@/view-modules/user-settings/user-settings-view"
// ❌ 同上
```

對比真正有邏輯的 use-case：

```ts
// use-cases/auth/index.ts — 真實的用例
export async function completeRegistration(email, password, name) {
  const uid = await registerUser(email, password, name)
  await createUserAccount(uid, name, email)  // 兩個步驟合一
}
```

### 問題

- 4 個 `use-cases` 檔案是「UI 組件的通道」，語義完全錯誤
- 讓人誤以為 `use-cases/` 是 UI 查找的地方
- 這些 re-export 的消費者（`app/account/**/page.tsx`）可以直接從 `@/view-modules` 導入

---

## 問題 6 — `WorkspaceProvider` 中的 16 個 `useCallback` 部分應用

### 現狀

`workspace-provider.tsx` 中有大量這樣的 `useCallback`：

```ts
const createTask = useCallback(
  async (task) => createTaskAction(workspaceId, task),
  [workspaceId]
)
const updateTask = useCallback(
  async (taskId, updates) => updateTaskAction(workspaceId, taskId, updates),
  [workspaceId]
)
const deleteTask = useCallback(
  async (taskId) => deleteTaskAction(workspaceId, taskId),
  [workspaceId]
)
// ... 共 16 個，全部是「把 workspaceId 作為第一個參數注入」的閉包
```

### 問題

這是在用 React 的 `useCallback` 實現**部分應用（partial application）**。每個 callback 的 deps 都只有 `[workspaceId]`，邏輯是：「當 workspaceId 變化時重新建立閉包」。

這 16 個 `useCallback` 可以用一個計算屬性或 `useMemo` 統一處理：

```ts
// 概念示意（不改代碼）
const bound = useMemo(() => bindAll(serverCommands, workspaceId), [workspaceId])
```

或者，更簡單地，消費者組件可以直接從 `useWorkspace()` 取得 `workspaceId`，自己調用 server-commands，不需要 provider 包裝這些動作。

---

## 問題 7 — `PageHeader` 在 9 個檔案中各自定義

### 現狀

以下 9 個檔案各自定義了幾乎相同的 `PageHeader` 局部組件：

```
src/app/dashboard/workspaces/_route-components/workspace-list-header.tsx
src/app/dashboard/workspaces/[id]/layout.tsx
src/view-modules/dashboard/dashboard-view.tsx
src/view-modules/teams/team-detail-view.tsx
src/view-modules/teams/teams-view.tsx
src/view-modules/partners/partners-view.tsx
src/view-modules/partners/partner-detail-view.tsx
src/view-modules/user-settings/user-settings-view.tsx
src/view-modules/members/members-view.tsx
```

各版本的 `PageHeader` 接受幾乎相同的 props（`title`, `description`, `children`, `badge`），佈局也相同（`flex-col md:flex-row justify-between`）。

### 建議

一個共享的 `shared/shadcn-ui/page-header.tsx`（或放在 `shared/` 下的任意適當位置）即可服務所有場景。

---

## 問題 8 — `WorkspaceEventProvider` 的命名混淆

### 現狀

```
src/react-providers/workspace-event-provider.tsx
```

這個檔案的名字叫 `workspace-event-provider.tsx`，但它**沒有導出任何 Provider 組件**。它只導出：
- `WorkspaceEventContext`（context object）
- `useWorkspaceEvents()`（hook）

真正的 `<WorkspaceEventContext.Provider>` 是在 `workspace-provider.tsx` 的末尾渲染的：

```tsx
// workspace-provider.tsx
return (
  <WorkspaceEventContext.Provider value={{ publish, subscribe }}>
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  </WorkspaceEventContext.Provider>
);
```

### 問題

- 檔名暗示「這是一個可使用的 Provider 組件」，但實際上它只是 context + hook 的定義檔
- 更合適的命名：`workspace-event-context.ts`（不含 Provider 後綴）

---

## 問題 9 — `firestore.write.adapter.ts` / `firestore.read.adapter.ts` 幾乎沒有抽象價值

### 現狀

`firestore.write.adapter.ts` 對 Firebase SDK 的封裝：

```ts
export const addDocument = (path, data) => addDoc(collection(db, path), data)
export const setDocument = (path, data) => setDoc(doc(db, path), data)
export const updateDocument = (path, data) => updateDoc(doc(db, path), data)
export const deleteDocument = (path) => deleteDoc(doc(db, path))
```

每個函數的功能是：**將 path 字串轉換為 `doc(db, path)` 或 `collection(db, path)`**，然後調用 Firebase SDK 的對應函數。

這個「抽象」加了一個間接層，但：
1. 不能用於 transaction（`runTransaction` 需要傳入 transaction 對象，adapter 不支援）
2. 不能用於需要 converter 的讀取（adapter 的 converter 支援是可選的，但實際幾乎沒有用到）
3. 節省的 boilerplate 非常有限（`doc(db, path)` vs 直接調用 Firebase）

事實上，`workspace.repository.ts` 在需要 transaction 時，**直接 import 了 Firebase SDK**：

```ts
import { doc, runTransaction } from 'firebase/firestore'
import { db } from '../firestore.client'
```

這說明 adapter 層本身已經被繞過，形成了「部分使用 adapter、部分直接用 SDK」的混合狀態。

---

## 綜合統計

| # | 問題 | 現有數量 | 可削減至 | 節省 |
|---|---|---|---|---|
| 1 | 相同 `error.tsx` | 12 個 | 1 個 | 刪除 11 個 |
| 2 | 相同 `loading.tsx` | 8 個 | 0 個（由父層承接）| 刪除 8 個 |
| 3 | `server-commands` pass-through | workspace 9 個，全域 ~30 個 | 0（直接調用 repo）| 減少 ~30 個函數 |
| 4 | `view-modules` 反向 import | 6 個檔案 | 0 | 修正架構違規 |
| 5 | `use-cases` 視圖 re-export | 4 個 | 0（直接從 view-modules 導入）| 刪除 4 個偽用例 |
| 6 | `WorkspaceProvider` useCallback | 16 個 | 可合一 | 簡化 provider |
| 7 | `PageHeader` 重複定義 | 9 個 | 1 個共享組件 | 刪除 8 個 |
| 8 | 命名混淆 Provider | 1 個 | 重命名 | 澄清語義 |
| 9 | write/read adapter 繞過 | 混合使用 | 統一策略 | 降低心智負擔 |

---

## 優先級建議

若要逐步改善，建議優先順序：

1. **立刻可做（純刪除，零風險）**：刪除 11 個重複的 `error.tsx`、8 個重複的 `loading.tsx`（問題 1、2）
2. **低風險重構**：將 `view-modules/audit|files|finance|workspace-members` 的空殼刪除，讓 `@plugin-tab/**/page.tsx` 直接 import `../../plugins`（問題 4）
3. **中風險但高收益**：提取 `PageHeader` 為共享組件（問題 7）
4. **需要討論**：是否保留 `server-commands` 這個間接層（問題 3），這涉及到未來是否轉換為 Next.js Server Actions 的策略決策
