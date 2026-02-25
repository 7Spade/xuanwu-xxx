---
title: Logic Overview v5 — Vertical Feature Slice + Unified Gateway + Tag Authority
---

%% ==========================================================================
%% LOGIC OVERVIEW v5
%% 設計原則：
%%   1. 垂直功能切片（Vertical Feature Slice）：每片封裝完整 Cmd→Domain→Event 閉環
%%   2. CENTRALIZED_TAG_AGGREGATE 為全域語義字典唯一權威（Tag Authority Center）
%%   3. 三閘道統一出入口（CQRS）：
%%        Command Bus Gateway  → 所有寫入指令統一入口
%%        Integration Event Router → 所有事件統一出口 → Event Funnel
%%        Query Gateway        → 所有讀取統一入口 → Read Model Registry
%%   4. 切片間通訊：僅透過 Shared Kernel 契約 + Integration Event Router
%%
%% 閱讀順序：
%%   VS0) Shared Kernel + Tag Authority Center（跨片契約 + 標籤語義中心）
%%   VS1) Identity Slice（身份驗證）
%%   VS2) Account Slice（帳號主體）
%%   VS3) Skill XP Slice（能力成長）
%%   VS4) Organization Slice（組織治理）
%%   VS5) Workspace Slice（工作區業務）
%%   VS6) Scheduling Slice（排班協作）
%%   VS7) Notification Slice（通知交付）
%%   GW)  三閘道統一出入口（Command / Event / Query）
%%   VS8) Projection Bus（事件投影總線）
%%   VS9) Observability（可觀測性）
%% ==========================================================================

flowchart TD

%% ==========================================================================
%% VS0) SHARED KERNEL + TAG AUTHORITY CENTER
%% Tag Authority 設計原則：
%%   - CENTRALIZED_TAG_AGGREGATE 是 tagSlug 語義字典的唯一真相來源
%%   - 所有需要「帶標籤語義」的模組（技能庫、成員、夥伴、人力池、排班、工作區需求）
%%     只能「唯讀引用 tagSlug」，不得自行維護標籤主數據
%%   - 標籤異動透過 TagLifecycleEvent（TagCreated/Updated/Deprecated/Deleted）
%%     流入 Integration Event Router → 各消費切片被動更新
%%   - 新切片若需標籤語義，只需訂閱 TagLifecycleEvent，無需修改任何現有邊界
%% ==========================================================================

subgraph SK["🔷 VS0 · Shared Kernel + Tag Authority Center"]
    direction TB

    subgraph SK_CONTRACTS["📄 跨切片顯式契約 #8"]
        direction LR
        SK_ENV["event-envelope\n統一事件信封格式"]
        SK_AUTH_SNAP["authority-snapshot\n權限快照契約"]
        SK_SKILL_TIER["skill-tier\ngetTier(xp)→Tier\n純函式・不存 DB #12"]
        SK_SKILL_REQ["skill-requirement\n跨片人力需求契約"]
    end

    subgraph SK_TAG_AUTH["🏷 Tag Authority Center（標籤語義唯一權威）#A6 #17"]
        direction TB
        CTA["centralized-tag.aggregate\n【語義字典主數據】\ntagSlug / label / category\ndeprecatedAt / deleteRule\n唯一性 & 刪除規則管理"]
        TAG_EVENTS["TagLifecycleEvent\nTagCreated · TagUpdated\nTagDeprecated · TagDeleted\n→ Integration Event Router"]
        TAG_READONLY["🔒 消費方唯讀引用規則\n所有 tagSlug 引用必須來自此處\n不得在任何切片自行維護標籤主數據"]

        CTA -->|"標籤異動廣播"| TAG_EVENTS
        CTA -.->|"唯讀引用契約"| TAG_READONLY
    end
end

%% ==========================================================================
%% VS1) IDENTITY SLICE — 身份驗證切片
%% 職責：Firebase 驗證 → 已驗證身份 → 帳號綁定 → Custom Claims 簽發
%% 邊界：只產出身份主體與權限快照，不寫入任何 Domain Aggregate
%% ==========================================================================

subgraph VS1["🟦 VS1 · Identity Slice（身份驗證）"]
    direction LR

    subgraph VS1_IN["▶ External Trigger"]
        FIREBASE_AUTH["Firebase Authentication\n登入／註冊／重設密碼"]
    end

    subgraph VS1_DOMAIN["⚙ Identity Domain"]
        AUTH_IDENTITY["authenticated-identity\n已驗證身份主體"]
        IDENTITY_LINK["account-identity-link\nfirebaseUserId ↔ accountId"]
        ACTIVE_CTX["active-account-context\n組織／工作區作用中帳號上下文"]
    end

    subgraph VS1_OUT["📤 Output"]
        CUSTOM_CLAIMS["custom-claims\n權限快照聲明\n來源：account-governance #5\n不是真實權限來源"]
    end

    FIREBASE_AUTH --> AUTH_IDENTITY
    AUTH_IDENTITY --> IDENTITY_LINK
    IDENTITY_LINK --> ACTIVE_CTX
    AUTH_IDENTITY -->|"登入後觸發簽發／刷新"| CUSTOM_CLAIMS
