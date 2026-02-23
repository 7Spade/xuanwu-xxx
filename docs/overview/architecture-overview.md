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
| 9 | `document-parser` 孤立於業務流程之外 | `W_B_PARSER` 為無邊的輔助節點，與 A 軌脫鉤 | 引入 `ParsingIntent（解析意圖中繼聚合）` 節點：`W_B_FILES -.-> W_B_PARSER --> PARSING_INTENT`；PARSING_INTENT 依意圖類型路由至 `TRACK_A_TASKS`（任務批次草稿） 或 `TRACK_A_FINANCE`（財務指令），解析異常走 B 軌；`TRACK_B_ISSUES -.->|重新解析| PARSING_INTENT` 形成閉環 | Parser 只負責產出意圖，不直接依賴任何業務模組；路由邏輯集中在 ParsingIntent，符合單一職責；B 軌回流到 PARSING_INTENT 而非直接回 Parser，保持中繼聚合為唯一入口 |
| 10 | `ParsingIntent →任務指令→ TRACK_A_TASKS` 與父子任務衝突 | 邊標籤為「任務指令」，暗示單筆任務派發；但 `WorkspaceTask.parentId` 是 Firestore 文件 ID，子任務在父任務建立前無法取得父 ID，導致批次解析→多次獨立 createTask 時 parentId 為空，父子關係斷裂 | 邊標籤改為「任務批次草稿（含層級結構）」；`ParsingIntent` 攜帶 `taskDrafts[]`，使用**相對索引（parentIndex）** 表示父子關係（不含 Firestore ID）；`TRACK_A_TASKS` 接收後發出單一 `CreateTaskTreeCommand`，由 `workspace-application.transaction-runner` 以**拓樸順序**原子化建立（先根節點取得 ID，再建子節點賦值 parentId），整棵樹在一個交易內完成 | 父子 ID 綁定完全在 tasks 切片內部（+交易執行器）解決，`ParsingIntent` 不感知 Firestore ID 的生成順序；B 軌異常（如樹建立失敗）透過 `TRACK_A_TASKS -->|異常| TRACK_B_ISSUES` 回報，不需特殊路徑；整體閉環無衝突 |
| 11 | `WORKSPACE_BUSINESS --> WORKSPACE_COMMAND_HANDLER` 方向錯誤 | 業務層「主動呼叫」指令處理器，暗示 Domain 控制 Application，違反依賴倒置原則 | 移除該邊；新增 `SERVER_ACTION["_actions.ts（業務觸發入口）"] -->|發送 Command| WORKSPACE_COMMAND_HANDLER` 外部入口節點，橙色樣式；新增 `WORKSPACE_TRANSACTION_RUNNER -.->|執行業務領域邏輯| WORKSPACE_BUSINESS` 顯示應用層呼叫領域層的正確方向 | Application Layer（command-handler → transaction-runner）呼叫 Domain Layer（business logic）；Server Action 是命令的觸發源，屬於 UI 邊界，不是 Domain 的一部分 |
| 12 | `W_B_SCHEDULE` 排程觸發源不明 | 排程模組孤立，圖中無任何驅動源指向它 | 新增 `TRACK_A_TASKS -.->|任務分配／時間變動觸發| W_B_SCHEDULE`；任務分配或時程變動是排程重算的自然觸發源 | 排程是任務分配的下游產物；A 軌任務節點狀態變動時自動觸發排程重算，形成閉環 |
| 13 | `W_B_SCHEDULE --> ORGANIZATION_SCHEDULE` 跨層直接耦合 | 工作區業務層直接同步寫入組織層狀態，破壞聚合邊界（Aggregate Boundary），多工作區並行修改時產生併發衝突 | 移除直接邊；改為事件驅動：工作區排程計算完成後更新 `WORKSPACE_AGGREGATE` 狀態，透過 `WORKSPACE_OUTBOX → WORKSPACE_EVENT_BUS -->|ScheduleProposed 事件| ORGANIZATION_SCHEDULE`，組織層訂閱後自主更新人力排程 | 達成 Workspace ↔ Organization 完全解耦；支援多工作區同時提案排程而不衝突；最終一致性由 Outbox 模式保證 |
| 14 | `W_B_SCHEDULE` 同步更新導致工作區交易沉重 | 排程直接寫入組織狀態，ORGANIZATION_SCHEDULE 失敗會使整個工作區業務交易回滾，使用者體驗不佳 | 配合 #13 改為非同步事件投遞；`ScheduleProposed` 事件在工作區本地交易提交後投遞，組織層獨立處理排程更新，兩者互不影響 | Outbox 模式保證事件至少投遞一次；工作區業務操作成功不依賴組織排程更新是否完成，提升整體可靠性 |
| 15 | `PARSING_INTENT` 定位：暫存中繼 vs 長期存活 | `PARSING_INTENT` 使用非對稱旗型節點（`>`），解析後即消失，與 `TRACK_A_TASKS` 無生命週期同步 | 改為圓柱形節點 `[(...)]`（持久存活），代表長期存活的「解析合約 Digital Twin」；作為文件內容與業務執行之間永久的對照表 | 解析出的任務需要回溯到來源文件；財務審計需引用文件出處；Digital Twin 讓文件更新時系統能自動比對並「提議」修改 |
| 16 | `TRACK_A_TASKS ↔ PARSING_INTENT` 缺乏回饋鏈 | 只有 `TRACK_B_ISSUES -.-> PARSING_INTENT` 單向回流（僅異常才回饋），人為修正路徑不存在 | 新增 `TRACK_A_TASKS -->|人為修正回饋| PARSING_INTENT` 實線邊；任務執行時的人為變動（延期、換人、拆分）需同步標記解析意圖版本 | 確保解析合約與執行狀態一致；無此邊時文件與任務的對應關係在首次人工修正後即永久失真 |
| 17 | `PARSING_INTENT` 缺乏多版本差異比對機制 | 文件更新後新解析會直接覆蓋舊意圖，無法追蹤差異，也無法保護已執行中的任務 | Parser 每次解析產出新版本（`解析完成 · 產出新版本`）；新增 `PARSING_INTENT -.->|版本差異比對提議| TRACK_A_TASKS` 虛線邊（提議而非強制）；系統自動比對 V_n vs V_{n+1} 差異，讓使用者確認後才更新 | 建設工程場景中文件常多次修訂；強制覆蓋會丟失已執行進度；提議模式讓業務執行不被文件更新打斷 |
| 19 | `TRACK_B_ISSUES` 蜘蛛網直接回流 | `TRACK_B_ISSUES -.->|處理完成|` 各自連向 TASKS / QA / ACCEPTANCE / FINANCE / PARSING_INTENT（5 條邊），Issue 組件需知道所有外部流程 | 移除 5 條直接回流邊；改為 `TRACK_B_ISSUES -->|IssueResolved 事件| WORKSPACE_EVENT_BUS`，置於 WORKSPACE_BUSINESS 外、WORKSPACE_CONTAINER 內；各 A 軌節點訂閱事件後自行恢復進度 | Issue 組件不再依賴任何具體業務模組；連線從「蜘蛛網」變為「放射狀」；A 軌解鎖邏輯在各自切片內，符合單一職責 |
| 20 | `TRACK_A_TASKS` 對 `PARSING_INTENT` 的寫回邊 | `TRACK_A_TASKS -->|人為修正回饋| PARSING_INTENT` 為實線（暗示任務寫回並修改合約） | 改為 `TRACK_A_TASKS -.->|SourcePointer 引用（唯讀 · IntentID）| PARSING_INTENT` 虛線引用邊；`PARSING_INTENT` 成為唯讀出生證明；人工修正以 `Refinement 覆蓋層` 形式存於 `TRACK_A_TASKS`，不修改 Intent | 永遠可比對原始合約解析結果（Intent）與實際現場狀況（Task）；合約不可更改確保長期審計能力；`Refinement` 模式保持「原始解析」與「人為調整」的清晰對照 |
| 21 | 各層 `AUDIT_LOG` 節點分散在業務容器內 | `ACCOUNT_AUDIT_LOG`、`ORGANIZATION_AUDIT_LOG`、`WORKSPACE_AUDIT_LOG` 分別位於各治理子圖；`WORKSPACE_EVENT_BUS --> WORKSPACE_AUDIT_LOG` 直接邊混入業務流 | 從邏輯圖移除 3 個 AUDIT_LOG 節點及相關邊；保留 PROJECTION_LAYER 中已有的 `ACCOUNT_PROJECTION_AUDIT`（`WORKSPACE_EVENT_BUS --> ACCOUNT_PROJECTION_AUDIT`）作為統一稽核讀取模型；各稽核切片仍作為事件訂閱者存在（程式碼中保留） | 「業務執行」與「歷史追蹤」徹底分離；避免業務容器內出現多個小型日誌節點；所有歷史軌跡統一由 PROJECTION_LAYER 處理，符合讀寫分離（CQRS）原則 |
| 22 | `organization-governance` 成員模型：Team/Partner 獨立分層，成員能力無統一存取點 | `ORGANIZATION_TEAM`（內部）與 `ORGANIZATION_PARTNER`（外部）各自為獨立節點，排程模組無法按職能篩選資源 | 新增 `SKILL_TAG_POOL[(職能標籤庫（Skills/Certs）)]` 節點（cylinder，indigo）於 `ORGANIZATION_GOVERNANCE` 子圖；所有帳號（內部/外部）均擁有職能標籤；`ORGANIZATION_TEAM`／`ORGANIZATION_PARTNER` 成為同一扁平資源池的「組視圖（Group View）」；新增 `PARSING_INTENT -.->|提取職能需求標籤| W_B_SCHEDULE` 與 `W_B_SCHEDULE -.->|根據標籤過濾可用帳號（跨層讀取）| SKILL_TAG_POOL`，排程按職能篩選後產出 `ScheduleProposed` | 組織成員模型扁平化，消除 Team/Partner 職責模糊；排程模組根據職能標籤（技能／證照）精確分配；`PARSING_INTENT` 成為排程的技能需求來源，形成「文件 → 解析意圖 → 排程計算 → 職能篩選 → 建議排程」完整閉環 |
| 23 | 人力排程指派後缺少個人推播通知機制 | `ScheduleAssigned` 事件無後續消費者，被指派的使用者無法即時收到通知 | 新增 `account-user.notification` 切片於 Account Layer；`ORGANIZATION_SCHEDULE -->|ScheduleAssigned 事件| ORGANIZATION_EVENT_BUS -->|ScheduleAssigned| ACCOUNT_USER_NOTIFICATION`；`USER_ACCOUNT_PROFILE` 持有 FCM Token（唯讀）；`ACCOUNT_USER_NOTIFICATION --> FCM_GATEWAY[Firebase Cloud Messaging] -.-> USER_DEVICE`；新增 `fcmGateway`（pink）與 `userDevice`（light blue）classDef | FCM Token 由 `account-user.profile` 統一管理，`account-user.notification` 只讀取不寫入；通知路徑全程非同步事件驅動（透過 ORGANIZATION_EVENT_BUS），不阻塞業務流程；支援未來擴展（任務分配通知、問題單更新通知等同路徑） |
| 24 | 通知架構：直接耦合 vs 三層解耦 | `ORGANIZATION_EVENT_BUS` 直接連向 `ACCOUNT_USER_NOTIFICATION`（A 直接拉線給 B），組織事件總線感知個人帳號的存在，違反「業務端觸發事實、個人端訂閱投影」原則 | 引入 `account-governance.notification-router`（Router Layer）形成三層架構：**層一（觸發）** `ORGANIZATION_SCHEDULE →|ScheduleAssigned 事件| ORGANIZATION_EVENT_BUS`（只宣告事實，不知誰要收）；**層二（路由）** `ORGANIZATION_EVENT_BUS →|含 TargetAccountID| ACCOUNT_NOTIFICATION_ROUTER → ACCOUNT_USER_NOTIFICATION`（依 TargetAccountID 精確分發）；**層三（交付）** `ACCOUNT_USER_NOTIFICATION` 依 `SKILL_TAG_POOL` 的 `internal/external` 標籤過濾敏感內容後調用 FCM | 觸發層只宣告事實，路由層是唯一感知 TargetAccountID 的位置，交付層保障個人隱私；三層各司其職，符合「業務端觸發事實、個人端訂閱投影」的長治久安原則；Router 與 Delivery 分離後，未來新增 Email／簡訊通知只需擴展交付層，Router 無需更動 |

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
    │   ├── account-user.profile/              ← 使用者資料、設定、FCM Token 儲存
    │   ├── account-user.wallet/               ← 錢包（代幣／積分，stub）
    │   ├── account-user.notification/         ← 個人推播通知（FCM 閘道協調）
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
    │   │   ├── organization-governance.member/  ← 組織成員（扁平化資源池）
    │   │   ├── organization-governance.team/    ← 團隊管理（內部組視圖）
    │   │   ├── organization-governance.partner/ ← 合作夥伴（外部組視圖）
    │   │   ├── organization-governance.policy/  ← 政策管理
    │   │   ├── organization-governance.skill-tag/ ← 職能標籤庫（Skills / Certs）
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

