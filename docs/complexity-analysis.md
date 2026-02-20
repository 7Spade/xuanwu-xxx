# 架構複雜度分析報告 (Complexity Analysis)

> **目的**：運用 repomix 對全專案進行深度掃描，找出「明明可以很簡單，卻搞得很複雜」的地方，做為重構討論基礎。不改代碼，純討論。

---

## 總覽

透過 repomix 掃描 312 個原始碼檔案後，歸納出以下 7 個核心問題，按嚴重程度排序：

| # | 問題 | 影響範圍 | 嚴重度 |
|---|------|----------|--------|
| 1 | `@plugin-tab` 中 12 個完全相同的 `error.tsx` | 12 個檔案 → 可減為 1 個 | 🔴 高 |
| 2 | 4 層無意義委派：`server-commands` → `facade` → `repositories` → SDK | 全資料流 | 🔴 高 |
| 3 | `view-modules` 違反單向依賴，反向 import `app/` 層 | 8 個 view-module | 🔴 高 |
| 4 | `WorkspaceProvider` 是個包含 16 個 `useCallback` 的 God Object | 整個 workspace 功能 | 🟠 中高 |
| 5 | `use-cases/` 中幾個只是 UI 組件的 re-export | 5 個 use-case | 🟠 中 |
| 6 | 全頁版與彈窗版的邏輯完全重複 (canonical + modal route) | 4 對頁面 | 🟡 中 |
| 7 | 空佔位符檔案（dead code） | 4 個檔案 | 🟢 低 |
| 8 | GEMINI.md 文件引用過時路徑 | 1 個文件 | 🟢 低 |

---

## 問題一：12 個 `@plugin-tab/*/error.tsx` 全部 100% 相同

### 現況

在 `src/app/dashboard/workspaces/[id]/@plugin-tab/` 目錄下，12 個子槽各自有一個 `error.tsx`，內容**一字不差**：

```tsx
// acceptance/error.tsx = audit/error.tsx = daily/error.tsx = ... (全部相同)
"use client"
export default function CapabilityError({ error, reset }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <AlertCircle className="w-10 h-10 text-destructive" />
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      ...
    </div>
  )
}
```

### 問題

- **12 個檔案 → 0 個差異**：完全違反 DRY 原則
- 若要修改錯誤 UI（例如加上錯誤碼或多語言），需要改 12 個地方
- Next.js 的 `error.tsx` 預設會**向上冒泡**，所以在 `@plugin-tab/` 的**上層**放一個共用的 error.tsx 就能覆蓋全部

### 最簡方案

只需要：
1. 在 `_route-components/` 建立一個 `CapabilityErrorBoundary` 共用組件
2. 在 `@plugin-tab/` 的**父層** (`[id]/`) 放一個 `error.tsx` 即可，12 個子目錄不需要各自的

---

## 問題二：4 層委派鏈 — 函數簽名完全相同卻轉手 3 次

### 現況

以 `createTask` 為例，呼叫路徑如下：

```
組件呼叫 useWorkspace().createTask(workspaceId, taskData)
  ↓ (workspace-provider.tsx)
  useCallback(async (task) => createTaskAction(workspaceId, task))
  
  ↓ (server-commands/task/index.ts)
  createTask(workspaceId, taskData) {
    return createTaskFacade(workspaceId, taskData)  // 完全一樣的簽名
  }
  
  ↓ (firebase/firestore/firestore.facade.ts)
  createTask = repositories.createTask  // 只是 re-assign
  
  ↓ (firebase/firestore/repositories/workspace.repository.ts)
  createTask(workspaceId, taskData) { /* 真正的 Firestore 邏輯 */ }
```

**4 層中，第 2 和第 3 層完全沒有加任何邏輯。**

`firestore.facade.ts` 自己的文件都說了：
> "now a 'thin' layer, primarily responsible for **re-exporting** functions"

而 `server-commands/task/index.ts` 的每個函數也只是 `return xyzFacade(...)` — 完全透傳。

### 統計

| 層次 | 說明 | 無意義委派數量 |
|------|------|---------------|
| `firestore.facade.ts` | 只是 `= repositories.xxx` | 42 個函數 |
| `server-commands/*/index.ts` | 只是 `return xxxFacade(...)` | 35 個函數 |

### 問題

- 追蹤一個簡單的 Firestore 寫入，需要跳過 4 個檔案
- 增加新功能時，同樣的簽名要在 4 個地方重複
- `facade` 層已名不符實（不是真正的 facade pattern，只是 barrel re-export）

### 最簡方案

**刪除 `firestore.facade.ts` 這個「薄到透明」的中間層**，讓 `server-commands` 直接 import `repositories`。

呼叫路徑縮短為：
```
組件 → server-commands/ → repositories/ → Firestore SDK
```

---

## 問題三：`view-modules/` 違反單向依賴，反向 import `app/` 層

### 現況