end

CUSTOM_CLAIMS -.->|"快照契約遵循"| SK_AUTH_SNAP

%% ==========================================================================
%% VS2) ACCOUNT SLICE — 帳號主體切片
%% 職責：個人帳號 + 組織帳號 + 帳號治理 + 錢包強一致 + 個人資料
%% 原子邊界：#A1 wallet=強一致 aggregate；profile/notification=弱一致
%% ==========================================================================

subgraph VS2["🟩 VS2 · Account Slice（帳號主體）"]
    direction TB

    subgraph VS2_USER["👤 個人帳號域"]
        USER_AGG["user-account\n個人帳號 aggregate"]
        WALLET_AGG["account-user.wallet.aggregate\n強一致帳本 #A1\n餘額不變量"]
        PROFILE["account-user.profile\n使用者資料・FCM Token\n（弱一致）"]
    end

    subgraph VS2_ORG_ACC["🏢 組織帳號域"]
        ORG_ACC["organization-account\n組織帳號 aggregate"]
        ORG_ACC_SETTINGS["organization-account.settings"]
        ORG_ACC_BINDING["organization-account.binding\n帳號↔組織主體綁定\nACL 對接 #A2"]
    end

    subgraph VS2_GOV["🛡 帳號治理域"]
        ACC_ROLE["account-governance.role\n帳號角色"]
        ACC_POLICY["account-governance.policy\n帳號政策"]
    end

    subgraph VS2_EVENT["📢 Account Events"]
        ACC_EVENT_BUS["account-event-bus\nAccountCreated\nRoleChanged / PolicyChanged\n→ Integration Event Router"]
    end

    USER_AGG --> WALLET_AGG
    USER_AGG -.->|弱一致| PROFILE
    ORG_ACC --> ORG_ACC_SETTINGS & ORG_ACC_BINDING
    ORG_ACC --> VS2_GOV
    ACC_ROLE & ACC_POLICY -->|"角色/政策驅動"| CUSTOM_CLAIMS
    ACC_ROLE & ACC_POLICY --> ACC_EVENT_BUS
end

IDENTITY_LINK --> USER_AGG & ORG_ACC
ORG_ACC_BINDING -.->|"ACL / projection 對接（非共享提交）#A2"| ORG_AGG
ACC_EVENT_BUS -.->|"事件契約遵循"| SK_ENV
ACC_EVENT_BUS --> IER

%% ==========================================================================
%% VS3) SKILL XP SLICE — 能力成長切片
%% 職責：XP 增減指令 → Aggregate → Ledger 稽核 → SkillXp 事件
%% 不變量：#11 XP 主權屬 Account BC；#12 Tier=純函式；#13 異動必寫 Ledger
%% Tag 關係：skillId 對應 tagSlug，來源為 CENTRALIZED_TAG_AGGREGATE 唯讀引用
%% ==========================================================================

subgraph VS3["🟩 VS3 · Skill XP Slice（能力成長）"]
    direction TB

    subgraph VS3_DOMAIN["⚙ Skill Domain"]
        SKILL_AGG["account-skill.aggregate\naccountId / skillId（→tagSlug）\nxp / version"]
        XP_LEDGER[("account-skill-xp-ledger\nentryId / delta / reason\nsourceId / timestamp\n稽核帳本 #13")]
    end

    subgraph VS3_EVENT["📢 Skill Events"]
        SKILL_EVENTS["SkillXpAdded\nSkillXpDeducted\n（含 tagSlug 語義）\n→ Integration Event Router"]
    end

    SKILL_AGG -->|"#13 任何 XP 異動必寫"| XP_LEDGER
    SKILL_AGG --> SKILL_EVENTS
end

SKILL_AGG -.->|"skillId=tagSlug 唯讀引用"| TAG_READONLY
SKILL_EVENTS -.->|"事件契約遵循"| SK_ENV
SKILL_EVENTS -.->|"tier 推導契約"| SK_SKILL_TIER
SKILL_EVENTS --> IER

%% ==========================================================================
%% VS4) ORGANIZATION SLICE — 組織治理切片
%% 職責：組織核心 + 成員/夥伴/團隊 + 技能認可 + 治理政策
%% Tag 關係：Member/Partner 的技能標籤 tagSlug 來自 CENTRALIZED_TAG_AGGREGATE
%%           職能標籤庫(SKILL_TAG_POOL) = Tag Authority 的組織作用域視圖（唯讀快照）
%%           Talent Repository = Member + Partner + Team 的可排班人力投影
%% 不變量：#11 Organization 不修改 XP，只設定 minXpRequired 門檻
%% ==========================================================================

