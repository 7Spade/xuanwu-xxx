# 資料模型與綱要 (Data Schema)

本文件概述了專案核心的資料模型及其關係，這些模型定義了 Firestore 資料庫中的主要實體結構。

## 核心實體 (Core Entities)

### 1. `User` (使用者) & `UserProfile` (使用者資料)
- **集合路徑**: `/users/{userId}`
- **描述**: 代表一個獨立的使用者帳號。`User` 主要由 Firebase Authentication 管理，而 `UserProfile` 儲存了可由使用者自訂的公開資料。
- **核心欄位**:
  - `id`: 使用者唯一識別碼 (同 Auth UID)。
  - `name`: 顯示名稱。
  - `email`: 電子郵件。
  - `bio`: 個人簡介。
  - `photoURL`: 頭像圖片 URL。
  - `expertiseBadges`: 專業技能徽章。

### 2. `Organization` (組織)
- **集合路徑**: `/organizations/{orgId}`
- **描述**: 代表一個協作的「維度」或「實體」，擁有多個成員和工作區。
- **核心欄位**:
  - `name`: 組織名稱。
  - `ownerId`: 創建者的 `userId`。
  - `members`: 成員列表 (`MemberReference[]`)，包含角色、狀態等資訊。
  - `memberIds`: 成員 ID 列表，用於 Firestore 安全規則的查詢。
  - `teams`: 團隊列表 (`Team[]`)。
  - `theme`: UI 主題設定。

### 3. `Workspace` (工作區)
- **集合路徑**: `/workspaces/{workspaceId}`
- **描述**: 一個獨立的、邏輯隔離的專案或任務空間。每個工作區都屬於一個 `User` 或 `Organization`。
- **核心欄位**:
  - `name`: 工作區名稱。
  - `dimensionId`: 所屬的 `User` 或 `Organization` 的 ID。
  - `visibility`: 可見性 (`visible` | `hidden`)。
  - `capabilities`: 掛載的能力模組列表 (`Capability[]`)。
  - `grants`: 個別成員的授權紀錄 (`WorkspaceGrant[]`)。
  - `teamIds`: 被授權的團隊 ID 列表。

### 4. `DailyLog` (每日日誌)
- **集合路徑**: `/organizations/{orgId}/dailyLogs/{logId}`
- **描述**: 一條類似社交媒體貼文的活動紀錄，包含文字和圖片。
- **核心欄位**:
  - `accountId`: 所屬組織 ID。
  - `workspaceId`: 發布來源的工作區 ID。
  - `author`: 作者資訊。
  - `content`: 文字內容。
  - `photoURLs`: 圖片 URL 列表。
  - `likes`, `likeCount`: 互動數據。

### 5. `WorkspaceTask` (工作區任務)
- **集合路徑**: `/workspaces/{workspaceId}/tasks/{taskId}`
- **描述**: 工作分解結構 (WBS) 中的一個節點，支援無限層級的嵌套。
- **核心欄位**:
  - `name`: 任務名稱。
  - `parentId`: 父任務的 ID，用於建立樹狀結構。
  - `progressState`: 任務狀態 (`todo`, `doing`, `completed`, `verified`, `accepted`)。
  - `subtotal`: 預算或價值。

## 關係圖 (Entity Relationship)

```
[ User ] --1..* owns --> [ Organization ]
   |                           |
   |                           '--1..* has --> [ MemberReference ]
   |
   '--1..* owns --> [ Workspace ] (Personal)
                           |
                           '--1..* contains --> [ WorkspaceTask / Issue / File ]

[ Organization ] --1..* owns --> [ Workspace ] (Organizational)
   |                           |
   |                           '--1..* contains --> [ WorkspaceTask / Issue / File ]
   |
   '--1..* contains --> [ DailyLog ]
   |
   '--1..* contains --> [ AuditLog ]
```
