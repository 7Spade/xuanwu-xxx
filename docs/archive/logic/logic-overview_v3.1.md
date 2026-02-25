---
title: Logic Overview v4 — Vertical Feature Slice Architecture
---

%% ==========================================================================
%% VERTICAL FEATURE SLICE ARCHITECTURE
%% 設計原則：每個切片 = 獨立的 Command → Domain → Event → Projection 閉環
%% 切片間通訊：僅透過 Shared Kernel 契約 + Integration Event Router
%% 閱讀順序：
%%   VS0) Shared Kernel（跨片元契約中心）
%%   VS1) Identity Slice（身份驗證切片）
%%   VS2) Account Slice（帳號主體切片）
%%   VS3) Skill XP Slice（能力成長切片）
%%   VS4) Organization Slice（組織治理切片）
%%   VS5) Workspace Slice（工作區業務切片）
%%   VS6) Scheduling Slice（排班協作切片）
%%   VS7) Notification Slice（通知交付切片）
%%   VS8) Projection Bus（事件投影總線）
%%   VS9) Observability（可觀測性切片）
%% ==========================================================================

flowchart TD

%% ==========================================================================
%% VS0) SHARED KERNEL — 跨切片顯式契約中心
%% 規則 #8：所有跨切片共用型別必須在此顯式聲明，未聲明視為邊界侵入
%% ==========================================================================

subgraph SK["🔷 VS0 · Shared Kernel（跨切片顯式契約）"]
    direction LR
    SK_ENV["event-envelope\n統一事件信封格式"]
    SK_AUTH_SNAP["authority-snapshot\n權限快照契約"]
    SK_SKILL_TIER["skill-tier\ngetTier(xp)→Tier\n純函式・不存 DB #12"]
    SK_SKILL_REQ["skill-requirement\n跨片人力需求契約"]
    SK_TAG["centralized-tag.aggregate\ntagSlug 唯一性\n刪除規則 #A6 #17"]
end

%% ==========================================================================
%% VS1) IDENTITY SLICE — 身份驗證切片
%% 職責：Firebase 驗證 → 建立已驗證身份 → 綁定帳號 ID → 簽發 Custom Claims
%% 邊界：僅產出 AUTHENTICATED_IDENTITY 與 CUSTOM_CLAIMS，不寫入任何 Domain Aggregate
%% ==========================================================================

subgraph VS1["🟦 VS1 · Identity Slice（身份驗證）"]
    direction TB

    subgraph VS1_IN["▶ Trigger"]
        FIREBASE_AUTH["Firebase Authentication\n登入／註冊／重設密碼"]
    end

    subgraph VS1_DOMAIN["⚙ Domain"]
        AUTH_IDENTITY["authenticated-identity\n已驗證身份主體"]
        IDENTITY_LINK["account-identity-link\nfirebaseUserId ↔ accountId"]
        ACTIVE_CTX["active-account-context\n組織／工作區作用中帳號"]
    end

    subgraph VS1_OUT["📤 Output Claims"]
        CUSTOM_CLAIMS["custom-claims\n權限快照聲明\n來源：account-governance #5"]
    end

    FIREBASE_AUTH --> AUTH_IDENTITY
    AUTH_IDENTITY --> IDENTITY_LINK
    IDENTITY_LINK --> ACTIVE_CTX
    AUTH_IDENTITY -->|"登入後觸發簽發／刷新"| CUSTOM_CLAIMS
end

CUSTOM_CLAIMS -.->|"快照契約"| SK_AUTH_SNAP

%% ==========================================================================
%% VS2) ACCOUNT SLICE — 帳號主體切片
%% 職責：個人帳號 + 組織帳號 + 帳號治理（Role/Policy）+ 錢包強一致 + 個人資料
%% 原子邊界 #A1：wallet = 強一致 aggregate；profile/notification = 弱一致
%% ==========================================================================