### organization-governance — 扁平化資源池與職能標籤庫

> **Team/Partner 是同一資源池的「組視圖」，而非兩個獨立的層級。**

所有帳號（內部成員 `member` / 外部夥伴 `partner`）統一擁有**職能標籤（Skills / Certs）**，儲存於 `organization-governance.skill-tag`（職能標籤庫）：

| 組視圖 | 帳號類型 | 標籤讀取方式 |
|--------|----------|-------------|
| `organization-governance.team`（內部組） | 內部帳號 | 聚合組內所有成員的職能標籤 |
| `organization-governance.partner`（外部組） | 外部帳號 | 聚合組內所有夥伴的職能標籤 |

**排程閉環：** `PARSING_INTENT` 提取文件中的職能需求 → `W_B_SCHEDULE` 向 `SKILL_TAG_POOL` 查詢符合標籤的帳號 → 產出 `ScheduleProposed` 事件。

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
| `account-user.profile` | 使用者個人資料、偏好設定、安全設定、FCM Token 儲存 | `USER_ACCOUNT_PROFILE` |
| `account-user.wallet` | 個人錢包（代幣／積分，stub） | `USER_ACCOUNT_WALLET` |
| `account-user.notification` | 個人推播通知：訂閱 `ScheduleAssigned` 事件，讀取 FCM Token，呼叫 FCM 閘道 | `ACCOUNT_USER_NOTIFICATION` |
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
| `organization-governance/organization-governance.member` | 組織成員管理（扁平化資源池） | `ORGANIZATION_MEMBER` |
| `organization-governance/organization-governance.team` | 團隊結構管理（內部組視圖） | `ORGANIZATION_TEAM` |
| `organization-governance/organization-governance.partner` | 外部合作夥伴（外部組視圖） | `ORGANIZATION_PARTNER` |
| `organization-governance/organization-governance.policy` | 組織政策管理 | `ORGANIZATION_POLICY` |
| `organization-governance/organization-governance.skill-tag` | 職能標籤庫（Skills / Certs）管理 | `SKILL_TAG_POOL` |
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

