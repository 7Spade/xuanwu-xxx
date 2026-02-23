# 事件驅動架構 (Event-Driven Architecture)

本文件定義了專案中圍繞 `WorkspaceEventBus` 的事件驅動模型，該模型是實現不同「能力 (Capabilities)」之間解耦通訊的核心。

## 核心理念：工作區內的解耦通訊

在一個獨立的工作區 (`Workspace`) 內，各個功能模組（如 `Tasks`, `QA`, `Daily`）被設計為互相獨立的單元。它們不直接互相呼叫，而是透過一個共享的「事件匯流排 (`Event Bus`)」來進行非同步通訊。

**工作流程:**

1.  **發布 (Publish)**: 當一個能力完成某個重要操作時（例如，`Tasks` 中的一個任務被標記為完成），它會向 `WorkspaceEventBus` 發布一個帶有特定類型和資料 (`payload`) 的事件。

2.  **路由 (Route)**: `WorkspaceEventBus` 接收到事件後，會查找所有訂閱了該事件類型的其他能力。

3.  **訂閱 (Subscribe)**: 其他能力（例如 `QA`）會預先向 `Event Bus` 註冊它們感興趣的事件。當 `Event Bus` 廣播事件時，這些訂閱者就會被觸發。

4.  **反應 (React)**: 訂閱者在接收到事件後，執行其自身的業務邏輯（例如，`QA` 能力將已完成的任務加入待驗證佇列）。

這種模式的優點是極大地降低了模組之間的耦合度，使得新增或修改功能變得更加容易和安全。

---

## 事件清單 (Event List)

以下是目前在系統中定義的關鍵工作區事件：

### 任務相關 (`workspace:tasks`)

-   **`workspace:tasks:completed`**
    -   **觸發時機**: 當一個任務的進度達到 100% 並被使用者提交時。
    -   **Payload**: `{ task: WorkspaceTask }`
    -   **主要訂閱者**: `QA` 能力（將任務加入待驗證佇列）、`Schedule` 能力（自動創建審批排程）。
    -   **用途**: 通知系統，一個工作單元已完成，可以進入下一個生命週期階段。

-   **`workspace:tasks:scheduleRequested`**
    -   **觸發時機**: 使用者在任務上點擊「加入排程」按鈕。
    -   **Payload**: `{ taskName: string }`
    -   **主要訂閱者**: `App` 層級的 Context。
    -   **用途**: 向 `Schedule` 能力發出一個「提示」，提醒使用者可以為此任務創建一個排程。

### 品質保證 (`workspace:qa`)

-   **`workspace:qa:approved`**
    -   **觸發時機**: 任務通過品質保證 (QA) 驗證。
    -   **Payload**: `{ task: WorkspaceTask, approvedBy: string }`
    -   **主要訂閱者**: `Acceptance` 能力。
    -   **用途**: 將任務推進到最終的「使用者驗收」階段。

-   **`workspace:qa:rejected`**
    -   **觸發時機**: 任務未能通過 QA 驗證。
    -   **Payload**: `{ task: WorkspaceTask, rejectedBy: string }`
    -   **主要訂閱者**: `Issues` 能力。
    -   **用途**: 將任務狀態回滾，並自動在 B-Track（問題追蹤）中創建一個高優先級的 issue。

### 驗收 (`workspace:acceptance`)

-   **`workspace:acceptance:passed`**
    -   **觸發時機**: 任務通過最終的使用者驗收。
    -   **Payload**: `{ task: WorkspaceTask, acceptedBy: string }`
    -   **主要訂閱者**: `Finance` 能力。
    -   **用途**: 標記任務徹底完成，並通知財務模組可以進行款項支付或預算結算。

-   **`workspace:acceptance:failed`**
    -   **觸發時機**: 任務在最終驗收階段被拒絕。
    -   **Payload**: `{ task: WorkspaceTask, rejectedBy: string }`
    -   **主要訂閱者**: `Issues` 能力。
    -   **用途**: 與 QA 拒絕類似，將任務回滾並創建一個緊急的 issue 進行處理。

### 文件解析 (`workspace:document-parser`)

-   **`workspace:document-parser:itemsExtracted`**
    -   **觸發時機**: AI 完成對上傳文件（如報價單）的解析，並成功提取出工作項目。
    -   **Payload**: `{ sourceDocument: string, items: Array<{...}> }`
    -   **主要訂閱者**: 全域事件處理器 (`WorkspaceEventHandler`)。
    -   **用途**: 向使用者顯示一個確認提示，詢問是否要將這些提取出的項目作為新的根任務導入到 `Tasks` 能力中。

### 日誌 (`daily:log`)

-   **`daily:log:forwardRequested`**
    -   **觸發時機**: 使用者在某個日誌上點擊「轉發」按鈕。
    -   **Payload**: `{ log: DailyLog, targetCapability: 'tasks' | 'issues', action: 'create' }`
    -   **主要訂閱者**: 全域事件處理器 (`WorkspaceEventHandler`)。
    -   **用途**: 作為一個意圖，表明使用者希望基於一條日誌的內容，在另一個能力中創建一個新的實體（例如，從一條進度報告創建一個新任務）。