subgraph VS2["🟩 VS2 · Account Slice（帳號主體）"]
    direction TB

    subgraph VS2_CMD["▶ Command"]
        ACT_ACCOUNT["_actions.ts\n帳號 Server Action"]
    end

    subgraph VS2_DOMAIN["⚙ Domain Aggregates"]
        direction LR

        subgraph VS2_USER["個人帳號域"]
            USER_AGG["user-account\n個人帳號 aggregate"]
            WALLET_AGG["account-user.wallet.aggregate\n強一致帳本／餘額不變量 #A1"]
            PROFILE["account-user.profile\n使用者資料・FCM Token（弱一致）"]
        end

        subgraph VS2_ORG_ACC["組織帳號域"]
            ORG_ACC["organization-account\n組織帳號"]
            ORG_ACC_SETTINGS["organization-account.settings\n組織設定"]
            ORG_ACC_BINDING["organization-account.binding\n帳號↔組織主體綁定 #A2"]
        end

        subgraph VS2_GOV["帳號治理域"]
            ACC_ROLE["account-governance.role\n帳號角色"]
            ACC_POLICY["account-governance.policy\n帳號政策"]
        end
    end

    subgraph VS2_EVENT["📢 Domain Events"]
        ACC_EVENT_BUS["account-event-bus\nAccountCreated\nRoleChanged\nPolicyChanged"]
    end

    ACT_ACCOUNT --> USER_AGG & ORG_ACC
    USER_AGG --> WALLET_AGG
    USER_AGG -.->|弱一致| PROFILE
    ORG_ACC --> ORG_ACC_SETTINGS & ORG_ACC_BINDING
    ORG_ACC --> VS2_GOV
    ACC_ROLE & ACC_POLICY --> CUSTOM_CLAIMS
    ACC_ROLE & ACC_POLICY --> ACC_EVENT_BUS
end

IDENTITY_LINK --> USER_AGG
IDENTITY_LINK --> ORG_ACC
ORG_ACC_BINDING -.->|"ACL / projection 對接（非共享提交）#A2"| ORG_ENTITY_REF["→ VS4 Organization"]
ACC_EVENT_BUS -.->|事件契約| SK_ENV

%% ==========================================================================
%% VS3) SKILL XP SLICE — 能力成長切片
%% 職責：XP 增減指令 → aggregate 寫入 → Ledger 稽核 → 發射 SkillXpAdded/Deducted
%% 不變量 #11 #13：XP 屬 Account BC；Tier 為純函式推導；任何異動必須寫 Ledger
%% ==========================================================================

subgraph VS3["🟩 VS3 · Skill XP Slice（能力成長）"]
    direction TB

    subgraph VS3_CMD["▶ Command"]
        ACT_SKILL["_actions.ts\n addXp / deductXp\nSkill Server Action"]
    end

    subgraph VS3_DOMAIN["⚙ Domain Aggregates"]
        SKILL_AGG["account-skill.aggregate\naccountId / skillId\nxp / version"]
        XP_LEDGER[("account-skill-xp-ledger\nentryId / delta / reason\nsourceId / timestamp\n稽核帳本 #13")]
    end

    subgraph VS3_EVENT["📢 Domain Events"]
        SKILL_EVENTS["SkillXpAdded\nSkillXpDeducted\n→ Organization Event Bus"]
    end

    ACT_SKILL --> SKILL_AGG
    SKILL_AGG -->|"#13 任何 XP 異動必寫 Ledger"| XP_LEDGER
    SKILL_AGG --> SKILL_EVENTS
end

ACT_SKILL -.->|"Command via Gateway"| UNIFIED_GW
SKILL_EVENTS -.->|事件契約| SK_ENV
SKILL_EVENTS -.->|tier 推導契約| SK_SKILL_TIER

%% ==========================================================================
%% VS4) ORGANIZATION SLICE — 組織治理切片
%% 職責：組織核心聚合 + 成員/夥伴/團隊 + 技能認可 + 標籤庫 + 組織治理
%% 不變量：#11 Organization 不修改 XP；僅承認技能閾值
%% ==========================================================================