> `workspace-governance.audit-log`、`account-governance.audit-log`、`organization-governance.audit-log` 切片仍作為事件訂閱者存在（程式碼中保留），但不再作為邏輯圖的主動路由節點。所有稽核歷史統一由 `PROJECTION_LAYER` 的 `projection.account-audit` 讀取模型提供。

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
| `workspace-business/workspace-business.schedule` | 任務排程計算 → 發布 ScheduleProposed 事件至 workspace-event-bus | `W_B_SCHEDULE` |

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
         ↑                                              |
  _actions.ts (Server Action)                          ↓
  SERVER_ACTION → command-handler → ... → transaction-runner
                                              |
                              -.-> 執行業務領域邏輯 -.-> workspace-business

TRACK_A_TASKS  -.->SourcePointer 引用（唯讀）.->  PARSING_INTENT（Digital Twin）
PARSING_INTENT  -.->版本差異比對提議.->  TRACK_A_TASKS（非強制）

TRACK_B_ISSUES  -->|IssueResolved 事件|  WORKSPACE_EVENT_BUS（A 軌訂閱後自行恢復）

workspace-outbox  →|ScheduleProposed（跨層事件）|  organization-schedule
workspace-event-bus  →  projection.account-audit（全域稽核流，統一讀取模型）
workspace-event-bus  →  projection-layer（工作區內部投影）

organization-core.event-bus  →  workspace-application.scope-guard（事件橋接）

organization-schedule  →|ScheduleAssigned 事件|  organization-core.event-bus
  →  account-user.notification  →  FCM_GATEWAY  -.->  USER_DEVICE（推播通知）
account-user.profile  -.->|提供 FCM Token（唯讀）|  account-user.notification
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
| Firebase Cloud Messaging (FCM_GATEWAY) | `shared/infra/` FCM 適配器（外部服務，不建切片） |
| USER_DEVICE | 裝置端（不在 features，為推播終點） |

> 詳細領域邏輯流程請參閱 [`logic-overview.v3.md`](./logic-overview.v3.md)。  
> 請求執行流程請參閱 [`request-execution-overview.v3.md`](./request-execution-overview.v3.md)。  
> 指令與事件系統請參閱 [`command-event-overview.v3.md`](./command-event-overview.v3.md)。  
> 持久化模型請參閱 [`persistence-model-overview.v3.md`](./persistence-model-overview.v3.md)。  
> 基礎設施整合請參閱 [`infrastructure-overview.v3.md`](./infrastructure-overview.v3.md)。
