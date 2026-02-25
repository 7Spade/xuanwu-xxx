# Architecture Overview

> 本文件是 `logic-overview.v3.md` 的配套架構參考。  
> `logic-overview.v3.md` 描述**領域邏輯流程**；本文件描述**功能切片的資料夾結構設計**與其對應的架構原則。

---

## 一、logic-overview.v3.md 評估與改良說明

| # | 項目 | 原始狀態 | 改良後 | 理由 |
|---|------|----------|--------|------|
| 1 | `identity-account.auth` 切片缺失 | 只有 Firebase Authentication 外部服務節點 | 新增 `identity-account.auth` 節點，位於 Firebase 與 Identity Layer 之間 | 登入／註冊／重設密碼是一個完整業務切片 |
| 2 | `user-account.settings` 獨立節點 | 有 `user-account.settings` 獨立節點 | 合併至 `account-user.profile` | 新設計將設定納入個人資料切片，避免碎片化 |
| 3 | `organization-account.aggregate` 缺失 | 只有 `organization-account` 與 `.settings` | 新增 `organization-account.aggregate` 節點 | 作為組織帳號的聚合根並連接 Organization Layer |
| 4 | `workspace-settings` 獨立於容器頂層 | `workspace-settings` 懸掛在容器外層 | 移入 `workspace-core` 成為 `workspace-core.settings` | 設定是聚合根的核心配置，屬於 Core 職責 |
| 5 | `workspace-business.audit-log` 放在業務層 | `audit-log` 在 `workspace-business` 子圖中 | 移入 `workspace-governance` 成為 `workspace-governance.audit` | 工作區操作稽核是治理／合規職責，不是業務功能 |
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
| 24 | 通知架構：直接耦合 vs 三層解耦 | `ORGANIZATION_EVENT_BUS` 直接連向 `ACCOUNT_USER_NOTIFICATION`（A 直接拉線給 B），組織事件總線感知個人帳號的存在，違反「業務端觸發事實、個人端訂閱投影」原則 | 引入 `account-governance.notification-router`（Router Layer）形成三層架構：**層一（觸發）** `ORGANIZATION_SCHEDULE →|ScheduleAssigned 事件| ORGANIZATION_EVENT_BUS`（只宣告事實，不知誰要收）；**層二（路由）** `ORGANIZATION_EVENT_BUS →|含 TargetAccountID| ACCOUNT_NOTIFICATION_ROUTER → ACCOUNT_USER_NOTIFICATION`（依 TargetAccountID 精確分發）；**層三（交付）** `ACCOUNT_USER_NOTIFICATION` 依 `SKILL_TAG_POOL` 的 `internal/external` 標籤過濾敏感內容後調用 FCM（**僅 FCM，不支援 Email／SMS**） | 觸發層只宣告事實，路由層是唯一感知 TargetAccountID 的位置，交付層保障個人隱私；三層各司其職，符合「業務端觸發事實、個人端訂閱投影」的長治久安原則；**本系統明確範圍：推播通知管道為 FCM-only，不實作 Email／SMS** |
| 25 | 帳號切片資料共置（Account Data Co-location） | `account-user.profile`、`account-user.notification` 在圖面上各自為獨立節點，易被誤讀為分散在不同資料庫表中 | 明確原則：**領域邏輯獨立（Domain Separation）、資料庫共置（DB Co-location）** — 三個帳號切片（`profile`、`notification`、`skill-tag`）共享同一個 Firestore 帳號文件集合，在程式碼 Domain Layer 中視為不同服務單元；`ACCOUNT_PROJECTION_VIEW` 已將散落各處的事件統一投影為「個人中心」視圖；新增 `ACCOUNT_USER_NOTIFICATION -.->|通知投影至個人中心| ACCOUNT_PROJECTION_VIEW` 邊以明確表達通知在個人中心呈現的路徑 | 前端使用者看到的是統一的「我的帳號 > 我的通知」；帳號數據中心設計讓 Firestore 查詢集中在單一文件集合，避免跨集合查詢開銷；Domain Layer 的邏輯獨立性確保各切片職責清晰，同時 DB 層不引入不必要的分散 |
| 26 | 是否需要獨立的 `User Layer（用戶層）` 與 `Account Layer（帳號層）` 並列？ | 個人用戶資料（`user-account`、`account-user.profile`、`account-user.wallet`、`account-user.notification`）與組織帳號資料（`organization-account`、`account-governance`）平鋪在同一 `ACCOUNT_LAYER` 子圖，視覺上難以區分兩種關係截然不同的帳號類型 | **不新增頂層 `User Layer`**；改為在 `ACCOUNT_LAYER` 內部新增 `USER_PERSONAL_CENTER（個人用戶中心）` 子圖，包裝 `user-account`、`account-user.profile`、`account-user.wallet`、`account-user.notification`；組織帳號節點與 `ACCOUNT_GOVERNANCE` 子圖維持原位；新增 `userPersonalCenter` classDef（淺綠 `fill:#f0fdf4`） | 個人用戶與組織帳號同屬「帳號」邊界上下文，共享 `ACCOUNT_IDENTITY_LINK → USER_ACCOUNT + ORGANIZATION_ACCOUNT` 的身份解析入口；分裂為頂層並列層會暗示不同有界上下文（Bounded Context），而實際上它們是同一上下文內的不同子類型；`USER_PERSONAL_CENTER` 子圖讓圖面立刻清晰分組，同時保持 DDD 邊界正確性 |
| 27 | 主體中心（Subject Center）與事件漏斗（Event Funnel）：層級整合與投影簡化 | ① `ACCOUNT_LAYER` 與 `ORGANIZATION_LAYER` 為頂層並列兄弟節點，看不出「同屬主體（Who）」的概念關係；② `WORKSPACE_EVENT_BUS` 直接 6 條邊射向投影層各視圖，連線密集且難以追蹤事件流向 | ① 新增 `SUBJECT_CENTER[主體中心（Subject Center）]` 外層子圖，包裝 `ACCOUNT_LAYER` 與 `ORGANIZATION_LAYER`；兩者共用 `ACCOUNT_IDENTITY_LINK` 身份根，共屬「主體（Who）」邊界；`WORKSPACE_CONTAINER` 代表「做什麼（What）」，維持在主體中心之外；② 在 `PROJECTION_LAYER` 頂部新增 `EVENT_FUNNEL_INPUT[["事件漏斗（Event Funnel · 統一入口）"]]` 節點；將 6 條外部扇出邊改為 2 條外部輸入邊（`WORKSPACE_EVENT_BUS → EVENT_FUNNEL_INPUT`、`ORGANIZATION_EVENT_BUS → EVENT_FUNNEL_INPUT`）+ PROJECTION_LAYER 內部 5 條路由邊；新增 `subjectCenter`（琥珀 `fill:#fefce8`）與 `eventFunnel`（紫羅蘭 `fill:#f5f3ff`）classDef | Subject Center 讓讀者立刻理解架構分層：「誰（Who）→ 做什麼（What）→ 讀什麼（Read）」；Account + Organization 共享身份根，合併入主體中心是正確的 DDD 邊界決策，不是 Bounded Context 分割；Event Funnel 將外部可見連線從 6 降至 2，減少「連線噪音」，並在 PROJECTION_LAYER 內部保留完整路由細節，符合「漏斗模式（Funnel Pattern）：統一入口、內部分發」 |