subgraph VS4["🟧 VS4 · Organization Slice（組織治理）"]
    direction TB

    subgraph VS4_CMD["▶ Command"]
        ACT_ORG["_actions.ts\n組織 Server Action"]
    end

    subgraph VS4_DOMAIN["⚙ Domain Aggregates"]
        direction TB

        subgraph VS4_CORE["組織核心"]
            ORG_AGG["organization-core.aggregate\n組織聚合實體"]
        end

        subgraph VS4_GOV["組織治理域"]
            ORG_MEMBER["account-organization.member\n內部成員"]
            ORG_PARTNER["account-organization.partner\n外部夥伴"]
            ORG_TEAM["account-organization.team\n團隊（組視圖）"]
            ORG_POLICY["account-organization.policy\n政策管理"]
            ORG_SKILL_RECOG["organization-skill-recognition.aggregate\norgId / accountId / skillId\nminXpRequired / status #11"]
        end

        subgraph VS4_TAG["技能標籤域（Shared Kernel 代理）"]
            SKILL_TAG_POOL[("職能標籤庫\naccount-organization.skill-tag")]
            TALENT_REPO[["人力資源池\nTalent Repository\nMember=內部+Partner=外部 #16"]]
        end
    end

    subgraph VS4_EVENT["📢 Domain Events"]
        ORG_EVENT_BUS["organization-core.event-bus\nMemberJoined / MemberLeft\nTagCreated / TagUpdated / TagDeleted\nSkillRecognitionGranted/Revoked\nPolicyChanged → AuthoritySnapshot"]
    end

    ACT_ORG --> ORG_AGG
    ORG_AGG --> ORG_EVENT_BUS
    ORG_POLICY -->|PolicyChanged → AuthoritySnapshot| ORG_EVENT_BUS
    ORG_MEMBER & ORG_PARTNER & ORG_TEAM --> TALENT_REPO
    ORG_MEMBER -.->|tagSlug 唯讀引用| SKILL_TAG_POOL
    ORG_PARTNER -.->|tagSlug 唯讀引用| SKILL_TAG_POOL
    ORG_TEAM -.->|組視圖引用（derived）| SKILL_TAG_POOL
    ORG_SKILL_RECOG --> ORG_EVENT_BUS
    SKILL_EVENTS --> ORG_EVENT_BUS
end

ACT_ORG -.->|"Command via Gateway"| UNIFIED_GW
SK_TAG --> SKILL_TAG_POOL
SK_TAG -->|TagCreated/Updated/Deleted| ORG_EVENT_BUS
SK_TAG -.->|"#A6 tag-lifecycle authority"| ORG_SKILL_RECOG
ORG_EVENT_BUS -.->|事件契約| SK_ENV

%% ==========================================================================
%% VS5) WORKSPACE SLICE — 工作區業務切片
%% 職責：雙軌業務（A軌 workflow + B軌 issues）+ 文件解析 + 治理（role/audit）
%% 不變量 #A3：blockWorkflow → WORKFLOW_AGGREGATE → issues:resolved 中介解鎖
%% 不變量 #A4：ParsingIntent 對 Tasks 只允許提議事件，不可直接回寫
%% ==========================================================================