subgraph VS4["🟧 VS4 · Organization Slice（組織治理）"]
    direction TB

    subgraph VS4_CORE["🏗 組織核心域"]
        ORG_AGG["organization-core.aggregate\n組織聚合實體"]
    end

    subgraph VS4_GOV["🛡 組織治理域"]
        ORG_MEMBER["account-organization.member\n內部成員\n(技能 tagSlug 唯讀引用)"]
        ORG_PARTNER["account-organization.partner\n外部夥伴\n(技能 tagSlug 唯讀引用)"]
        ORG_TEAM["account-organization.team\n團隊（組視圖）\n(由 Member+Partner 聚合)"]
        ORG_POLICY["account-organization.policy\n政策管理"]
        ORG_SKILL_RECOG["organization-skill-recognition.aggregate\norgId / accountId / skillId\nminXpRequired / status\n#11 只設門檻不改 XP"]
    end

    subgraph VS4_TAG_VIEW["🏷 Tag 組織作用域視圖（唯讀）"]
        SKILL_TAG_POOL[("職能標籤庫\naccount-organization.skill-tag\n= Tag Authority 的組織作用域快照\n消費 TagLifecycleEvent 被動更新")]
        TALENT_REPO[["人力資源池\nTalent Repository #16\nMember(內部)+Partner(外部)+Team\n→ ORG_ELIGIBLE_MEMBER_VIEW 來源"]]
    end

    subgraph VS4_EVENT["📢 Organization Events"]
        ORG_EVENT_BUS["organization-core.event-bus\nMemberJoined / MemberLeft\nSkillRecognitionGranted/Revoked\nPolicyChanged → AuthoritySnapshot\n→ Integration Event Router"]
    end

    ORG_AGG --> ORG_EVENT_BUS
    ORG_POLICY -->|"PolicyChanged"| ORG_EVENT_BUS
    ORG_MEMBER & ORG_PARTNER & ORG_TEAM --> TALENT_REPO
    ORG_SKILL_RECOG --> ORG_EVENT_BUS
    TALENT_REPO -.->|"人力來源"| SKILL_TAG_POOL
end

ORG_AGG -.->|"tagSlug 唯讀引用"| TAG_READONLY
ORG_MEMBER -.->|"tagSlug 唯讀引用"| TAG_READONLY
ORG_PARTNER -.->|"tagSlug 唯讀引用"| TAG_READONLY
TAG_EVENTS --> IER
ORG_EVENT_BUS -.->|"事件契約遵循"| SK_ENV
ORG_EVENT_BUS --> IER
SKILL_EVENTS --> ORG_EVENT_BUS

%% ==========================================================================
%% VS5) WORKSPACE SLICE — 工作區業務切片
%% 職責：AB 雙軌業務（A軌=workflow正向流程 / B軌=異常處理）
%%        + 文件解析 + 應用層協調 + 治理（role/audit）
%% Tag 關係：W_B_SCHEDULE 提取職能需求標籤時，tagSlug 唯讀引用 Tag Authority
%% 不變量：#A3 blockWorkflow 中介解鎖；#A4 ParsingIntent 提議原則
%% ==========================================================================

