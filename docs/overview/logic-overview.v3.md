flowchart TD

%% =================================================
%% STRUCTURE INDEX（閱讀順序）
%% S0) Glossary + Boundary Definitions（術語與邊界定義）
%% S1) Domain Model Architecture（業務不變量 / 聚合）
%% S2) Application Coordination Layer（流程協調 / 技術構件）
%% S3) Projection & View Model Architecture（讀模型）
%% S4) Integration Contracts（共享契約 / 通知整合）
%% =================================================

%% =================================================
%% GLOSSARY + BOUNDARY DEFINITIONS（權威定義段）
%% Aggregate: 承載「必須同成敗」不變量的唯一原子邊界
%% Module: 功能切片／技術封裝，不等於原子邊界
%% Projection/View: 由事件衍生的讀模型，預設最終一致，不回推 Domain 寫入
%% Application Coordinator: 指令協調與流程編排（Scope Guard / Policy Engine / Transaction Runner / Event Funnel）
%% Talent Repository: CENTRALIZED_TAG_AGGREGATE 內的全域人力資源池契約（Vertical Slice 共享語義）= Member + Partner + Team → ORG_ELIGIBLE_MEMBER_VIEW（#16）
%% =================================================

%% =================================================
%% CONSISTENCY INVARIANTS（不變量）
%% 1) 每個 BC 只能修改自己的 Aggregate，禁止跨 BC 直接寫入
%% 2) 跨 BC 僅能透過 Event / Projection / 本地快取防腐層溝通，禁止直接讀取對方 Domain Model
%% 3) Application Layer 只協調流程，不承載領域規則
%% 4) Domain Event 僅由 Aggregate 產生；Transaction Runner 只彙整已產生事件並投遞 Outbox
%% 5) Custom Claims 只做權限快照，不是權限真實來源
%% 6) Notification 只能讀 Projection，不得依賴 Domain Core
%% 7) Scope Guard 僅讀本 Context Read Model，不直接依賴外部 Event Bus
%% 8) Shared Kernel 必須顯式標示；未標示的跨 BC 共用一律視為侵入
%% 9) Event Store 若存在，Projection 必須可由事件完整重建；否則不得宣稱 Event Sourcing
%% 10) 任一模組若需外部 Context 內部狀態，代表邊界設計錯誤
%% 11) XP 屬於 Account BC，不屬於 Organization BC；Organization 只能承認或設定門檻，不能修改 XP
%% 12) Tier 永遠是推導值（純函式 getTier(xp)），不得存入任何 DB 欄位
%% 13) XP 任何異動必須產生 Ledger 記錄（account-skill-xp-ledger）；不可直接 update xp 欄位
%% 14) Schedule 只讀 Projection（org-eligible-member-view），不得直接查詢 Domain Aggregate
%% 15) schedule:assigned → EVENT_FUNNEL → ORG_ELIGIBLE_MEMBER_VIEW.eligible=false（防雙重排班，非靜態成員狀態）
%% 16) Talent Repository（由 CENTRALIZED_TAG_AGGREGATE 統一定義）= member（內部）+ partner（外部）+ team（組視圖）→ ORG_ELIGIBLE_MEMBER_VIEW；Schedule 只讀此 Projection（#14）
%% 17) centralized-tag.aggregate（Shared Kernel）統一管理 tagSlug 唯一性與刪除規則（A6）；Member/Partner 唯讀引用；Team 為組視圖
%% 18) workspace-governance = 策略執行層：members → ORG_ELIGIBLE_MEMBER_VIEW；audit → EVENT_FUNNEL 自動投影；role 繼承 policy 硬約束
%% =================================================