subgraph VS5["🟣 VS5 · Workspace Slice（工作區業務）"]
    direction TB

    subgraph VS5_CMD["▶ Command"]
        ACT_WS["_actions.ts\nWorkspace Server Action"]
    end

    subgraph VS5_APP["⚙ Application Coordinator"]
        WS_CMD_HANDLER["workspace-application\n.command-handler\n指令處理器"]
        WS_SCOPE_GUARD["workspace-application\n.scope-guard\n作用域守衛 #A9"]
        WS_POLICY_ENG["workspace-application\n.policy-engine\n政策引擎"]
        WS_TX_RUNNER["workspace-application\n.transaction-runner\n#A8 1cmd/1agg"]
        WS_OUTBOX["workspace-application\n.outbox\n交易內發信箱"]
    end

    subgraph VS5_CORE["⚙ Domain Core"]
        WS_SETTINGS["workspace-core.settings\n工作區設定"]
        WS_AGG["workspace-core.aggregate\n核心聚合實體"]
        WS_EVENT_BUS["workspace-core.event-bus\n工作區事件總線"]
        WS_EVENT_STORE["workspace-core.event-store\n事件儲存（僅重播／稽核）#9"]
    end

    subgraph VS5_GOV["⚙ Governance"]
        WS_ROLE["workspace-governance.role\n繼承 org-governance.policy 約束 #18"]
        WS_AUDIT["workspace-governance.audit\ntrace-identifier 事件溯源"]
    end

    subgraph VS5_BIZ["⚙ Business Domain（A軌 + B軌）"]
        direction TB

        subgraph VS5_PARSE["文件解析閉環"]
            W_FILES["workspace-business.files\n檔案管理"]
            W_PARSER["workspace-business\n.document-parser\n文件解析"]
            PARSING_INTENT[("ParsingIntent\n解析合約\nDigital Twin")]
        end

        WORKFLOW_AGG["workspace-business\n.workflow.aggregate\nA軌狀態機\nadvanceStage\nblockWorkflow\nunblockWorkflow"]

        subgraph VS5_A["🟢 A軌：主流程（workflow 的階段視圖）"]
            direction LR
            A_TASKS["tasks\n任務管理"]
            A_QA["quality-assurance\n品質驗證"]
            A_ACCEPT["acceptance\n驗收"]
            A_FINANCE["finance\n財務處理"]
        end

        subgraph VS5_B["🔴 B軌：異常處理"]
            B_ISSUES{{"workspace-business.issues\n問題追蹤單"}}
        end

        W_B_DAILY["workspace-business.daily\n手寫施工日誌"]
        W_B_SCHEDULE["workspace-business.schedule\n任務排程產生"]

        W_FILES -.->|提供原始檔案| W_PARSER
        W_PARSER -->|解析完成・產出新版本| PARSING_INTENT
        PARSING_INTENT -->|任務批次草稿（含層級）| A_TASKS
        PARSING_INTENT -->|財務指令| A_FINANCE
        PARSING_INTENT -->|解析異常| B_ISSUES
        A_TASKS -.->|"SourcePointer 唯讀 IntentID #A4"| PARSING_INTENT
        PARSING_INTENT -.->|"IntentDeltaProposed 提議（不可直接回寫）#A4"| A_TASKS
        WORKFLOW_AGG -.->|stage-view| A_TASKS & A_QA & A_ACCEPT & A_FINANCE
        A_TASKS -->|正常順位| A_QA
        A_QA -->|正常順位| A_ACCEPT
        A_ACCEPT -->|正常順位| A_FINANCE
        WORKFLOW_AGG -->|A軌任一異常 → blockWorkflow| B_ISSUES
        A_TASKS -.-> W_B_DAILY
        A_TASKS -.->|任務分配／時間變動| W_B_SCHEDULE
        PARSING_INTENT -.->|提取職能需求標籤| W_B_SCHEDULE
    end

    B_ISSUES -->|IssueResolved 事件| WS_EVENT_BUS
    WS_EVENT_BUS -.->|"workspace:issues:resolved\nAnomaly State Machine 中介 #A3"| WORKFLOW_AGG

    ACT_WS --> WS_CMD_HANDLER
    WS_CMD_HANDLER --> WS_SCOPE_GUARD
    WS_SCOPE_GUARD --> WS_POLICY_ENG
    WS_POLICY_ENG --> WS_TX_RUNNER
    WS_TX_RUNNER -->|"#A8 1 cmd / 1 agg"| WS_AGG
    WS_TX_RUNNER -.->|執行業務領域邏輯| VS5_BIZ
    WS_TX_RUNNER -->|pending events → outbox| WS_OUTBOX
    WS_AGG --> WS_EVENT_STORE
    WS_AGG --> WS_EVENT_BUS
    WS_OUTBOX --> WS_EVENT_BUS
    WS_AUDIT -.->|"#9 store→funnel→audit"| WS_EVENT_STORE