根據架構文件（`GEMINI.md`）定義的依賴流：
```
app → components → context → hooks → infra → lib → types
```
（以新命名對應：`app → view-modules → react-providers → react-hooks → firebase → shared → domain-types`）

但實際上，`view-modules/` 有大量的反向依賴：

```tsx
// view-modules/audit/audit-view.tsx
import { WorkspaceAudit } from "@/app/dashboard/workspaces/[id]/plugins"  // ← 反向 import app/

// view-modules/files/files-view.tsx
import { WorkspaceFiles } from "@/app/dashboard/workspaces/[id]/plugins"  // ← 反向 import app/

// view-modules/finance/finance-view.tsx
import { WorkspaceFinance } from "@/app/dashboard/workspaces/[id]/plugins"  // ← 反向 import app/

// view-modules/workspace-members/workspace-members-view.tsx
import { WorkspaceMembers } from "@/app/dashboard/workspaces/[id]/plugins"  // ← 反向 import app/

// view-modules/dashboard/dashboard-view.tsx
import { StatCards } from "@/app/dashboard/_route-components/overview/stat-cards"  // ← 反向 import app/
import { AccountGrid } from "@/app/dashboard/_route-components/overview/account-grid"
// ...

// view-modules/user-settings/user-settings-view.tsx
import { UserSettings } from "@/app/dashboard/_route-components/settings"  // ← 反向 import app/

// view-modules/auth/login-view.tsx
import { AuthBackground } from "@/app/(auth-routes)/login/_route-components/auth-background"  // ← 反向 import app/
```

### 問題

這 8 個 `view-modules` 本身只是 thin wrapper，實際組件仍住在 `app/` 層。這讓 `view-modules` 變成完全無意義的中間層：

```tsx
// view-modules/audit/audit-view.tsx — 7 行
export function AuditCapabilityView() {
  return <WorkspaceAudit />  // WorkspaceAudit 住在 app/ 層
}
```

然後 `@plugin-tab/audit/page.tsx` import 這個 view：
```tsx
import { AuditCapabilityView } from "@/view-modules/audit/audit-view"
export default function AuditCapabilityPage() {
  return <AuditCapabilityView />  // 最終還是等於 <WorkspaceAudit />
}
```

**三層繞回到同個地方。**

### 最簡方案

**讓 `@plugin-tab/audit/page.tsx` 直接 import `plugins` 裡的組件**，刪除這些 7 行的 wrapper view-modules。

---

## 問題四：`WorkspaceProvider` 是一個含 16 個 `useCallback` 的 God Object

### 現況

`workspace-provider.tsx` 把所有 workspace 相關操作全部裝進 Context：

```tsx
// workspace-provider.tsx 節錄
const createTask     = useCallback(async (task) => createTaskAction(workspaceId, task), [workspaceId])
const updateTask     = useCallback(async (taskId, updates) => updateTaskAction(workspaceId, taskId, updates), [workspaceId])
const deleteTask     = useCallback(async (taskId) => deleteTaskAction(workspaceId, taskId), [workspaceId])
const authorizeWorkspaceTeam = useCallback(async (teamId) => authorizeWorkspaceTeamAction(workspaceId, teamId), [workspaceId])
const revokeWorkspaceTeam    = useCallback(async (teamId) => revokeWorkspaceTeamAction(workspaceId, teamId), [workspaceId])
const grantIndividualWorkspaceAccess  = useCallback(...)
const revokeIndividualWorkspaceAccess = useCallback(...)
const mountCapabilities   = useCallback(...)
const unmountCapability   = useCallback(...)
const updateWorkspaceSettings = useCallback(...)
const deleteWorkspace     = useCallback(...)
const createIssue         = useCallback(...)
const addCommentToIssue   = useCallback(...)
const createScheduleItem  = useCallback(...)
// ... 共 16 個 useCallback
```

### 問題

1. **每個 `useCallback` 只是把 `workspaceId` curry 進去**，沒有任何其他邏輯
2. 這讓 Context 的 `value` 物件變得巨大，任何訂閱這個 context 的組件，即使只用到 `workspace.name`，也會觸發所有 actions 的重新建立
3. **「把 workspaceId curry 進 action」** 這件事，可以在使用的地方直接做，不需要 context 作為中介

### 最簡方案

組件只從 `useWorkspace()` 取出 `workspace` 物件（狀態），再直接呼叫 server-commands 並傳入 `workspace.id`：

```tsx
// 現在（透過 context 間接）
const { createTask } = useWorkspace()
await createTask(taskData)

// 改成（直接）
const { workspace } = useWorkspace()
await createTask(workspace.id, taskData)  // server-commands/task 直接呼叫
```

Context 只需要保留**狀態類**（`workspace`, `localAuditLogs`, `eventBus`, `db`），**操作類**讓組件自己呼叫。

---