%% =================================================
%% ATOMICITY AUDIT DECISIONS（原子邊界審計決策）
%% A1) user-account 僅作身份主體；wallet 為獨立 aggregate（強一致），profile / notification 為弱一致資料
%% A2) organization-account.binding 與 organization-core.aggregate 只允許 ACL / projection 對接，不共享同一提交邊界
%% A3) A 軌為 workflow.aggregate 的階段視圖；blockWorkflow → WORKFLOW_AGGREGATE（Anomaly State Machine）→ issues:resolved 中介解鎖（禁 B→A 直寫）
%% A4) ParsingIntent 對 Tasks 只允許提議事件，不可直接回寫任務決策狀態（Tasks 可訂閱提議事件後自行決策）
%% A5) schedule 跨 BC 採 saga / compensating event（例：ScheduleAssignRejected / ScheduleProposalCancelled）；若需同步強一致，必須上收同一 aggregate
%% A6) CENTRALIZED_TAG_AGGREGATE（Shared Kernel）需統一管理 tagSlug 唯一性與刪除規則，其他模組僅可引用
%% A7) Event Funnel 僅負責 projection compose，不承擔跨 BC 不變量
%% A8) Transaction Runner 僅保證單一 command 內單一 aggregate 原子提交，不協調跨 aggregate 強一致
%% A9) Scope Guard 讀 projection 作快路徑；高風險授權需回源 aggregate 再確認
%% A10) Notification Router 僅做無狀態路由；跨 BC 業務決策需留在來源 BC 或 projection 層
%% A11) eligible 生命週期（#15）：member:joined→true · schedule:assigned→false · completed/cancelled→true（待補）
%%      旗標 = 「無衝突排班」快照，非靜態成員狀態
%% =================================================

%% =================================================
%% S1) DOMAIN MODEL ARCHITECTURE（業務不變量 / 聚合）
%% =================================================

%% =================================================
%% AUTHENTICATION + IDENTITY（身份驗證與識別）
%% =================================================

FIREBASE_AUTHENTICATION[Firebase Authentication（用戶驗證服務）]
ACCOUNT_AUTH[identity-account.auth（登入／註冊／重設密碼）]

subgraph IDENTITY_LAYER[Identity Layer（身份層）]

    AUTHENTICATED_IDENTITY[authenticated-identity（已驗證身份）]
    ACCOUNT_IDENTITY_LINK["account-identity-link（firebaseUserId ↔ accountId 關聯）"]
    ACTIVE_ACCOUNT_CONTEXT["active-account-context（組織／工作區作用中帳號上下文）"]
    CUSTOM_CLAIMS[custom-claims（權限快取聲明，來源為帳號治理）]

end

FIREBASE_AUTHENTICATION --> ACCOUNT_AUTH
ACCOUNT_AUTH --> AUTHENTICATED_IDENTITY
AUTHENTICATED_IDENTITY --> ACCOUNT_IDENTITY_LINK
ACCOUNT_IDENTITY_LINK --> ACTIVE_ACCOUNT_CONTEXT
AUTHENTICATED_IDENTITY -->|登入後觸發簽發／刷新| CUSTOM_CLAIMS


%% =================================================
%% SUBJECT CENTER: Who（帳號主體 · Account + Organization）vs Workspace（What）
%% =================================================

subgraph SUBJECT_CENTER[主體中心（Subject Center）]

%% -------------------------------------------------
%% ACCOUNT LAYER（帳號層）
%% -------------------------------------------------

subgraph ACCOUNT_LAYER[Account Layer（帳號層）]

    %% 個人用戶中心：與登入身份對應的個人資料、錢包、通知，DB 共置同一帳號文件集合
    subgraph USER_PERSONAL_CENTER[個人用戶中心（User Personal Center）]
        USER_ACCOUNT[user-account（個人帳號）]
        USER_ACCOUNT_PROFILE["account-user.profile（使用者資料與設定 · FCM Token）"]
        USER_WALLET_AGGREGATE["account-user.wallet.aggregate（強一致帳本／餘額不變量）"]
        ACCOUNT_USER_NOTIFICATION[account-user.notification（個人推播通知）]
    end

    %% 組織帳號：與組織實體綁定的帳號視圖，同一 Account 邊界內
    ORGANIZATION_ACCOUNT[organization-account（組織帳號）]
    ORGANIZATION_ACCOUNT_SETTINGS[organization-account.settings（組織設定）]
    ORGANIZATION_ACCOUNT_BINDING[organization-account.binding（組織帳號與組織主體綁定）]

    subgraph ACCOUNT_GOVERNANCE[account-governance（帳號治理）]
        ACCOUNT_ROLE[account-governance.role（帳號角色）]
        ACCOUNT_POLICY[account-governance.policy（帳號政策）]
        ACCOUNT_NOTIFICATION_ROUTER[account-governance.notification-router（通知路由器）]
    end

    subgraph ACCOUNT_SKILL_LAYER[Account Skill Layer（帳號能力成長主權）]
        ACCOUNT_SKILL_AGGREGATE["account-skill.aggregate（accountId / skillId / xp / version）"]
        ACCOUNT_SKILL_XP_LEDGER[("account-skill-xp-ledger（XP 審計帳本 · entryId / delta / reason / sourceId / timestamp）")]
    end