end

ORG_AGG --> VS5["→ VS5 Workspace"]
ACT_WS -.->|"Command via Gateway"| UNIFIED_GW
WS_EVENT_BUS -.->|事件契約| SK_ENV
W_B_SCHEDULE -.->|人力需求契約| SK_SKILL_REQ

%% ==========================================================================
%% VS6) SCHEDULING SLICE — 排班協作切片
%% 職責：整合 Talent Repository projection → 產生排班 → Saga 補償
%% 不變量 #14：Schedule 只讀 ORG_ELIGIBLE_MEMBER_VIEW，不查 Domain Aggregate
%% 不變量 #A5：跨 BC 採 saga / compensating event
%% 不變量 #15：eligible 生命週期 = member:joined→true · assigned→false · completed/cancelled→true
%% ==========================================================================

subgraph VS6["🟨 VS6 · Scheduling Slice（排班協作）"]
    direction TB

    subgraph VS6_DOMAIN["⚙ Domain"]
        ORG_SCHEDULE["account-organization.schedule\nHR Scheduling"]
    end

    subgraph VS6_SAGA["⚙ Saga（補償事件 #A5）"]
        SCHEDULE_SAGA["scheduling-saga\nScheduleAssignRejected\nScheduleProposalCancelled"]
    end

    ORG_SCHEDULE -.->|"#14 只讀 eligible=true"| ORG_ELIGIBLE_MV["→ VS8 ORG_ELIGIBLE_MEMBER_VIEW"]
    W_B_SCHEDULE -.->|"#14 只讀 eligible=true"| ORG_ELIGIBLE_MV
    ORG_SCHEDULE -->|ScheduleAssigned 事件| ORG_EVENT_BUS
    ORG_SCHEDULE -.->|人力需求契約| SK_SKILL_REQ
    SCHEDULE_SAGA -.->|"#A5 compensating event"| ORG_EVENT_BUS
end

%% ==========================================================================
%% VS7) NOTIFICATION SLICE — 通知交付切片
%% 職責：三層架構 觸發→路由→交付；Token 唯讀 profile；只讀 Projection #6
%% 不變量 #6：Notification 只讀 Projection，不依賴 Domain Core
%% 不變量 #A10：Router 僅無狀態路由；跨 BC 業務決策留在來源 BC
%% ==========================================================================

subgraph VS7["🩷 VS7 · Notification Slice（通知交付）"]
    direction TB

    subgraph VS7_TRIGGER["▶ Trigger（來自 Organization Event Bus）"]
        NOTIF_TRIGGER["ScheduleAssigned\n（含 TargetAccountID）"]
    end

    subgraph VS7_ROUTE["⚙ Router（無狀態路由 #A10）"]
        NOTIF_ROUTER["account-governance\n.notification-router\n路由至目標帳號"]
    end

    subgraph VS7_DELIVER["📤 Delivery"]
        USER_NOTIF["account-user.notification\n個人推播通知"]
        FCM[["Firebase Cloud Messaging\n推播閘道"]]
        USER_DEVICE["使用者裝置\n手機／瀏覽器"]
    end

    NOTIF_TRIGGER --> NOTIF_ROUTER
    NOTIF_ROUTER -->|TargetAccountID 匹配| USER_NOTIF
    PROFILE -.->|"提供 FCM Token（唯讀）"| USER_NOTIF
    USER_NOTIF -.->|"過濾 + 投影至個人中心 #6"| ACC_PROJ_VIEW["→ VS8 account-projection-view"]
    USER_NOTIF --> FCM
    FCM -.->|推播通知| USER_DEVICE
