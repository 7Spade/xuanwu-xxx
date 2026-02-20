# 安全架構 (Security Architecture)

本文件闡述了應用程式的安全模型，涵蓋身份驗證、授權、資料驗證和網路安全等方面。

## 1. 身份驗證 (Authentication)

- **提供者**: 核心身份驗證服務由 **Firebase Authentication** 提供。
- **支援方法**:
  - 電子郵件/密碼
  - Google 登入
  - 匿名登入 (用於訪客體驗)
- **職責分離**:
  - **UI 層**: 負責收集使用者憑證。
  - **`firebase/auth/auth.adapter.ts`**: 唯一負責與 Firebase Auth SDK 互動的模組。
  - **`shared/app-providers/auth-provider.tsx`**: 監聽全域身份驗證狀態，並將 `user` 物件提供給整個應用程式。

## 2. 授權 (Authorization)

授權的核心在於「誰能對什麼資源執行什麼操作」。本專案採用**角色基礎的存取控制 (Role-Based Access Control - RBAC)**，並在 Firestore 安全規則中強制執行。

### A. 權限模型
- **組織層級 (`Organization`)**:
  - **角色**: `Owner`, `Admin`, `Member`, `Guest`。
  - **定義**: 權限定義在 `/organizations/{orgId}` 文件的 `members` 陣列中。
  - **規則**: 安全規則會檢查請求者的 `request.auth.uid` 是否存在於該組織的 `memberIds` 陣列中，並根據其 `role` 判斷操作權限。

- **工作區層級 (`Workspace`)**:
  - **角色**: `Manager`, `Contributor`, `Viewer`。
  - **定義**: 權限是「**團隊繼承**」和「**個人授權**」的**並集**。
    1.  **團隊繼承**: 如果使用者的團隊 `teamId` 存在於 `/workspaces/{workspaceId}` 的 `teamIds` 陣列中，則該使用者繼承團隊的權限。
    2.  **個人授權**: 在 `/workspaces/{workspaceId}` 的 `grants` 陣列中為特定 `userId` 直接授予角色。
  - **規則**: 安全規則會同時檢查這兩種授權路徑。

### B. 強制執行
- **客戶端 (Client-Side)**: UI 會根據使用者的角色隱藏或禁用不應出現的操作按鈕。**這僅僅是為了改善使用者體驗，不是安全措施。**
- **伺服器端 (Server-Side)**: **Firestore 安全規則**是最終的權威。所有直接來自客戶端的讀、寫、更新、刪除操作都必須通過安全規則的驗證。

## 3. 資料驗證 (Data Validation)

- **客戶端**: 使用 `zod` 或類似的庫在表單提交前進行基本驗證。
- **伺服器端**: **Firestore 安全規則**負責最終的資料驗證。
  - **綱要驗證**: 規則會驗證寫入的 `request.resource.data` 是否符合預期的綱要（例如，欄位是否存在、類型是否正確）。
  - **不變性**: 確保關鍵欄位（如 `ownerId`, `createdAt`, `dimensionId`）在創建後不可被修改。

## 4. 網路安全

- **通訊**: 所有客戶端與 Firebase 服務之間的通訊都透過 HTTPS/SSL 進行加密。
- **環境變數**:
  - **Firebase 設定**: `firebase.config.ts` 中的設定是公開的，不包含任何機密。
  - **私鑰**: 任何需要私鑰的操作（例如呼叫第三方服務的後端 API）都必須在 **Genkit (Cloud Functions)** 環境中完成，私鑰透過 `setGlobalOptions` 或環境變數安全地儲存，絕不能洩漏到客戶端。

## 5. 事件與日誌 (Events & Logging)

- **審計日誌 (`AuditLog`)**: 所有重要的寫操作（創建、更新、刪除）都必須觸發一個審計日誌，記錄下「誰、在何時、對什麼、做了什麼」。這為問題追蹤和安全審計提供了依據。