end

ACCOUNT_IDENTITY_LINK --> USER_ACCOUNT
ACCOUNT_IDENTITY_LINK --> ORGANIZATION_ACCOUNT

USER_ACCOUNT -.->|弱一致資料關聯| USER_ACCOUNT_PROFILE
USER_ACCOUNT -->|強一致資產邊界| USER_WALLET_AGGREGATE

ORGANIZATION_ACCOUNT --> ORGANIZATION_ACCOUNT_SETTINGS
ORGANIZATION_ACCOUNT --> ORGANIZATION_ACCOUNT_BINDING
ORGANIZATION_ACCOUNT --> ACCOUNT_GOVERNANCE
ACCOUNT_ROLE --> CUSTOM_CLAIMS
ACCOUNT_POLICY --> CUSTOM_CLAIMS


%% -------------------------------------------------
%% ORGANIZATION LAYER（組織層）— 同屬主體中心
%% -------------------------------------------------

subgraph ORGANIZATION_LAYER[Organization Layer（組織層）]

    subgraph ORGANIZATION_CORE[organization-core（組織核心）]
        ORGANIZATION_ENTITY[organization-core.aggregate（組織聚合實體）]
        ORGANIZATION_EVENT_BUS[organization-core.event-bus（組織事件總線）]
    end

    subgraph ORGANIZATION_GOVERNANCE[organization-governance（組織治理）]
        ORGANIZATION_MEMBER["account-organization.member（組織成員 · 內部人員）"]
        ORGANIZATION_TEAM["account-organization.team（團隊管理 · 內部組視圖）"]
        ORGANIZATION_PARTNER["account-organization.partner（合作夥伴 · 外部人員）"]
        ORGANIZATION_POLICY["account-organization.policy（政策管理）"]
        ORG_SKILL_RECOGNITION["organization-skill-recognition.aggregate（organizationId / accountId / skillId / minXpRequired / status）"]
    end

    ORGANIZATION_SCHEDULE["account-organization.schedule（人力排程管理 · HR Scheduling）"]

end

%% end SUBJECT_CENTER
end

ORGANIZATION_ACCOUNT_BINDING -.->|ACL / projection 對接（非共享提交）| ORGANIZATION_ENTITY
ORGANIZATION_ENTITY --> ORGANIZATION_EVENT_BUS
ORGANIZATION_POLICY -->|PolicyChanged → AuthoritySnapshot| ORGANIZATION_EVENT_BUS


%% CAPABILITY BC: skill-definition = shared/constants/skills.ts 靜態庫（#17 · 標籤唯一性由 CENTRALIZED_TAG_AGGREGATE 管理）


%% =================================================
%% WORKSPACE CONTAINER（工作區容器）
%% =================================================