end

ORG_EVENT_BUS -->|ScheduleAssigned| NOTIF_TRIGGER

%% ==========================================================================
%% VS8) PROJECTION BUS — 事件投影總線
%% 職責：統一 Event Funnel → 各讀模型；最終一致；不回推 Domain 寫入 #9
%% 不變量 #9：Projection 必須可由事件完整重建
%% 不變量 #A7：Event Funnel 僅 projection compose，不承擔跨 BC 不變量
%% ==========================================================================

subgraph VS8["🟡 VS8 · Projection Bus（事件投影總線）"]
    direction TB

    INT_ROUTER[["integration-event-router\n跨 BC 事件路由器"]]

    subgraph VS8_FUNNEL["▶ Event Funnel（統一入口 #A7）"]
        FUNNEL[["事件漏斗\nEvent Funnel"]]
    end

    subgraph VS8_META["⚙ Version & Registry"]
        PROJ_VER["projection.version\n事件串流偏移量 / 版本對照"]
        READ_REG["projection.read-model-registry\n讀模型註冊表"]
    end

    subgraph VS8_VIEWS["📖 Read Models（最終一致）"]
        direction LR

        WORKSPACE_PROJ["projection\n.workspace-view"]
        WS_SCOPE_VIEW["projection\n.workspace-scope-guard-view\nScope Guard 專用 #A9"]
        ACC_PROJ_VIEW_NODE["projection\n.account-view"]
        ACC_AUDIT_VIEW["projection\n.account-audit"]
        ACC_SCHED_VIEW["projection\n.account-schedule"]
        ORG_PROJ_VIEW["projection\n.organization-view"]

        SKILL_VIEW["projection.account-skill-view\naccountId/skillId/xp/tier\n來源: SkillXpAdded/Deducted"]
        ORG_ELIGIBLE_VIEW["projection\n.org-eligible-member-view\nTalent Repository 排班快照\n#14 #15 #16\norgId/accountId\nskills{tagSlug→xp}/eligible"]
        TIER_FN[["getTier(xp) → Tier\n純函式・不存 DB #12\nApprentice→Titan"]]
    end

    WS_EVENT_BUS --> INT_ROUTER
    ORG_EVENT_BUS --> INT_ROUTER
    WS_OUTBOX -->|integration events| INT_ROUTER
    INT_ROUTER ==>|"#9 唯一寫入路徑"| FUNNEL
    FUNNEL --> WORKSPACE_PROJ & WS_SCOPE_VIEW & ACC_PROJ_VIEW_NODE & ACC_AUDIT_VIEW & ACC_SCHED_VIEW & ORG_PROJ_VIEW & SKILL_VIEW & ORG_ELIGIBLE_VIEW
    FUNNEL -->|stream offset| PROJ_VER
    PROJ_VER -->|version mapping| READ_REG
    WS_EVENT_STORE -.->|"#9 replay → rebuild"| FUNNEL

    SKILL_VIEW -.->|"#12 getTier"| TIER_FN
    ORG_ELIGIBLE_VIEW -.->|"#12 getTier"| TIER_FN
end

INT_ROUTER -.->|"route: ScheduleProposed #A5 saga"| ORG_SCHEDULE

SKILL_VIEW -.->|tier 推導契約| SK_SKILL_TIER
ORG_ELIGIBLE_VIEW -.->|tier 推導契約| SK_SKILL_TIER
WS_SCOPE_VIEW -.->|快照契約| SK_AUTH_SNAP
ACC_PROJ_VIEW_NODE -.->|快照契約| SK_AUTH_SNAP

%% ==========================================================================
%% APPLICATION GATEWAY（跨切片協調層）
%% 職責：統一指令入口・TraceID注入・權限攔截・路由至對應切片
%% ==========================================================================