subgraph VS5["🟣 VS5 · Workspace Slice（工作區業務）"]
    direction TB

    subgraph VS5_APP["⚙ Application Coordinator（協調層・不承載領域規則 #3）"]
        direction LR
        WS_CMD_HANDLER["command-handler\n指令處理器"]
        WS_SCOPE_GUARD["scope-guard\n作用域守衛 #A9"]
        WS_POLICY_ENG["policy-engine\n政策引擎"]
        WS_TX_RUNNER["transaction-runner\n#A8 1cmd/1agg"]
        WS_OUTBOX["outbox\n交易內發信箱"]
    end

    subgraph VS5_CORE["⚙ Workspace Core Domain"]
        WS_SETTINGS["workspace-core.settings"]
        WS_AGG["workspace-core.aggregate\n核心聚合實體"]
        WS_EVENT_BUS["workspace-core.event-bus"]
        WS_EVENT_STORE["workspace-core.event-store\n僅重播／稽核 #9"]
    end

    subgraph VS5_GOV["🛡 Workspace Governance"]
        WS_ROLE["workspace-governance.role\n繼承 org-governance.policy 約束 #18"]
        WS_AUDIT["workspace-governance.audit\ntrace-identifier 事件溯源"]
    end

    subgraph VS5_BIZ["⚙ Business Domain（A+B 雙軌）"]
        direction TB

        subgraph VS5_PARSE["📄 文件解析閉環"]
            W_FILES["workspace-business.files\n檔案管理"]
            W_PARSER["document-parser\n文件解析"]
            PARSING_INTENT[("ParsingIntent\n解析合約 Digital Twin\n#A4 唯讀・僅提議事件")]
        end

        WORKFLOW_AGG["workflow.aggregate\nAnomaly State Machine\nadvanceStage\nblockWorkflow / unblockWorkflow #A3"]

        subgraph VS5_A["🟢 A軌：主流程（workflow 階段視圖）"]
            direction LR
            A_TASKS["tasks\n任務管理"]
            A_QA["quality-assurance\n品質驗證"]
            A_ACCEPT["acceptance\n驗收"]
            A_FINANCE["finance\n財務處理"]
        end

        subgraph VS5_B["🔴 B軌：異常處理中心"]
            B_ISSUES{{"issues\n問題追蹤單"}}
        end

        W_B_DAILY["daily\n手寫施工日誌"]
        W_B_SCHEDULE["schedule\n任務排程產生\n(tagSlug 唯讀引用)"]

        W_FILES -.->|提供原始檔案| W_PARSER
        W_PARSER -->|解析完成| PARSING_INTENT
        PARSING_INTENT -->|任務批次草稿| A_TASKS
        PARSING_INTENT -->|財務指令| A_FINANCE
        PARSING_INTENT -->|解析異常| B_ISSUES
        A_TASKS -.->|"SourcePointer 唯讀 IntentID #A4"| PARSING_INTENT
        PARSING_INTENT -.->|"IntentDeltaProposed 提議 #A4"| A_TASKS
        WORKFLOW_AGG -.->|stage-view| A_TASKS & A_QA & A_ACCEPT & A_FINANCE
        A_TASKS --> A_QA --> A_ACCEPT --> A_FINANCE
        WORKFLOW_AGG -->|"A軌異常 → blockWorkflow #A3"| B_ISSUES
        A_TASKS -.-> W_B_DAILY
        A_TASKS -.->|任務分配／時間變動| W_B_SCHEDULE
        PARSING_INTENT -.->|提取職能需求 tagSlug| W_B_SCHEDULE
    end

    B_ISSUES -->|IssueResolved| WS_EVENT_BUS
    WS_EVENT_BUS -.->|"issues:resolved 中介解鎖 #A3"| WORKFLOW_AGG
    WS_CMD_HANDLER --> WS_SCOPE_GUARD --> WS_POLICY_ENG --> WS_TX_RUNNER
    WS_TX_RUNNER -->|"#A8 1cmd/1agg"| WS_AGG
    WS_TX_RUNNER -.->|執行業務邏輯| VS5_BIZ
    WS_TX_RUNNER -->|pending events| WS_OUTBOX
    WS_AGG --> WS_EVENT_STORE
    WS_AGG --> WS_EVENT_BUS
    WS_OUTBOX --> WS_EVENT_BUS
    WS_AUDIT -.->|"#9 store→funnel→audit"| WS_EVENT_STORE
end

ORG_AGG --> VS5
W_B_SCHEDULE -.->|"tagSlug 職能需求唯讀引用"| TAG_READONLY
W_B_SCHEDULE -.->|"人力需求契約"| SK_SKILL_REQ
WS_EVENT_BUS -.->|"事件契約遵循"| SK_ENV
WS_EVENT_BUS --> IER
WS_OUTBOX -->|integration events| IER

%% ==========================================================================
%% VS6) SCHEDULING SLICE — 排班協作切片
%% 職責：整合 ORG_ELIGIBLE_MEMBER_VIEW → 產生排班 → Saga 補償事件
%% 不變量：#14 只讀 ORG_ELIGIBLE_MEMBER_VIEW；#A5 跨 BC 採 saga/compensating event
%% 不變量：#15 eligible 生命週期 = joined→true / assigned→false / completed|cancelled→true
%% ==========================================================================

subgraph VS6["🟨 VS6 · Scheduling Slice（排班協作）"]
    direction TB

    subgraph VS6_DOMAIN["⚙ Schedule Domain"]
        ORG_SCHEDULE["account-organization.schedule\nHR Scheduling\n(tagSlug 職能需求唯讀引用)"]
    end

    subgraph VS6_SAGA["⚙ Scheduling Saga（補償事件 #A5）"]
        SCHEDULE_SAGA["scheduling-saga\nScheduleAssignRejected\nScheduleProposalCancelled"]
    end

    ORG_SCHEDULE -.->|"#14 只讀 eligible=true"| QGWAY_SCHED["→ Query Gateway\n.org-eligible-member-view"]
    ORG_SCHEDULE -->|ScheduleAssigned| ORG_EVENT_BUS
    ORG_SCHEDULE -.->|"人力需求契約"| SK_SKILL_REQ
    ORG_SCHEDULE -.->|"tagSlug 職能需求唯讀引用"| TAG_READONLY
    SCHEDULE_SAGA -.->|"#A5 compensating event"| ORG_EVENT_BUS