subgraph WORKSPACE_CONTAINER[Workspace Container（工作區容器）]

    subgraph WORKSPACE_APPLICATION[workspace-application（應用層）]
        WORKSPACE_COMMAND_HANDLER[workspace-application.command-handler（指令處理器）]
        WORKSPACE_SCOPE_GUARD[workspace-application.scope-guard（作用域守衛）]
        WORKSPACE_POLICY_ENGINE[workspace-application.policy-engine（政策引擎）]
        WORKSPACE_TRANSACTION_RUNNER[workspace-application.transaction-runner（交易執行器）]
        WORKSPACE_OUTBOX["workspace-application.outbox（交易內發信箱）"]
    end

    subgraph WORKSPACE_CORE[workspace-core（核心層）]
        WORKSPACE_SETTINGS[workspace-core.settings（工作區設定）]
        WORKSPACE_AGGREGATE[workspace-core.aggregate（核心聚合實體）]
        WORKSPACE_EVENT_BUS[workspace-core.event-bus（事件總線）]
        WORKSPACE_EVENT_STORE["workspace-core.event-store（事件儲存，僅供重播／稽核）"]
    end

    subgraph WORKSPACE_GOVERNANCE[workspace-governance（工作區治理 · 策略執行層）]
        WORKSPACE_ROLE["workspace-governance.role（角色管理 · 繼承 organization-governance.policy 約束）"]
        WORKSPACE_AUDIT[workspace-governance.audit（稽核視圖 · trace-identifier 事件溯源）]
    end

    %% --- AB 雙軌業務邏輯核心 ---
    subgraph WORKSPACE_BUSINESS[workspace-business（業務層）]
        direction TB

        %% 輔助與靜態單元
        W_B_FILES[workspace-business.files（檔案管理）]
        W_B_PARSER[workspace-business.document-parser（文件解析）]
        PARSING_INTENT[(ParsingIntent（解析合約 · Digital Twin）)]
        W_B_DAILY[workspace-business.daily（手寫施工日誌）]
        W_B_SCHEDULE[workspace-business.schedule（任務排程產生）]

        WORKFLOW_AGGREGATE["workspace-business.workflow.aggregate（A 軌狀態機 · advanceStage / blockWorkflow / unblockWorkflow）"]

        %% A 軌：主流程（workflow 的階段視圖）
        TRACK_A_TASKS[workspace-business.tasks（任務管理）]
        TRACK_A_QA[workspace-business.quality-assurance（品質驗證）]
        TRACK_A_ACCEPTANCE[workspace-business.acceptance（驗收）]
        TRACK_A_FINANCE[workspace-business.finance（財務處理）]

        %% B 軌：異常處理中心
        TRACK_B_ISSUES{{workspace-business.issues（問題追蹤單）}}

        %% 文件解析閉環（Files → Parser → ParsingIntent → A軌 / B軌）
        W_B_FILES -.->|提供原始檔案| W_B_PARSER
        W_B_PARSER -->|解析完成 · 產出新版本| PARSING_INTENT
        PARSING_INTENT -->|任務批次草稿（含層級結構）| TRACK_A_TASKS
        PARSING_INTENT -->|財務指令| TRACK_A_FINANCE
        PARSING_INTENT -->|解析異常| TRACK_B_ISSUES

        %% Digital Twin：PARSING_INTENT 為唯讀合約；TRACK_A_TASKS 透過 SourcePointer 引用 IntentID
        TRACK_A_TASKS -.->|SourcePointer 引用（唯讀 · IntentID）| PARSING_INTENT
        PARSING_INTENT -.->|IntentDeltaProposed 事件提議（不可直接回寫）| TRACK_A_TASKS

        WORKFLOW_AGGREGATE -.->|stage-view| TRACK_A_TASKS & TRACK_A_QA & TRACK_A_ACCEPTANCE & TRACK_A_FINANCE

        %% A 軌正常順位流轉（WORKFLOW_AGGREGATE 為異常狀態機：任一 A 軌異常 → blockWorkflow → 路由至 B 軌）
        TRACK_A_TASKS -->|正常順位| TRACK_A_QA
        TRACK_A_QA -->|正常順位| TRACK_A_ACCEPTANCE
        TRACK_A_ACCEPTANCE -->|正常順位| TRACK_A_FINANCE
        WORKFLOW_AGGREGATE -->|A 軌任一階段異常 → blockWorkflow| TRACK_B_ISSUES

        %% B 軌解鎖：統一發送 IssueResolved 事件；A 軌自訂閱後呼叫 unblockWorkflow（離散恢復 · 禁止跨模組回寫）

        %% 日誌與排程關聯
        TRACK_A_TASKS -.-> W_B_DAILY
        TRACK_A_TASKS -.->|任務分配／時間變動觸發| W_B_SCHEDULE
        PARSING_INTENT -.->|提取職能需求標籤| W_B_SCHEDULE

    end

    %% B 軌 IssueResolved 事件（WORKFLOW_AGGREGATE 作為 Anomaly State Machine 中介 · 離散恢復原則）
    TRACK_B_ISSUES -->|IssueResolved 事件| WORKSPACE_EVENT_BUS
    WORKSPACE_EVENT_BUS -.->|workspace:issues:resolved（Anomaly State Machine 中介）| WORKFLOW_AGGREGATE

end

ORGANIZATION_ENTITY --> WORKSPACE_CONTAINER


%% 職能標籤庫與人才資源池（#17/#16）：由 Shared Kernel 的 CENTRALIZED_TAG_AGGREGATE 管理；Member/Partner 唯讀引用；Team = 組視圖
CENTRALIZED_TAG_AGGREGATE --> SKILL_TAG_POOL
CENTRALIZED_TAG_AGGREGATE --> TALENT_REPOSITORY
CENTRALIZED_TAG_AGGREGATE -.->|#A6: tag-lifecycle authority| ORG_SKILL_RECOGNITION
CENTRALIZED_TAG_AGGREGATE -->|TagCreated / TagUpdated / TagDeleted| ORGANIZATION_EVENT_BUS
ORGANIZATION_MEMBER -.->|tagSlug 唯讀引用| SKILL_TAG_POOL
ORGANIZATION_PARTNER -.->|tagSlug 唯讀引用| SKILL_TAG_POOL
ORGANIZATION_TEAM -.->|組視圖引用（derived）| SKILL_TAG_POOL
ORGANIZATION_MEMBER -.->|內部人員來源| TALENT_REPOSITORY
ORGANIZATION_PARTNER -.->|外部人員來源| TALENT_REPOSITORY
ORGANIZATION_TEAM -.->|組視圖來源| TALENT_REPOSITORY