---

## PR #69 分析（僅分析，不改圖）

### 1) `logic-overview.v3.md` 是否需要新增「人力資源池」？

結論：**不建議在 Workspace Container 內再新增一個「人力資源池 Aggregate」**。

理由（對應現有邏輯圖不變量）：

1. `organization` 邊界已經有扁平化資源池語義：`ORGANIZATION_MEMBER / TEAM / PARTNER + SKILL_TAG_POOL`，且 `ORG_ELIGIBLE_MEMBER_VIEW` 已作為排程查詢入口。
2. `W_B_SCHEDULE` 在圖中已被約束為只讀 projection（`ACCOUNT_PROJECTION_SCHEDULE` + `ORG_ELIGIBLE_MEMBER_VIEW`），符合不變量 #14。
3. 若在 Workspace Container 再放一個可寫的人力池，會形成跨 BC 雙寫與真相來源分裂，違反不變量 #1/#2（單一 BC 寫入、跨 BC 走 Event/Projection）。

可接受的最小補強（若要強化語義）：

- 保持「人力資源池」為**讀模型/檢視語彙**，不要升級成新的可寫 Aggregate。
- 在圖例或註解明確標註：`ORG_ELIGIBLE_MEMBER_VIEW` 即「排程可用人力池（唯讀）」。