end

%% ==========================================================================
%% VS7) NOTIFICATION SLICE — 通知交付切片
%% 職責：觸發 → 無狀態路由 → FCM 交付
%% 不變量：#6 只讀 Projection；#A10 Router 無狀態路由，業務決策留來源 BC
%% ==========================================================================

subgraph VS7["🩷 VS7 · Notification Slice（通知交付）"]
    direction LR

    subgraph VS7_ROUTE["⚙ Notification Router（無狀態 #A10）"]
        NOTIF_ROUTER["account-governance\n.notification-router\n路由至 TargetAccountID"]
    end

    subgraph VS7_DELIVER["📤 Delivery"]
        USER_NOTIF["account-user.notification\n個人推播通知"]
        FCM[["Firebase Cloud Messaging\n推播閘道"]]
        USER_DEVICE["使用者裝置\n手機／瀏覽器"]
    end

    NOTIF_ROUTER -->|TargetAccountID 匹配| USER_NOTIF
    PROFILE -.->|"提供 FCM Token（唯讀）"| USER_NOTIF
    USER_NOTIF -.->|"#6 過濾+投影至個人中心"| QGWAY_NOTIF["→ Query Gateway\n.account-view"]
    USER_NOTIF --> FCM --> USER_DEVICE
end

ORG_EVENT_BUS -->|ScheduleAssigned| NOTIF_ROUTER

%% ==========================================================================
%% GW) 三閘道統一出入口（CQRS Gateway Layer）
%% 設計目標：
%%   - 所有切片的外部觸發統一由三閘道進出，切片本身不暴露內部
%%   - 新增切片只需「掛載到對應閘道」，無需修改其他切片
%%   - Command Bus：注入 TraceID / AuthSnapshot / 路由 → 各切片 Command Handler
%%   - Integration Event Router：統一事件出口 → Event Funnel → Projection
%%   - Query Gateway：統一讀取入口 → Read Model Registry → 各 Projection
%% ==========================================================================

subgraph GW["⚪ 三閘道統一出入口（CQRS Gateway Layer）"]
    direction TB

    subgraph GW_CMD["🔵 Command Bus Gateway（統一寫入入口）"]
        direction TB
        CBG_ENTRY["unified-command-gateway\n統一指令入口\nTraceID 注入 / Context 建立"]
        CBG_AUTH["universal-authority-interceptor\nAuthoritySnapshot 快照快路徑 #A9"]
        CBG_ROUTE["command-router\n路由至對應切片 Command Handler\n（可擴展：新切片只需註冊路由規則）"]

        CBG_ENTRY --> CBG_AUTH --> CBG_ROUTE
        CBG_AUTH -.->|"高風險二次確認 #A9\n（寫入/升權/敏感資源）"| SKILL_AGG
        CBG_AUTH -.->|"高風險二次確認 #A9"| ORG_AGG
        WS_SCOPE_GUARD -.->|"高風險二次確認 #A9"| WS_AGG
    end

    subgraph GW_EVENT["🟠 Integration Event Router（統一事件出口）"]
        direction TB
        IER[["integration-event-router\n跨 BC 事件路由器\n統一事件出口 #9\n（可擴展：訂閱新切片事件只需加路由規則）"]]
        IER -.->|"route: ScheduleProposed #A5"| ORG_SCHEDULE
    end

    subgraph GW_QUERY["🟢 Query Gateway（統一讀取入口）"]
        direction TB
        QGWAY["read-model-registry\n統一讀取入口\n版本對照 / 快照路由\n（可擴展：新 Read Model 只需註冊）"]
        QGWAY_SCHED["→ .org-eligible-member-view\n#14 #15 #16"]
        QGWAY_NOTIF["→ .account-view\n#6"]
        QGWAY_SCOPE["→ .workspace-scope-guard-view\n#A9"]

        QGWAY --> QGWAY_SCHED & QGWAY_NOTIF & QGWAY_SCOPE
    end

    CBG_ROUTE -->|"Workspace Command"| WS_CMD_HANDLER
    CBG_ROUTE -->|"Skill Command"| SKILL_AGG
    CBG_ROUTE -->|"Org Command"| ORG_AGG
    CBG_ROUTE -->|"Account Command"| USER_AGG
    ACTIVE_CTX -->|"查詢鍵"| QGWAY_SCOPE
    QGWAY_SCOPE --> CBG_AUTH
    WS_ROLE -.->|"#18 eligible=true 唯讀"| QGWAY_SCHED