%% TALENT_REPOSITORY: MemberJoined/Left → ORGANIZATION_EVENT_BUS → EVENT_FUNNEL_INPUT → ORG_ELIGIBLE_MEMBER_VIEW（#16）


%% =================================================
%% S2) APPLICATION COORDINATION LAYER（流程協調 / 技術構件）
%% =================================================

%% =================================================
%% REQUEST FLOW（請求流程編排）
%% =================================================

SERVER_ACTION["_actions.ts（Server Action — 業務觸發入口）"]
UNIFIED_COMMAND_GATEWAY["unified-command-gateway（統一指令閘道器 · TraceID / Context 注入）"]
UNIVERSAL_AUTHORITY_INTERCEPTOR["universal-authority-interceptor（統一權限攔截器 · AuthoritySnapshot 快照檢查）"]
SERVER_ACTION -->|發送 Command| UNIFIED_COMMAND_GATEWAY
SERVER_ACTION_SKILL -->|發送 Command| UNIFIED_COMMAND_GATEWAY
UNIFIED_COMMAND_GATEWAY -->|Workspace Command| WORKSPACE_COMMAND_HANDLER
UNIFIED_COMMAND_GATEWAY -->|Skill Command| ACCOUNT_SKILL_AGGREGATE
UNIFIED_COMMAND_GATEWAY -->|Org Command| ORGANIZATION_ENTITY
WORKSPACE_TRANSACTION_RUNNER -.->|執行業務領域邏輯| WORKSPACE_BUSINESS

WORKSPACE_COMMAND_HANDLER --> UNIVERSAL_AUTHORITY_INTERCEPTOR
ACTIVE_ACCOUNT_CONTEXT -->|查詢鍵| WORKSPACE_SCOPE_READ_MODEL
WORKSPACE_SCOPE_READ_MODEL --> UNIVERSAL_AUTHORITY_INTERCEPTOR
ACCOUNT_PROJECTION_VIEW --> UNIVERSAL_AUTHORITY_INTERCEPTOR
UNIVERSAL_AUTHORITY_INTERCEPTOR --> WORKSPACE_SCOPE_GUARD
UNIVERSAL_AUTHORITY_INTERCEPTOR -.->|高風險授權二次確認（寫入、升權、敏感資源）| ACCOUNT_SKILL_AGGREGATE
UNIVERSAL_AUTHORITY_INTERCEPTOR -.->|高風險授權二次確認（寫入、升權、敏感資源）| ORGANIZATION_ENTITY
WORKSPACE_SCOPE_GUARD -.->|高風險授權二次確認（寫入、升權、敏感資源）| WORKSPACE_AGGREGATE
WORKSPACE_ROLE -.->|#18 eligible=true · 唯讀| ORG_ELIGIBLE_MEMBER_VIEW

WORKSPACE_SCOPE_GUARD --> WORKSPACE_POLICY_ENGINE
WORKSPACE_POLICY_ENGINE --> WORKSPACE_TRANSACTION_RUNNER

WORKSPACE_TRANSACTION_RUNNER -->|#A8: 1 cmd / 1 agg| WORKSPACE_AGGREGATE
WORKSPACE_AGGREGATE --> WORKSPACE_EVENT_STORE
WORKSPACE_AUDIT -.->|#9 store→funnel→audit| ACCOUNT_PROJECTION_AUDIT
WORKSPACE_TRANSACTION_RUNNER -->|pending events → outbox| WORKSPACE_OUTBOX

WORKSPACE_OUTBOX --> WORKSPACE_EVENT_BUS


%% =================================================
%% EVENT BRIDGE（事件橋接）
%% =================================================