### 2) Workspace Container 為了自恰，建議補齊的功能切片（優先序）

> 本段為「切片完備性建議」，不是要求本 PR 立即實作。

| 優先序 | 建議切片 | 目的 | 目前狀態 |
|---|---|---|---|
| P0 | `workspace-business.workflow`（或 `workspace-business.workflow.aggregate`） | 落地 A3 決策：A 軌（tasks/qa/acceptance/finance）共用單一狀態機不變量 | 目前僅有邏輯圖節點，尚未成切片 |
| P1 | `workspace-business.parsing-intent`（可命名為 contract/intents） | 讓 `PARSING_INTENT` 的版本、差異提議、SourcePointer 規則有獨立邊界，不與 parser I/O 混寫 | 目前語義存在於圖與流程，未成獨立切片 |
| P2 | `workspace-governance.audit` 遷移收斂（非新增切片） | 將暫置 UI 稽核逐步收斂到 `workspace-core.event-store + projection.account-audit`，消除治理層偏差節點 | 目前為實務暫置，文件已標記偏差 |

最小可執行原則（Occam）：

- **先補 `workflow.aggregate` 一個切片即可**，其餘維持現狀。
- 不新增可寫人力池 Aggregate；持續使用 `ORG_ELIGIBLE_MEMBER_VIEW` 作為排程人力來源。

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

實際程式碼採**扁平化**結構，所有切片直接位於 `src/features/` 下（無巢狀子目錄）。命名空間以切片名稱前綴隱式表達群組關係。