end

%% _actions.ts Server Actions → Command Bus Gateway（統一入口）
SERVER_ACTIONS["_actions.ts\n所有切片 Server Action\n統一觸發入口"]
SERVER_ACTIONS --> CBG_ENTRY

%% ==========================================================================
%% VS8) PROJECTION BUS — 事件投影總線
%% 職責：Integration Event Router → Event Funnel → 所有 Read Model（最終一致）
%% 不變量：#9 Projection 可由事件完整重建；#A7 Funnel 只做 compose 不承擔不變量
%% eligible 生命週期 #15：MemberJoined→true・ScheduleAssigned→false・Completed/Cancelled→true
%% ==========================================================================

subgraph VS8["🟡 VS8 · Projection Bus（事件投影總線）"]
    direction TB

    subgraph VS8_FUNNEL["▶ Event Funnel（統一投影入口 #A7）"]
        FUNNEL[["event-funnel\n統一事件漏斗\n#9 唯一 Projection 寫入路徑"]]
    end

    subgraph VS8_META["⚙ Stream Version & Registry"]
        PROJ_VER["projection.version\n事件串流偏移量 / 版本對照"]
        READ_REG["read-model-registry\n讀模型版本目錄\n←→ Query Gateway"]
    end

    subgraph VS8_VIEWS["📖 Read Models（最終一致・不回推 Domain 寫入）"]
        direction LR

        subgraph VS8_WS_VIEWS["Workspace Views"]
            WORKSPACE_PROJ["projection.workspace-view"]
            WS_SCOPE_VIEW["projection\n.workspace-scope-guard-view\nScope Guard 專用 #A9"]
            ACC_AUDIT_VIEW["projection.account-audit"]
            ACC_SCHED_VIEW["projection.account-schedule"]
        end

        subgraph VS8_ACC_VIEWS["Account Views"]
            ACC_PROJ_VIEW_NODE["projection.account-view"]
            ORG_PROJ_VIEW["projection.organization-view"]
        end

        subgraph VS8_SKILL_VIEWS["Skill + Talent Views（標籤驅動）"]
            SKILL_VIEW["projection.account-skill-view\naccountId / skillId(=tagSlug)\nxp / tier\n來源: SkillXpAdded/Deducted"]
            ORG_ELIGIBLE_VIEW["projection\n.org-eligible-member-view\nTalent Repository 排班快照\norgId / accountId\nskills{tagSlug→xp} / eligible\n來源: MemberJoined/Left\n・SkillXpAdded/Deducted\n・ScheduleAssigned/Completed/Cancelled\n#14 #15 #16"]
            TIER_FN[["getTier(xp) → Tier\n純函式・不存 DB #12\nApprentice/Journeyman\nExpert/Artisan\nGrandmaster/Legendary/Titan"]]
        end

        subgraph VS8_TAG_VIEW["Tag Lifecycle Views（標籤驅動・可擴展）"]
            TAG_SNAPSHOT["projection.tag-snapshot\ntagSlug / label / category\n組織作用域快照\n來源: TagLifecycleEvent\n消費方唯讀快取"]
        end
    end

    IER ==>|"#9 唯一寫入路徑"| FUNNEL
    FUNNEL --> WORKSPACE_PROJ & WS_SCOPE_VIEW & ACC_AUDIT_VIEW & ACC_SCHED_VIEW
    FUNNEL --> ACC_PROJ_VIEW_NODE & ORG_PROJ_VIEW
    FUNNEL --> SKILL_VIEW & ORG_ELIGIBLE_VIEW
    FUNNEL --> TAG_SNAPSHOT

    FUNNEL -->|stream offset| PROJ_VER
    PROJ_VER -->|version mapping| READ_REG
    WS_EVENT_STORE -.->|"#9 replay → rebuild"| FUNNEL

    SKILL_VIEW -.->|"#12 getTier"| TIER_FN
    ORG_ELIGIBLE_VIEW -.->|"#12 getTier"| TIER_FN
end

READ_REG -.->|"版本目錄同步"| QGWAY
WS_SCOPE_VIEW -.->|"快照契約"| SK_AUTH_SNAP
ACC_PROJ_VIEW_NODE -.->|"快照契約"| SK_AUTH_SNAP
SKILL_VIEW -.->|"tier 推導契約"| SK_SKILL_TIER
ORG_ELIGIBLE_VIEW -.->|"tier 推導契約"| SK_SKILL_TIER

ORG_ELIGIBLE_VIEW -.-> QGWAY_SCHED
ACC_PROJ_VIEW_NODE -.-> QGWAY_NOTIF
WS_SCOPE_VIEW -.-> QGWAY_SCOPE