ORGANIZATION_EVENT_BUS --> ORGANIZATION_SCHEDULE
INTEGRATION_EVENT_ROUTER[["integration-event-router（跨 BC 事件路由器）"]]
WORKSPACE_EVENT_BUS --> INTEGRATION_EVENT_ROUTER
ORGANIZATION_EVENT_BUS --> INTEGRATION_EVENT_ROUTER
WORKSPACE_OUTBOX -->|integration events| INTEGRATION_EVENT_ROUTER
INTEGRATION_EVENT_ROUTER -.->|route: ScheduleProposed · #A5 saga| ORGANIZATION_SCHEDULE
W_B_SCHEDULE -.->|根據排程投影過濾可用帳號| ACCOUNT_PROJECTION_SCHEDULE
W_B_SCHEDULE -.->|#14 Universal Scheduler · eligible=true| ORG_ELIGIBLE_MEMBER_VIEW
ORGANIZATION_SCHEDULE -.->|#14 Universal Scheduler · eligible=true| ORG_ELIGIBLE_MEMBER_VIEW


%% SKILL XP：_actions → Aggregate → #13 Ledger → Event → Projection（禁止跨 Ledger 直接更新 xp）

SERVER_ACTION_SKILL["_actions.ts（Skill Server Action — addXp / deductXp）"]
SERVER_ACTION_SKILL -->|addXp / deductXp Command| ACCOUNT_SKILL_AGGREGATE
ACCOUNT_SKILL_AGGREGATE -->|addXp · #13: -> Ledger| ACCOUNT_SKILL_XP_LEDGER
ACCOUNT_SKILL_AGGREGATE -->|SkillXpAdded / SkillXpDeducted| ORGANIZATION_EVENT_BUS
ORG_SKILL_RECOGNITION -->|SkillRecognitionGranted / SkillRecognitionRevoked| ORGANIZATION_EVENT_BUS


%% =================================================
%% S3) PROJECTION & VIEW MODEL ARCHITECTURE（讀模型架構）
%% =================================================
%% 讀模型章節：明確區分來源事件、最終一致、不可回推 Domain 寫入
%% =================================================

%% =================================================
%% PROJECTION LAYER（投影層）
%% =================================================

subgraph PROJECTION_LAYER[Projection Layer（資料投影層）]

    EVENT_FUNNEL_INPUT[["事件漏斗（Event Funnel · 統一入口）"]]

    PROJECTION_VERSION[projection.version（事件串流偏移量與讀模型版本對照）]
    READ_MODEL_REGISTRY[projection.read-model-registry（讀取模型註冊表）]

    WORKSPACE_PROJECTION_VIEW[projection.workspace-view（工作區投影視圖）]
    WORKSPACE_SCOPE_READ_MODEL[projection.workspace-scope-guard-view（Scope Guard 專用讀模型）]
    ACCOUNT_PROJECTION_VIEW[projection.account-view（帳號投影視圖）]
    ACCOUNT_PROJECTION_AUDIT[projection.account-audit（帳號稽核投影）]
    ACCOUNT_PROJECTION_SCHEDULE[projection.account-schedule（帳號排程投影）]
    ORGANIZATION_PROJECTION_VIEW[projection.organization-view（組織投影視圖）]

    ACCOUNT_SKILL_VIEW["projection.account-skill-view（accountId / skillId / xp / tier · 來源: SkillXpAdded/Deducted）"]
    ORG_ELIGIBLE_MEMBER_VIEW["projection.org-eligible-member-view（Talent Repository 排班可用性快照 · orgId/accountId/skills{tagSlug→xp}/eligible · 來源: MemberJoined/Left · SkillXpAdded/Deducted · ScheduleAssigned/Completed/Cancelled）"]
    SKILL_TIER_FUNCTION[["getTier(xp) → Tier（純函式 · Apprentice/Journeyman/Expert/Artisan/Grandmaster/Legendary/Titan · 不存 DB）"]]

end

%% EVENT_FUNNEL: Integration Event Router → 統一入口 → 各 Projection（#A7：僅 projection compose，非跨 BC 不變量）
%% Projection 寫入唯一路徑：INTEGRATION_EVENT_ROUTER -> EVENT_FUNNEL_INPUT（#9）
INTEGRATION_EVENT_ROUTER ==> EVENT_FUNNEL_INPUT
EVENT_FUNNEL_INPUT --> WORKSPACE_PROJECTION_VIEW & WORKSPACE_SCOPE_READ_MODEL & ACCOUNT_PROJECTION_VIEW & ACCOUNT_PROJECTION_AUDIT & ACCOUNT_PROJECTION_SCHEDULE & ORGANIZATION_PROJECTION_VIEW & ACCOUNT_SKILL_VIEW & ORG_ELIGIBLE_MEMBER_VIEW