## 問題五：`use-cases/` 裡混入了不應該在這裡的 UI 組件 re-export

### 現況

`use-cases/` 應該是「多步驟業務邏輯，無 React 依賴」（根據各 GEMINI.md 定義）。但實際上：

```ts
// use-cases/members/index.ts
export { MembersView } from "@/view-modules/members/members-view"
// ↑ 純 UI 組件 re-export，跟 use-case 毫無關係

// use-cases/partners/index.ts
export { PartnersView } from "@/view-modules/partners/partners-view"
export { PartnerDetailView } from "@/view-modules/partners/partner-detail-view"

// use-cases/teams/index.ts
export { TeamsView } from "@/view-modules/teams/teams-view"
export { TeamDetailView } from "@/view-modules/teams/team-detail-view"

// use-cases/user-settings/index.ts
export { UserSettingsView } from "@/view-modules/user-settings/user-settings-view"
```

這 4 個「use-case」的整個 `index.ts` 都只是 UI 組件的 alias re-export，**完全沒有業務邏輯**。

### 問題

使用這些 use-cases 的頁面：
```tsx
// app/dashboard/account/members/page.tsx
import { MembersView } from "@/use-cases/members"
// 其實就是 view-modules/members/members-view.tsx，但繞了一層
```

這讓「use-case 是什麼」變得混亂：有些是真正的業務邏輯函數（如 `use-cases/schedule`），有些卻只是視圖的別名。

### 最簡方案

**讓 app pages 直接 import view-modules**（或 plugins），刪除這 4 個只含 re-export 的 use-case index 檔案。

---

## 問題六：Canonical Page 與 Intercepting Modal 的邏輯完全重複

### 現況

以「新增帳號」為例，有兩個頁面邏輯幾乎相同：

| 檔案 | 說明 |
|------|------|
| `account/new/page.tsx` | 直接訪問時的全頁版本（60+ 行） |
| `@modal/(.)account/new/page.tsx` | client 導航時的彈窗版本（70+ 行） |

兩個文件共享：
- 完全相同的 hooks（`useRouter`, `useI18n`, `useAccountManagement`, `useApp`）
- 完全相同的 state（`name`, `isLoading`, `pendingOrgId`）
- 幾乎相同的 `handleCreate()` 邏輯（只有最後 `router.push` vs `router.back` 的差異）
- 相同的表單 UI

同樣的模式也出現在：
- `reset-password/page.tsx` vs `@modal/(.)reset-password/page.tsx`

### 問題

業務邏輯（hooks 初始化 + handleCreate）重複了兩份，日後若要修改建立邏輯（例如加驗證），要改兩個地方。

### 最簡方案

**抽取一個共用的 `AccountCreateForm` 組件**，包含所有邏輯：
```tsx
// 接收 onSuccess callback（全頁版 push，modal 版 back）
function AccountCreateForm({ onSuccess }: { onSuccess: () => void }) {
  // 所有 hooks + state + handleCreate 放這裡
}
```

全頁版和 modal 版只需提供不同的 wrapper 和 `onSuccess`。

---

## 問題七：Dead Code — 空佔位符檔案

### 清單

| 檔案 | 內容 |
|------|------|
| `_route-components/settings/user-settings-overlay.tsx` | `return null` — 純佔位符，無任何功能 |
| `account/audit/page.tsx` | `export { default } from '.../audit.view'` — 指向一個可能已移動的 view |
| `account/daily/page.tsx` | `export { default } from '.../daily.view'` |
| `account/schedule/page.tsx` | `export { default } from '.../schedule.view'` |

`user-settings-overlay.tsx` 的注釋說：
> "This component is a placeholder as requested by the decomposition plan. Currently, there is no overlay functionality..."

這是個根本不需要存在的檔案。

---

## 問題八：文件引用過時路徑（維護成本）

`_route-components/GEMINI.md` 仍然引用遷移前的舊路徑：
- `src/hooks` → 已更名為 `src/react-hooks`
- `src/context` → 已更名為 `src/react-providers`
- `src/components` → 已更名為 `src/shared/shadcn-ui`

雖然這不影響執行期，但會誤導新加入的開發者，也反映出「文件與代碼不同步」是架構持續演進時的常見成本。

---

## 優先重構建議

如果要著手改善，建議從**最小改動、最大收益**開始：

1. **先解決問題一**：在 `@plugin-tab/` 上層放一個共用 `error.tsx` → 消除 12 個重複檔案
2. **再解決問題三**：刪除那 4 個只有 `return <WorkspaceXxx />` 的 7 行 view-module wrapper
3. **再解決問題五**：刪除那 4 個只含 UI re-export 的 use-case index 檔案

這三步不需要改業務邏輯，風險很低，但可以刪除約 40+ 個檔案中的無意義間接層。

問題二（4 層委派鏈）和問題四（WorkspaceProvider God Object）影響更廣，需要更謹慎的重構計劃。