%% ==========================================================================
%% VS9) OBSERVABILITY SLICE — 可觀測性切片（橫切面）
%% 掛載點：Command Bus Gateway + Transaction Runner + Event Bus
%% ==========================================================================

subgraph VS9["⬜ VS9 · Observability（可觀測性・橫切面）"]
    direction LR
    TRACE_ID["trace-identifier\ncorrelation-identifier\n追蹤／關聯識別碼"]
    DOMAIN_METRICS["domain-metrics\n領域指標"]
    DOMAIN_ERRORS["domain-error-log\n領域錯誤日誌"]
end

CBG_ENTRY --> TRACE_ID
WS_CMD_HANDLER & WS_TX_RUNNER --> TRACE_ID
WS_TX_RUNNER --> DOMAIN_ERRORS
WS_EVENT_BUS & IER --> DOMAIN_METRICS

%% ==========================================================================
%% CONSISTENCY INVARIANTS 完整索引（設計強制約束）
%% ==========================================================================
%% #1  每個 BC 只能修改自己的 Aggregate，禁止跨 BC 直接寫入
%% #2  跨 BC 僅能透過 Event/Projection/ACL 溝通，禁止直接讀取對方 Domain Model
%% #3  Application Layer 只協調流程，不承載領域規則
%% #4  Domain Event 僅由 Aggregate 產生；Transaction Runner 只彙整已產生事件並投遞 Outbox
%% #5  Custom Claims 只做權限快照，不是真實來源
%% #6  Notification 只讀 Projection，不依賴 Domain Core
%% #7  Scope Guard 僅讀本 Context Read Model，不直接依賴外部 Event Bus
%% #8  Shared Kernel 必須顯式標示；未標示跨 BC 共用視為侵入
%% #9  Projection 必須可由事件完整重建；否則不得宣稱 Event Sourcing
%% #10 任一模組若需外部 Context 內部狀態，代表邊界設計錯誤
%% #11 XP 屬 Account BC；Organization 只能設定門檻，不能修改 XP
%% #12 Tier 永遠是推導值 getTier(xp)，不得存入任何 DB 欄位
%% #13 XP 任何異動必須寫 Ledger；不可直接 update xp 欄位
%% #14 Schedule 只讀 ORG_ELIGIBLE_MEMBER_VIEW，不查 Domain Aggregate
%% #15 eligible 生命週期：member:joined→true · assigned→false · completed/cancelled→true
%% #16 Talent Repository = member(內部)+partner(外部)+team(組視圖) → ORG_ELIGIBLE_MEMBER_VIEW
%% #17 centralized-tag.aggregate 管理 tagSlug 唯一性與刪除規則；消費方唯讀引用
%% #18 workspace-governance = 策略執行層；role 繼承 policy 硬約束
%% ==========================================================================
%% ATOMICITY AUDIT DECISIONS 完整索引
%% ==========================================================================
%% #A1  user-account 僅身份主體；wallet 獨立 aggregate（強一致）；profile/notification 弱一致
%% #A2  org-account.binding 與 org-core.aggregate 只允許 ACL/projection 對接
%% #A3  A 軌異常 → blockWorkflow → WORKFLOW_AGGREGATE → issues:resolved 中介解鎖（禁 B→A 直寫）
%% #A4  ParsingIntent 對 Tasks 只允許提議事件，不可直接回寫任務決策狀態
%% #A5  schedule 跨 BC 採 saga/compensating event（ScheduleAssignRejected/ScheduleProposalCancelled）
%% #A6  CENTRALIZED_TAG_AGGREGATE 為語義字典唯一權威；所有 tagSlug 必須由此唯讀引用
%% #A7  Event Funnel 僅負責 projection compose，不承擔跨 BC 不變量
%% #A8  Transaction Runner 僅保證單一 command 內單一 aggregate 原子提交
%% #A9  Scope Guard 讀 projection 快路徑；高風險授權需回源 aggregate 再確認
%% #A10 Notification Router 僅做無狀態路由；跨 BC 業務決策留在來源 BC
%% #A11 eligible 旗標 = 「無衝突排班」快照，非靜態成員狀態
%% ==========================================================================
%% TAG AUTHORITY 擴展規則（v5 新增）
%% T1  新切片若需標籤語義：只需訂閱 TagLifecycleEvent，不得自行維護標籤主數據
%% T2  SKILL_TAG_POOL = Tag Authority 的組織作用域唯讀投影（由 TagLifecycleEvent 更新）
%% T3  ORG_ELIGIBLE_MEMBER_VIEW.skills{tagSlug→xp} = Tag Authority tagSlug × Skill XP 的交叉快照
%% T4  W_B_SCHEDULE / ORG_SCHEDULE 的職能需求標籤 = SK_SKILL_REQ 契約 × Tag Authority tagSlug
%% T5  TAG_SNAPSHOT = Tag Authority 全域語義字典的最終一致讀模型；消費方禁止寫入
%% ==========================================================================