ACCOUNT_SKILL_VIEW -.->|#12: getTier| SKILL_TIER_FUNCTION
ORG_ELIGIBLE_MEMBER_VIEW -.->|#12: getTier| SKILL_TIER_FUNCTION

EVENT_FUNNEL_INPUT -->|stream offset| PROJECTION_VERSION
PROJECTION_VERSION -->|version mapping| READ_MODEL_REGISTRY
WORKSPACE_EVENT_STORE -.->|#9: replay -> rebuild| EVENT_FUNNEL_INPUT


%% =================================================
%% S4) INTEGRATION CONTRACTS（共享契約 / 整合）
%% =================================================

%% =================================================
%% SHARED KERNEL（#8：跨 BC 顯式契約；虛線 = 契約遵循，非讀寫依賴）
%% =================================================
subgraph SHARED_KERNEL[Shared Kernel（跨 BC 顯式共享契約）]
    SK_EVENT_ENVELOPE["shared-kernel.event-envelope（events/event-envelope.ts · 統一事件信封契約）"]
    SK_AUTHORITY_SNAPSHOT["shared-kernel.authority-snapshot（identity/authority-snapshot.ts · 權限快照契約）"]
    SK_SKILL_TIER["shared-kernel.skill-tier（skills/skill-tier.ts · 七階位能力等級 · getTier 純函式 · Invariant #12）"]
    SK_SKILL_REQUIREMENT["shared-kernel.skill-requirement（workforce/skill-requirement.ts · 跨 BC 人力需求契約）"]
    CENTRALIZED_TAG_AGGREGATE["centralized-tag.aggregate（全域語義字典 · tagSlug 唯一性／刪除規則）"]
    SKILL_TAG_POOL[("職能標籤庫（Skills / Certs / Roles / Status · Global Tag Dictionary）")]
    TALENT_REPOSITORY[["人力資源池（Talent Repository · Member + Partner + Team · 排班來源契約）"]]
end

WORKSPACE_EVENT_BUS -.->|事件契約遵循| SK_EVENT_ENVELOPE
ORGANIZATION_EVENT_BUS -.->|事件契約遵循| SK_EVENT_ENVELOPE
WORKSPACE_SCOPE_READ_MODEL -.->|快照契約遵循| SK_AUTHORITY_SNAPSHOT
ACCOUNT_PROJECTION_VIEW -.->|快照契約遵循| SK_AUTHORITY_SNAPSHOT
ACCOUNT_SKILL_VIEW -.->|tier 推導契約遵循| SK_SKILL_TIER
ORG_ELIGIBLE_MEMBER_VIEW -.->|tier 推導契約遵循| SK_SKILL_TIER
ORGANIZATION_SCHEDULE -.->|人力需求契約遵循| SK_SKILL_REQUIREMENT
W_B_SCHEDULE -.->|人力需求契約遵循| SK_SKILL_REQUIREMENT


%% =================================================
%% FCM NOTIFICATION（#6：三層架構 · 觸發→路由→交付；Token 唯讀 profile）
%% =================================================

FCM_GATEWAY[["Firebase Cloud Messaging（推播閘道）"]]
USER_DEVICE[使用者裝置（手機／瀏覽器）]

ORGANIZATION_SCHEDULE -->|ScheduleAssigned 事件| ORGANIZATION_EVENT_BUS

ORGANIZATION_EVENT_BUS -->|ScheduleAssigned（含 TargetAccountID）| ACCOUNT_NOTIFICATION_ROUTER
ACCOUNT_NOTIFICATION_ROUTER -->|無狀態路由至目標帳號（TargetAccountID 匹配）| ACCOUNT_USER_NOTIFICATION

USER_ACCOUNT_PROFILE -.->|提供 FCM Token（唯讀查詢）| ACCOUNT_USER_NOTIFICATION
ACCOUNT_USER_NOTIFICATION -.->|過濾（internal/external）+ 投影至個人中心| ACCOUNT_PROJECTION_VIEW
ACCOUNT_USER_NOTIFICATION --> FCM_GATEWAY
FCM_GATEWAY -.->|推播通知| USER_DEVICE


%% =================================================
%% OBSERVABILITY（可觀測性）
%% =================================================