subgraph GATEWAY["⚪ Application Gateway（跨切片協調）"]
    direction TB

    UNIFIED_GW["unified-command-gateway\nTraceID / Context 注入"]
    AUTH_INTERCEPTOR["universal-authority-interceptor\nAuthoritySnapshot 快照檢查"]

    UNIFIED_GW -->|Workspace Command| WS_CMD_HANDLER
    UNIFIED_GW -->|Skill Command| SKILL_AGG
    UNIFIED_GW -->|Org Command| ORG_AGG
    WS_CMD_HANDLER --> AUTH_INTERCEPTOR
    ACTIVE_CTX -->|查詢鍵| WS_SCOPE_VIEW
    WS_SCOPE_VIEW --> AUTH_INTERCEPTOR
    ACC_PROJ_VIEW_NODE --> AUTH_INTERCEPTOR
    AUTH_INTERCEPTOR --> WS_SCOPE_GUARD
    AUTH_INTERCEPTOR -.->|"高風險二次確認\n#A9（寫入、升權、敏感資源）"| SKILL_AGG
    AUTH_INTERCEPTOR -.->|"高風險二次確認\n#A9（寫入、升權、敏感資源）"| ORG_AGG
    WS_SCOPE_GUARD -.->|"高風險二次確認 #A9"| WS_AGG
    WS_ROLE -.->|"#18 eligible=true 唯讀"| ORG_ELIGIBLE_VIEW
end

%% ==========================================================================
%% VS9) OBSERVABILITY SLICE — 可觀測性切片
%% ==========================================================================

subgraph VS9["⬜ VS9 · Observability（可觀測性）"]
    direction LR
    TRACE_ID["trace-identifier\ncorrelation-identifier\n追蹤／關聯識別碼"]
    DOMAIN_METRICS["domain-metrics\n領域指標"]
    DOMAIN_ERRORS["domain-error-log\n領域錯誤日誌"]
end

WS_CMD_HANDLER & WS_TX_RUNNER & WS_EVENT_BUS --> TRACE_ID
WS_TX_RUNNER --> DOMAIN_ERRORS
WS_EVENT_BUS --> DOMAIN_METRICS

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
%% #16 Talent Repository = member(內部) + partner(外部) + team(組視圖) → ORG_ELIGIBLE_MEMBER_VIEW
%% #17 centralized-tag.aggregate 管理 tagSlug 唯一性與刪除規則；Member/Partner 唯讀引用
%% #18 workspace-governance = 策略執行層；role 繼承 policy 硬約束
%% ==========================================================================
%% ATOMICITY AUDIT DECISIONS 完整索引
%% ==========================================================================
%% #A1  user-account 僅身份主體；wallet 獨立 aggregate（強一致）；profile/notification 弱一致
%% #A2  org-account.binding 與 org-core.aggregate 只允許 ACL/projection 對接
%% #A3  A 軌異常 → blockWorkflow → WORKFLOW_AGGREGATE → issues:resolved 中介解鎖（禁 B→A 直寫）
%% #A4  ParsingIntent 對 Tasks 只允許提議事件，不可直接回寫任務決策狀態
%% #A5  schedule 跨 BC 採 saga / compensating event（ScheduleAssignRejected / ScheduleProposalCancelled）
%% #A6  CENTRALIZED_TAG_AGGREGATE 需統一管理 tagSlug，其他模組僅可引用
%% #A7  Event Funnel 僅負責 projection compose，不承擔跨 BC 不變量
%% #A8  Transaction Runner 僅保證單一 command 內單一 aggregate 原子提交
%% #A9  Scope Guard 讀 projection 快路徑；高風險授權需回源 aggregate 再確認
%% #A10 Notification Router 僅做無狀態路由；跨 BC 業務決策留在來源 BC
%% #A11 eligible 旗標 = 「無衝突排班」快照，非靜態成員狀態
%% ==========================================================================