%% ==========================================================================
%% STYLES
%% ==========================================================================
classDef sk fill:#ecfeff,stroke:#22d3ee,color:#000,font-weight:bold
classDef tagAuth fill:#cffafe,stroke:#0891b2,color:#000,font-weight:bold
classDef identity fill:#dbeafe,stroke:#93c5fd,color:#000
classDef account fill:#dcfce7,stroke:#86efac,color:#000
classDef skillSlice fill:#bbf7d0,stroke:#22c55e,color:#000
classDef orgSlice fill:#fff7ed,stroke:#fdba74,color:#000
classDef wsSlice fill:#ede9fe,stroke:#c4b5fd,color:#000
classDef schedSlice fill:#fef9c3,stroke:#fde047,color:#000
classDef notifSlice fill:#fce7f3,stroke:#f9a8d4,color:#000
classDef projSlice fill:#fef9c3,stroke:#fde047,color:#000
classDef tagProjSlice fill:#e0f2fe,stroke:#0284c7,color:#000
classDef gateway fill:#f8fafc,stroke:#475569,color:#000,font-weight:bold
classDef cmdGw fill:#eff6ff,stroke:#3b82f6,color:#000
classDef eventGw fill:#fff7ed,stroke:#f97316,color:#000
classDef queryGw fill:#f0fdf4,stroke:#16a34a,color:#000
classDef observability fill:#f3f4f6,stroke:#9ca3af,color:#000
classDef trackA fill:#d1fae5,stroke:#6ee7b7,color:#000
classDef trackB fill:#fee2e2,stroke:#fca5a5,color:#000
classDef ledger fill:#bbf7d0,stroke:#22c55e,color:#000
classDef tierFn fill:#fdf4ff,stroke:#c084fc,color:#000
classDef talent fill:#fff1f2,stroke:#fda4af,color:#000
classDef fcm fill:#fce7f3,stroke:#f9a8d4,color:#000
classDef serverAction fill:#fed7aa,stroke:#fb923c,color:#000

class SK,SK_ENV,SK_AUTH_SNAP,SK_SKILL_TIER,SK_SKILL_REQ sk
class CTA,TAG_EVENTS,TAG_READONLY tagAuth
class VS1,FIREBASE_AUTH,AUTH_IDENTITY,IDENTITY_LINK,ACTIVE_CTX,CUSTOM_CLAIMS identity
class VS2,USER_AGG,WALLET_AGG,PROFILE,ORG_ACC,ORG_ACC_SETTINGS,ORG_ACC_BINDING,ACC_ROLE,ACC_POLICY,ACC_EVENT_BUS account
class VS3,SKILL_AGG,XP_LEDGER,SKILL_EVENTS skillSlice
class VS4,ORG_AGG,ORG_MEMBER,ORG_PARTNER,ORG_TEAM,ORG_POLICY,ORG_SKILL_RECOG,SKILL_TAG_POOL,ORG_EVENT_BUS orgSlice
class TALENT_REPO talent
class VS5,WS_CMD_HANDLER,WS_SCOPE_GUARD,WS_POLICY_ENG,WS_TX_RUNNER,WS_OUTBOX,WS_SETTINGS,WS_AGG,WS_EVENT_BUS,WS_EVENT_STORE,WS_ROLE,WS_AUDIT,W_FILES,W_PARSER,PARSING_INTENT,WORKFLOW_AGG wsSlice
class A_TASKS,A_QA,A_ACCEPT,A_FINANCE trackA
class B_ISSUES,W_B_DAILY,W_B_SCHEDULE wsSlice
class VS6,ORG_SCHEDULE,SCHEDULE_SAGA schedSlice
class VS7,NOTIF_ROUTER,USER_NOTIF,FCM,USER_DEVICE notifSlice
class GW gateway
class CBG_ENTRY,CBG_AUTH,CBG_ROUTE cmdGw
class IER eventGw
class QGWAY,QGWAY_SCHED,QGWAY_NOTIF,QGWAY_SCOPE queryGw
class VS8,FUNNEL,PROJ_VER,READ_REG,WORKSPACE_PROJ,WS_SCOPE_VIEW,ACC_PROJ_VIEW_NODE,ACC_AUDIT_VIEW,ACC_SCHED_VIEW,ORG_PROJ_VIEW,SKILL_VIEW,ORG_ELIGIBLE_VIEW projSlice
class TAG_SNAPSHOT tagProjSlice
class TIER_FN tierFn
class VS9,TRACE_ID,DOMAIN_METRICS,DOMAIN_ERRORS observability
class SERVER_ACTIONS serverAction