subgraph OBSERVABILITY_LAYER[Observability Layer（可觀測性層）]
    TRACE_IDENTIFIER["trace-identifier / correlation-identifier（追蹤／關聯識別碼）"]
    DOMAIN_METRICS[domain-metrics（領域指標）]
    DOMAIN_ERROR_LOG[domain-error-log（領域錯誤日誌）]
end

WORKSPACE_COMMAND_HANDLER & WORKSPACE_TRANSACTION_RUNNER & WORKSPACE_EVENT_BUS --> TRACE_IDENTIFIER

WORKSPACE_TRANSACTION_RUNNER --> DOMAIN_ERROR_LOG
WORKSPACE_EVENT_BUS --> DOMAIN_METRICS


%% =================================================
%% STYLES（樣式）
%% =================================================
classDef identity fill:#dbeafe,stroke:#93c5fd,color:#000;
classDef account fill:#dcfce7,stroke:#86efac,color:#000;
classDef organization fill:#fff7ed,stroke:#fdba74,color:#000;
classDef workspace fill:#ede9fe,stroke:#c4b5fd,color:#000;
classDef projection fill:#fef9c3,stroke:#fde047,color:#000;
classDef observability fill:#f3f4f6,stroke:#d1d5db,color:#000;
classDef trackA fill:#d1fae5,stroke:#6ee7b7,color:#000;
classDef trackB fill:#fee2e2,stroke:#fca5a5,color:#000;
classDef parsingIntent fill:#fef3c7,stroke:#fbbf24,color:#000;
classDef serverAction fill:#fed7aa,stroke:#fb923c,color:#000;
classDef skillTagPool fill:#e0e7ff,stroke:#818cf8,color:#000;
classDef accountSkill fill:#bbf7d0,stroke:#22c55e,color:#000;
classDef tierFunction fill:#fdf4ff,stroke:#c084fc,color:#000;
classDef skillProjection fill:#fefce8,stroke:#eab308,color:#000;

classDef userPersonalCenter fill:#f0fdf4,stroke:#4ade80,color:#000;
classDef subjectCenter fill:#fefce8,stroke:#facc15,color:#000;
classDef eventFunnel fill:#f5f3ff,stroke:#a78bfa,color:#000;
classDef fcmGateway fill:#fce7f3,stroke:#f9a8d4,color:#000;
classDef userDevice fill:#e0f2fe,stroke:#38bdf8,color:#000;
classDef sharedKernel fill:#ecfeff,stroke:#22d3ee,color:#000;
classDef talentRepository fill:#fff1f2,stroke:#fda4af,color:#000;

class IDENTITY_LAYER identity;
class ACCOUNT_AUTH identity;
class ACCOUNT_LAYER account;
class ORGANIZATION_LAYER organization;
class WORKSPACE_CONTAINER workspace;
class PROJECTION_LAYER projection;
class OBSERVABILITY_LAYER observability;
class SHARED_KERNEL sharedKernel;
class TRACK_A_TASKS,TRACK_A_QA,TRACK_A_ACCEPTANCE,TRACK_A_FINANCE trackA;
class TRACK_B_ISSUES trackB;
class PARSING_INTENT parsingIntent;
class SERVER_ACTION serverAction;
class SKILL_TAG_POOL skillTagPool;
class FCM_GATEWAY fcmGateway;
class USER_DEVICE userDevice;
class SUBJECT_CENTER subjectCenter;
class EVENT_FUNNEL_INPUT eventFunnel;
class ACCOUNT_USER_NOTIFICATION account;
class ACCOUNT_NOTIFICATION_ROUTER account;
class USER_PERSONAL_CENTER userPersonalCenter;
class WORKSPACE_SCOPE_READ_MODEL projection;
class ACCOUNT_SKILL_LAYER accountSkill;
class ACCOUNT_SKILL_AGGREGATE,ACCOUNT_SKILL_XP_LEDGER accountSkill;
class ORG_SKILL_RECOGNITION organization;
class SKILL_TIER_FUNCTION tierFunction;
class ACCOUNT_SKILL_VIEW,ORG_ELIGIBLE_MEMBER_VIEW skillProjection;
class SERVER_ACTION_SKILL serverAction;
class USER_WALLET_AGGREGATE accountSkill;
class CENTRALIZED_TAG_AGGREGATE sharedKernel;
class WORKFLOW_AGGREGATE workspace;
class WORKSPACE_AUDIT workspace;
class TALENT_REPOSITORY talentRepository;