```
src/features/
├── GEMINI.md                                ← AI 開發指南（整層）
│
│── ── Identity Layer ──────────────────────────────────────────────────
├── identity-account.auth/                   ← 登入 · 註冊 · 重設密碼（Firebase Auth 入口）
│
│── ── Account Layer — 帳號共用 ────────────────────────────────────────
├── account-governance.role/                 ← 帳號角色管理 → CUSTOM_CLAIMS 簽發
├── account-governance.policy/               ← 帳號政策管理
├── account-governance.notification-router/  ← 通知路由器（FCM 第 2 層 · 依 TargetAccountID 分發）
│
│── ── Account Layer — User sub-type ──────────────────────────────────
├── account-user.profile/                    ← 使用者個人資料 · 偏好設定 · FCM Token
├── account-user.wallet/                     ← 個人錢包（代幣／積分，stub）
├── account-user.notification/               ← 個人推播通知（FCM 第 3 層）
│
│── ── Account Layer — Organization sub-type ──────────────────────────
├── account-organization.core/               ← 組織聚合實體（aggregate）· binding
├── account-organization.event-bus/          ← 組織事件總線
├── account-organization.member/             ← 組織成員邀請／移除
├── account-organization.team/               ← 團隊管理（內部組視圖，由 workspace-governance.teams 遷移）
├── account-organization.partner/            ← 合作夥伴管理（外部組視圖，由 workspace-governance.partners 遷移）
├── account-organization.policy/             ← 組織政策管理
├── account-organization.skill-tag/          ← 職能標籤庫（扁平化資源池）
├── account-organization.schedule/           ← 人力排程管理 · ScheduleAssigned 事件（FCM 第 1 層）
│
│── ── Workspace Application Layer ─────────────────────────────────────
├── workspace-application/                   ← 指令處理器 · Scope Guard · 政策引擎
│                                                · org-policy 防腐層快取 · 交易執行器 · Outbox
│
│── ── Workspace Core ──────────────────────────────────────────────────
├── workspace-core/                          ← CRUD · shell · provider · list · settings · aggregate
├── workspace-core.event-bus/                ← 工作區事件總線
├── workspace-core.event-store/              ← 事件儲存（僅供重播／稽核，非 CRUD）
│
│── ── Workspace Governance ────────────────────────────────────────────
├── workspace-governance.members/            ← 工作區成員存取管理
├── workspace-governance.role/               ← 角色管理（從 members 拆分）
├── workspace-governance.teams/              ← Stub（視圖已遷移至 account-organization.team）
├── workspace-governance.partners/           ← Stub（視圖已遷移至 account-organization.partner）
├── workspace-governance.schedule/           ← Stub（實作已遷移至 workspace-business.schedule）
├── workspace-governance.audit/              ← 稽核足跡 · 事件時序
│
│── ── Workspace Business · 輔助與靜態單元 ─────────────────────────────
├── workspace-business.daily/                ← 手寫施工日誌 · 留言 · 書籤
├── workspace-business.schedule/             ← 排程管理 · 提案 · 決策（由 workspace-governance.schedule 遷移）
├── workspace-business.files/                ← 檔案上傳 · 管理
├── workspace-business.document-parser/      ← AI 文件解析 · ParsingIntent（Digital Twin）
│
│── ── Workspace Business · A 軌（主流程） ──────────────────────────────
├── workspace-business.tasks/                ← 任務樹 · CRUD（A 軌起點）
├── workspace-business.quality-assurance/    ← 品質驗證（A 軌）
├── workspace-business.acceptance/           ← 驗收（A 軌）
├── workspace-business.finance/              ← 財務處理（A 軌終點）
│
│── ── Workspace Business · B 軌（異常處理中心） ─────────────────────────
├── workspace-business.issues/               ← 問題追蹤單 · IssueResolved 事件（B 軌）
│
│── ── Projection Layer ────────────────────────────────────────────────
├── projection.workspace-view/               ← 工作區讀模型（Workspace 投影視圖）
├── projection.workspace-scope-guard/        ← Scope Guard 專用讀模型
├── projection.account-view/                 ← 帳號讀模型 · 權限快照（authority-snapshot 合約）
├── projection.account-audit/                ← 帳號稽核投影
├── projection.account-schedule/             ← 帳號排程投影（過濾可用帳號）
├── projection.organization-view/            ← 組織讀模型
└── projection.registry/                     ← 事件串流偏移量 · 讀模型版本對照表
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
| `identity-account.auth` | Firebase 登入／註冊／重設密碼的 UI 與 Server Action | `ACCOUNT_AUTH` |
| （Identity Layer 內部狀態，非獨立切片） | 持有 Firebase User，提供已驗證狀態 | `AUTHENTICATED_IDENTITY` |
| （Identity Layer 內部狀態，非獨立切片） | 維護 `firebaseUserId ↔ accountId` 映射 | `ACCOUNT_IDENTITY_LINK` |
| （Identity Layer 內部狀態，非獨立切片） | 組織／工作區的作用中帳號 Context | `ACTIVE_ACCOUNT_CONTEXT` |
| （Identity Layer 內部狀態，非獨立切片） | 解析 Firebase Custom Claims 作為授權資料 | `CUSTOM_CLAIMS` |

### Account Layer（帳號層）

| Feature Slice | 領域職責 | logic-overview 節點 |
|---------------|----------|---------------------|
| `account-user.profile` | 使用者個人資料、偏好設定、安全設定、FCM Token 儲存（**帳號數據中心共置**） | `USER_ACCOUNT_PROFILE` |
| `account-user.wallet` | 個人錢包（代幣／積分，stub） | `USER_ACCOUNT_WALLET` |
| `account-user.notification` | 個人推播通知：訂閱 `ScheduleAssigned` 事件，讀取 FCM Token，呼叫 FCM 閘道；通知結果投影至 `ACCOUNT_PROJECTION_VIEW`（**帳號數據中心共置，FCM-only，不支援 Email/SMS**） | `ACCOUNT_USER_NOTIFICATION` |
| `account-organization.core` | 組織設定 CRUD · 組織帳號聚合根，連接 Organization Layer | `ORGANIZATION_ACCOUNT_SETTINGS` / `ORGANIZATION_ACCOUNT_BINDING` |
| `account-governance.role` | 帳號層角色定義 | `ACCOUNT_ROLE` |
| `account-governance.policy` | 帳號層政策規則 | `ACCOUNT_POLICY` |
| `account-governance.notification-router` | 通知路由器：依 TargetAccountID 分發 ScheduleAssigned 至目標帳號（三層通知架構層二） | `ACCOUNT_NOTIFICATION_ROUTER` |

### Organization Layer（組織層）

| Feature Slice | 領域職責 | logic-overview 節點 |
|---------------|----------|---------------------|
| `account-organization.core` | 組織聚合實體，擁有工作區 | `ORGANIZATION_ENTITY` |
| `account-organization.event-bus` | 組織領域事件總線 | `ORGANIZATION_EVENT_BUS` |
| `account-organization.member` | 組織成員管理（扁平化資源池） | `ORGANIZATION_MEMBER` |
| `account-organization.team` | 團隊結構管理（內部組視圖） | `ORGANIZATION_TEAM` |
| `account-organization.partner` | 外部合作夥伴（外部組視圖） | `ORGANIZATION_PARTNER` |
| `account-organization.policy` | 組織政策管理 | `ORGANIZATION_POLICY` |
| `account-organization.skill-tag` | 職能標籤庫（Skills / Certs）管理 | `SKILL_TAG_POOL` |
| `account-organization.schedule` | 人力排程管理 | `ORGANIZATION_SCHEDULE` |

### Workspace Container（工作區容器）

#### workspace-core（核心層）

| Feature Slice | 領域職責 | logic-overview 節點 |
|---------------|----------|---------------------|
| `workspace-core` | Workspace CRUD · shell · provider · list · settings（聚合根核心配置） | `WORKSPACE_SETTINGS` / `WORKSPACE_AGGREGATE` |
| `workspace-core.event-bus` | 工作區事件總線 | `WORKSPACE_EVENT_BUS` |
| `workspace-core.event-store` | 事件溯源儲存（可選） | `WORKSPACE_EVENT_STORE` |

#### workspace-application（應用層）

| Feature Slice | 領域職責 | logic-overview 節點 |
|---------------|----------|---------------------|
| `workspace-application` | 指令處理器 · 作用域守衛 · 政策引擎 · org-policy 防腐層快取 · 交易執行器 · Outbox | `WORKSPACE_COMMAND_HANDLER` / `WORKSPACE_SCOPE_GUARD` / `WORKSPACE_POLICY_ENGINE` / `WORKSPACE_TRANSACTION_RUNNER` / `WORKSPACE_OUTBOX` |

#### workspace-governance（工作區治理）

| Feature Slice | 領域職責 | logic-overview 節點 |
|---------------|----------|---------------------|
| `workspace-governance.members` | 工作區成員存取控制 | `WORKSPACE_MEMBER` |
| `workspace-governance.role` | 角色管理（從 members 拆分） | `WORKSPACE_ROLE` |
| `workspace-governance.teams` | **Stub** — 視圖已遷移至 `account-organization.team` | — |
| `workspace-governance.partners` | **Stub** — 視圖已遷移至 `account-organization.partner` | — |
| `workspace-governance.schedule` | **Stub** — 實作已遷移至 `workspace-business.schedule` | — |
| `workspace-governance.audit` | 工作區操作稽核 | — |

> `workspace-governance.audit` 切片仍作為事件訂閱者存在（程式碼中保留），但不再作為邏輯圖的主動路由節點。所有稽核歷史統一由 `PROJECTION_LAYER` 的 `projection.account-audit` 讀取模型提供。

#### workspace-business（業務層，按執行流向排序）

| Feature Slice | 領域職責 | logic-overview 節點 |
|---------------|----------|---------------------|
| `workspace-business.tasks` | 任務管理 | `TRACK_A_TASKS` |
| `workspace-business.quality-assurance` | 品質保證 | `TRACK_A_QA` |
| `workspace-business.acceptance` | 業務受理／驗收 | `TRACK_A_ACCEPTANCE` |
| `workspace-business.finance` | 財務處理 | `TRACK_A_FINANCE` |
| `workspace-business.daily` | 日常作業記錄 | `W_B_DAILY` |
| `workspace-business.document-parser` | AI 文件解析 | `W_B_PARSER` |
| `workspace-business.files` | 檔案管理 | `W_B_FILES` |
| `workspace-business.issues` | 問題追蹤（AB 雙軌問題單） | `TRACK_B_ISSUES` |
| `workspace-business.schedule` | 排程管理 · 提案 · 決策（由 `workspace-governance.schedule` 遷移）→ 發布 ScheduleProposed 事件 | `W_B_SCHEDULE` |

---

## 五、標準切片內部結構

每個 `features/{slice}/` 資料夾遵循：

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
app/  →  features/{slice}/index.ts  →  shared/*
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
  →  account-governance.notification-router  →  account-user.notification  →  FCM_GATEWAY  -.->  USER_DEVICE（推播通知）
account-user.profile  -.->|提供 FCM Token（唯讀）|  account-user.notification
account-user.notification  -.->|通知投影至個人中心|  projection.account-view
```