%% ==========================================================================
%% STYLES
%% ==========================================================================
classDef sk fill:#ecfeff,stroke:#22d3ee,color:#000,font-weight:bold
classDef identity fill:#dbeafe,stroke:#93c5fd,color:#000
classDef account fill:#dcfce7,stroke:#86efac,color:#000
classDef skillSlice fill:#bbf7d0,stroke:#22c55e,color:#000
classDef orgSlice fill:#fff7ed,stroke:#fdba74,color:#000
classDef wsSlice fill:#ede9fe,stroke:#c4b5fd,color:#000
classDef schedSlice fill:#fef9c3,stroke:#fde047,color:#000
classDef notifSlice fill:#fce7f3,stroke:#f9a8d4,color:#000
classDef projSlice fill:#fef9c3,stroke:#fde047,color:#000
classDef gateway fill:#f3f4f6,stroke:#d1d5db,color:#000
classDef observability fill:#f3f4f6,stroke:#9ca3af,color:#000
classDef trackA fill:#d1fae5,stroke:#6ee7b7,color:#000
classDef trackB fill:#fee2e2,stroke:#fca5a5,color:#000
classDef ledger fill:#bbf7d0,stroke:#22c55e,color:#000
classDef eventBus fill:#fef3c7,stroke:#f59e0b,color:#000
classDef tierFn fill:#fdf4ff,stroke:#c084fc,color:#000
classDef talent fill:#fff1f2,stroke:#fda4af,color:#000
classDef fcm fill:#fce7f3,stroke:#f9a8d4,color:#000

class SK,SK_ENV,SK_AUTH_SNAP,SK_SKILL_TIER,SK_SKILL_REQ,SK_TAG sk
class VS1,FIREBASE_AUTH,AUTH_IDENTITY,IDENTITY_LINK,ACTIVE_CTX,CUSTOM_CLAIMS identity
class VS2,ACT_ACCOUNT,USER_AGG,WALLET_AGG,PROFILE,ORG_ACC,ORG_ACC_SETTINGS,ORG_ACC_BINDING,ACC_ROLE,ACC_POLICY,ACC_EVENT_BUS account
class VS3,ACT_SKILL,SKILL_AGG,XP_LEDGER,SKILL_EVENTS skillSlice
class VS4,ACT_ORG,ORG_AGG,ORG_MEMBER,ORG_PARTNER,ORG_TEAM,ORG_POLICY,ORG_SKILL_RECOG,SKILL_TAG_POOL,ORG_EVENT_BUS orgSlice
class TALENT_REPO talent
class VS5,ACT_WS,WS_CMD_HANDLER,WS_SCOPE_GUARD,WS_POLICY_ENG,WS_TX_RUNNER,WS_OUTBOX,WS_SETTINGS,WS_AGG,WS_EVENT_BUS,WS_EVENT_STORE,WS_ROLE,WS_AUDIT,W_FILES,W_PARSER,PARSING_INTENT,WORKFLOW_AGG wsSlice
class A_TASKS,A_QA,A_ACCEPT,A_FINANCE trackA
class B_ISSUES,W_B_DAILY,W_B_SCHEDULE wsSlice
class VS6,ORG_SCHEDULE,SCHEDULE_SAGA schedSlice
class VS7,NOTIF_TRIGGER,NOTIF_ROUTER,USER_NOTIF,FCM,USER_DEVICE notifSlice
class VS8,INT_ROUTER,FUNNEL,PROJ_VER,READ_REG,WORKSPACE_PROJ,WS_SCOPE_VIEW,ACC_PROJ_VIEW_NODE,ACC_AUDIT_VIEW,ACC_SCHED_VIEW,ORG_PROJ_VIEW,SKILL_VIEW,ORG_ELIGIBLE_VIEW projSlice
class TIER_FN tierFn
class GATEWAY,UNIFIED_GW,AUTH_INTERCEPTOR gateway
class VS9,TRACE_ID,DOMAIN_METRICS,DOMAIN_ERRORS observability
