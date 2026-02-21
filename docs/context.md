# 狀態管理架構 (Context Architecture)

本文件詳細說明了專案中基於 React Context API 的分層狀態管理策略。此設計旨在實現關注點分離、高效的數據流和可預測的狀態更新。

## 核心理念：分層提供者 (Layered Providers)

我們不使用單一的「上帝物件」(God Object) 來管理所有狀態，而是將狀態分散到具有明確職責的不同提供者 (Providers) 中。這些提供者形成一個層級結構，確保數據僅在需要的範圍內可用。

**提供者層級結構:**

```
<I18nProvider>
  <FirebaseClientProvider>
    <AuthProvider>
      <AppProvider>
        <AccountProvider>
          <WorkspaceProvider>
            {/* Components */}
          </WorkspaceProvider>
        </AccountProvider>
      </AppProvider>
    </AuthProvider>
  </FirebaseClientProvider>
</I18nProvider>
```

---

## 各提供者職責

### 1. `I18nProvider` (最外層)
- **職責**: 管理國際化 (i18n)，包括當前語系 (`locale`) 和翻譯文本 (`messages`)。
- **數據來源**: `public/localized-files/*.json`。
- **提供 Hook**: `useI18n()`。

### 2. `FirebaseClientProvider`
- **職責**: 初始化並提供所有 Firebase SDK 的客戶端實例（如 `db`, `auth`, `storage`）。
- **數據來源**: `@/shared/infra/*/*.client.ts`。
- **提供 Hook**: `useFirebase()`。

### 3. `AuthProvider`
- **職責**: 監聽 Firebase Auth 的身份驗證狀態，管理當前登入的 `user` 物件。
- **數據來源**: `firebase/auth`。
- **提供 Hook**: `useAuth()`。

### 4. `AppProvider`
- **職責**: 管理應用程式級別的狀態，這通常是與登入使用者相關的頂層數據。
- **核心狀態**:
  - `organizations`: 使用者所屬的所有組織列表。
  - `activeAccount`: 當前選擇的操作上下文，可以是「個人帳戶」或某個「組織帳戶」。
  - `notifications`: 全域通知訊息。
- **數據來源**: Firestore `organizations` 集合的監聽。
- **提供 Hook**: `useApp()`。

### 5. `AccountProvider`
- **職責**: 依賴 `AppProvider` 中的 `activeAccount`。當 `activeAccount` 變更時，此提供者負責載入該帳戶下的所有相關數據。
- **核心狀態**:
  - `workspaces`: `activeAccount` 擁有的所有工作區。
  - `dailyLogs`: `activeAccount` 範圍內的所有日誌。
  - `auditLogs`: `activeAccount` 範圍內的所有審計日誌。
- **數據來源**: Firestore 中對應 `activeAccount` 的各個子集合的監聽。
- **提供 Hook**: `useAccount()`。

### 6. `WorkspaceProvider` (最內層)
- **職責**: 用於單一工作區頁面 (`/workspaces/[id]`)，管理該工作區內部的所有狀態。
- **核心狀態**:
  - `workspace`: 當前工作區的詳細資料。
  - `tasks`: 工作區內的任務。
  - `issues`: 工作區內的問題。
  - `files`: 工作區內的檔案。
- **數據來源**: Firestore `workspaces` 集合下的特定文件及其子集合。
- **提供 Hook**: `useWorkspace()`。

## 設計優勢
- **效能**: 只有相關的提供者和其子元件會因狀態變更而重新渲染。
- **可讀性**: 狀態的來源和範圍非常清晰。
- **可維護性**: 新增或修改狀態時，只需關注對應的提供者。