### 禁止規則

```ts
// ✅ 允許：透過公開 API 跨切片
import { useWorkspaceCommands } from "@/features/workspace-application";

// ❌ 禁止：直接存取其他切片的私有路徑
import { someHook } from "@/features/workspace-core/_hooks/some-hook";

// ❌ 禁止：跨領域直接耦合（應透過 event-bus）
import { orgEntity } from "@/features/account-organization.core/_aggregate";
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
| Identity Layer | `features/identity-account.auth/` 等 `identity-*` 切片 |
| Account Layer (shared + governance) | `features/account-governance.*` 切片 |
| Account Layer (User sub-type) | `features/account-user.*` 切片 |
| Account Layer (Organization sub-type) | `features/account-organization.*` 切片 |
| Workspace Container — Application | `features/workspace-application/` 切片 |
| Workspace Container — Core | `features/workspace-core/`、`workspace-core.*` 切片 |
| Workspace Container — Governance | `features/workspace-governance.*` 切片 |
| Workspace Container — Business | `features/workspace-business.*` 切片 |
| Projection Layer | `features/projection.*` 切片（`projection.workspace-view`、`projection.account-*` 等） |
| Observability Layer | `shared/infra/observability/`（橫切，不建獨立切片） |
| Firebase Cloud Messaging (FCM_GATEWAY) | `shared/infra/messaging/` FCM 適配器（外部服務，不建切片） |
| USER_DEVICE | 裝置端（不在 features，為推播終點） |

> 詳細領域邏輯流程請參閱 [`logic-overview.v3.md`](./logic-overview.v3.md)。  
> 請求執行流程請參閱 [`request-execution-overview.v3.md`](./request-execution-overview.v3.md)。  
> 指令與事件系統請參閱 [`command-event-overview.v3.md`](./command-event-overview.v3.md)。  
> 持久化模型請參閱 [`persistence-model-overview.v3.md`](./persistence-model-overview.v3.md)。  
> 基礎設施整合請參閱 [`infrastructure-overview.v3.md`](./infrastructure-overview.v3.md)。
