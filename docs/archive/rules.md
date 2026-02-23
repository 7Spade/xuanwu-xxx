# 安全規則 (Security Rules)

本文件概述了 Firebase Firestore 和 Cloud Storage 的安全規則設計原則。

## 核心理念

安全規則是保護您後端資料的最後一道防線。它們在伺服器端強制執行，客戶端無法繞過。我們的目標是設計一組既能保證資料安全，又能賦予應用程式所需彈性的規則。

## Firestore Rules (`firestore.rules`)

### 1. 開發階段 (Development)
在開發初期，為了快速迭代，規則可能設定為較寬鬆的狀態：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // 警告：僅供開發使用
    }
  }
}
```
**警告**: 這種設定允許任何客戶端讀寫所有資料，絕不能在生產環境中使用。

### 2. 生產階段 (Production) - 設計原則
生產環境的規則將基於以下原則進行細化：

- **預設拒絕 (Default Deny)**: 除非明確允許，否則所有操作都應被拒絕。
- **角色基礎的存取控制 (Role-Based Access Control - RBAC)**:
  - **Organization 層級**: 使用者的角色 (`Owner`, `Admin`, `Member`) 儲存在 `/organizations/{orgId}` 的 `members` 陣列中。規則將檢查請求者的 `request.auth.uid` 是否在 `memberIds` 列表中，並根據其角色授予權限。
  - **Workspace 層級**: 工作區的存取權限由 `/workspaces/{workspaceId}` 中的 `grants`（個人授權）和 `teamIds`（團隊授權）共同決定。
- **資料驗證 (Data Validation)**:
  - 確保寫入的資料符合 `src/shared/types/` 中定義的綱要。例如，檢查欄位類型、長度、範圍等。
  - 確保關鍵欄位（如 `ownerId`, `dimensionId`）在創建後不可修改。
- **所有權驗證 (Ownership Verification)**:
  - 確保只有文件的所有者或具有足夠權限的管理員才能修改或刪除文件。

## Storage Rules (`storage.rules`)

Cloud Storage 的規則將與 Firestore 的資料模型連動。

- **原則**:
  - 使用者只能上傳到他們有權存取的路徑（例如，與其 `userId` 或 `workspaceId` 相關的路徑）。
  - 檔案的上傳大小、類型可以受到限制。
  - 讀取權限可以基於 Firestore 中儲存的授權資訊來決定。

**範例**: 只允許已驗證的使用者上傳到以其 `userId` 命名的資料夾中：
```
service firebase.storage {
  match /b/{bucket}/o {
    match /user-profiles/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
