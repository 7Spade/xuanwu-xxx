flowchart TD

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
%% =================================================

%% =================================================
%% AUTHENTICATION + IDENTITY（身份驗證與識別）
%% =================================================

FIREBASE_AUTHENTICATION[Firebase Authentication（用戶驗證服務）]
ACCOUNT_AUTH[account.auth（登入／註冊／重設密碼）]

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
%% SUBJECT CENTER（主體中心）
%% 包含 Account Layer 與 Organization Layer
%% 兩者共用 ACCOUNT_IDENTITY_LINK 身份根，同屬「主體」邊界（Who）
%% Workspace Container = 「做什麼（What）」，在主體中心之外
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
        USER_ACCOUNT_WALLET["account-user.wallet（錢包：代幣／積分）"]
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

end

ACCOUNT_IDENTITY_LINK --> USER_ACCOUNT
ACCOUNT_IDENTITY_LINK --> ORGANIZATION_ACCOUNT

USER_ACCOUNT --> USER_ACCOUNT_PROFILE
USER_ACCOUNT --> USER_ACCOUNT_WALLET

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
        ORGANIZATION_MEMBER[organization-governance.member（組織成員）]
        ORGANIZATION_TEAM["organization-governance.team（團隊管理 · 內部組視圖）"]
        ORGANIZATION_PARTNER["organization-governance.partner（合作夥伴 · 外部組視圖）"]
        ORGANIZATION_POLICY[organization-governance.policy（政策管理）]
        SKILL_TAG_POOL[(職能標籤庫（Skills / Certs）)]
    end

    ORGANIZATION_SCHEDULE["organization.schedule（人力排程管理）"]

end

%% end SUBJECT_CENTER
end

ORGANIZATION_ACCOUNT_BINDING --> ORGANIZATION_ENTITY
ORGANIZATION_ENTITY --> ORGANIZATION_EVENT_BUS


%% =================================================
%% WORKSPACE CONTAINER（工作區容器）
%% =================================================

subgraph WORKSPACE_CONTAINER[Workspace Container（工作區容器）]

    subgraph WORKSPACE_APPLICATION[workspace-application（應用層）]
        WORKSPACE_COMMAND_HANDLER[workspace-application.command-handler（指令處理器）]
        WORKSPACE_SCOPE_GUARD[workspace-application.scope-guard（作用域守衛）]
        WORKSPACE_POLICY_ENGINE[workspace-application.policy-engine（政策引擎）]
        WORKSPACE_ORG_POLICY_CACHE["workspace-application.org-policy-cache（組織政策本地快取）"]
        WORKSPACE_TRANSACTION_RUNNER[workspace-application.transaction-runner（交易執行器）]
        WORKSPACE_OUTBOX["workspace-application.outbox（交易內發信箱）"]
    end

    subgraph WORKSPACE_CORE[workspace-core（核心層）]
        WORKSPACE_SETTINGS[workspace-core.settings（工作區設定）]
        WORKSPACE_AGGREGATE[workspace-core.aggregate（核心聚合實體）]
        WORKSPACE_EVENT_BUS[workspace-core.event-bus（事件總線）]
        WORKSPACE_EVENT_STORE["workspace-core.event-store（事件儲存，僅供重播／稽核）"]
    end

    subgraph WORKSPACE_GOVERNANCE[workspace-governance（工作區治理）]
        WORKSPACE_MEMBER[workspace-governance.member（工作區成員）]
        WORKSPACE_ROLE[workspace-governance.role（角色管理）]
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

        %% A 軌：主流程
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
        PARSING_INTENT -.->|版本差異比對提議| TRACK_A_TASKS

        %% A 軌流轉與異常判定（AB 雙軌交互）
        TRACK_A_TASKS -->|異常| TRACK_B_ISSUES
        TRACK_A_TASKS -->|正常順位| TRACK_A_QA

        TRACK_A_QA -->|異常| TRACK_B_ISSUES
        TRACK_A_QA -->|正常順位| TRACK_A_ACCEPTANCE

        TRACK_A_ACCEPTANCE -->|異常| TRACK_B_ISSUES
        TRACK_A_ACCEPTANCE -->|正常順位| TRACK_A_FINANCE

        TRACK_A_FINANCE -->|異常| TRACK_B_ISSUES

        %% B 軌解鎖：統一發送 IssueResolved 事件，A 軌自行訂閱後恢復（不直接回流）

        %% 日誌與排程關聯
        TRACK_A_TASKS -.-> W_B_DAILY
        TRACK_A_TASKS -.->|任務分配／時間變動觸發| W_B_SCHEDULE
        PARSING_INTENT -.->|提取職能需求標籤| W_B_SCHEDULE

    end

    %% B 軌 IssueResolved 事件（A 軌訂閱後自行恢復進度）
    TRACK_B_ISSUES -->|IssueResolved 事件| WORKSPACE_EVENT_BUS

end

ORGANIZATION_ENTITY --> WORKSPACE_CONTAINER


%% =================================================
%% 職能標籤庫 — 扁平化資源池（Team/Partner 為組視圖）
%% 所有帳號（內部/外部）統一擁有職能標籤；Team/Partner 為同一資源池的「組視圖」
%% =================================================
ORGANIZATION_MEMBER -.->|內部帳號擁有標籤| SKILL_TAG_POOL
ORGANIZATION_PARTNER -.->|外部帳號擁有標籤| SKILL_TAG_POOL
ORGANIZATION_TEAM -.->|組內帳號標籤聚合視圖（內部組）| SKILL_TAG_POOL


%% =================================================
%% REQUEST FLOW（請求流程）
%% =================================================

SERVER_ACTION["_actions.ts（Server Action — 業務觸發入口）"]
SERVER_ACTION -->|發送 Command| WORKSPACE_COMMAND_HANDLER
WORKSPACE_TRANSACTION_RUNNER -.->|執行業務領域邏輯| WORKSPACE_BUSINESS

WORKSPACE_COMMAND_HANDLER --> WORKSPACE_SCOPE_GUARD
ACTIVE_ACCOUNT_CONTEXT -->|查詢鍵| WORKSPACE_SCOPE_READ_MODEL
WORKSPACE_SCOPE_READ_MODEL --> WORKSPACE_SCOPE_GUARD

WORKSPACE_SCOPE_GUARD --> WORKSPACE_POLICY_ENGINE
WORKSPACE_POLICY_ENGINE --> WORKSPACE_TRANSACTION_RUNNER

WORKSPACE_TRANSACTION_RUNNER --> WORKSPACE_AGGREGATE
WORKSPACE_AGGREGATE --> WORKSPACE_EVENT_STORE
WORKSPACE_TRANSACTION_RUNNER -->|彙整 Aggregate 未提交事件後寫入| WORKSPACE_OUTBOX

WORKSPACE_OUTBOX --> WORKSPACE_EVENT_BUS


%% =================================================
%% EVENT BRIDGE（事件橋接）
%% =================================================

ORGANIZATION_EVENT_BUS --> ORGANIZATION_SCHEDULE
ORGANIZATION_EVENT_BUS -->|政策變更事件| WORKSPACE_ORG_POLICY_CACHE
WORKSPACE_ORG_POLICY_CACHE -->|更新本地 read model| WORKSPACE_SCOPE_READ_MODEL
WORKSPACE_OUTBOX -->|ScheduleProposed（跨層事件）| ORGANIZATION_SCHEDULE
W_B_SCHEDULE -.->|根據排程投影過濾可用帳號| ACCOUNT_PROJECTION_SCHEDULE


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

end

%% 漏斗模式：2 個事件源 → 統一入口 → 內部路由至各投影視圖
WORKSPACE_EVENT_BUS -->|所有業務事件| EVENT_FUNNEL_INPUT
ORGANIZATION_EVENT_BUS -->|所有組織事件| EVENT_FUNNEL_INPUT

%% 漏斗內部路由（EVENT_FUNNEL_INPUT 為 PROJECTION_LAYER 唯一外部入口）
EVENT_FUNNEL_INPUT --> WORKSPACE_PROJECTION_VIEW
EVENT_FUNNEL_INPUT --> WORKSPACE_SCOPE_READ_MODEL
EVENT_FUNNEL_INPUT --> ACCOUNT_PROJECTION_VIEW
EVENT_FUNNEL_INPUT --> ACCOUNT_PROJECTION_AUDIT
EVENT_FUNNEL_INPUT --> ACCOUNT_PROJECTION_SCHEDULE
EVENT_FUNNEL_INPUT --> ORGANIZATION_PROJECTION_VIEW

EVENT_FUNNEL_INPUT -->|更新事件串流偏移量（stream offset）| PROJECTION_VERSION
PROJECTION_VERSION -->|提供 read-model 對應版本| READ_MODEL_REGISTRY
WORKSPACE_EVENT_STORE -.->|事件重播可完整重建 Projection| EVENT_FUNNEL_INPUT


%% =================================================
%% SHARED KERNEL（共享核心，需顯式標示）
%% =================================================
%% Shared Kernel 區塊的虛線表示「契約遵循（implements contract）」而非跨 BC 讀寫依賴
subgraph SHARED_KERNEL[Shared Kernel（跨 BC 顯式共享契約）]
    SK_EVENT_ENVELOPE["shared-kernel.event-envelope（事件信封契約）"]
    SK_AUTHORITY_SNAPSHOT["shared-kernel.authority-snapshot（權限快照契約）"]
end

WORKSPACE_EVENT_BUS -.->|事件契約遵循| SK_EVENT_ENVELOPE
ORGANIZATION_EVENT_BUS -.->|事件契約遵循| SK_EVENT_ENVELOPE
WORKSPACE_SCOPE_READ_MODEL -.->|快照契約遵循| SK_AUTHORITY_SNAPSHOT
ACCOUNT_PROJECTION_VIEW -.->|快照契約遵循| SK_AUTHORITY_SNAPSHOT


%% =================================================
%% FCM NOTIFICATION — 三層通知架構
%% 層一（觸發）：ORGANIZATION_SCHEDULE 宣告事實（ScheduleAssigned），不關心誰要收通知
%% 層二（路由）：ACCOUNT_NOTIFICATION_ROUTER 依 TargetAccountID 分發至目標帳號
%% 層三（交付）：ACCOUNT_USER_NOTIFICATION 依 internal/external 標籤過濾敏感內容後推播
%% FCM Token 儲存於 account-user.profile；通知切片只讀取不寫入 profile
%% =================================================

FCM_GATEWAY[["Firebase Cloud Messaging（推播閘道）"]]
USER_DEVICE[使用者裝置（手機／瀏覽器）]

%% 層一：觸發層 — 宣告事實（不關心誰要收通知）
ORGANIZATION_SCHEDULE -->|ScheduleAssigned 事件| ORGANIZATION_EVENT_BUS

%% 層二：路由層 — 依 TargetAccountID 分發至對應帳號
ORGANIZATION_EVENT_BUS -->|ScheduleAssigned（含 TargetAccountID）| ACCOUNT_NOTIFICATION_ROUTER
ACCOUNT_NOTIFICATION_ROUTER -->|路由至目標帳號（TargetAccountID 匹配）| ACCOUNT_USER_NOTIFICATION

%% 層三：交付層 — 依帳號標籤過濾內容後推播
USER_ACCOUNT_PROFILE -.->|提供 FCM Token（唯讀查詢）| ACCOUNT_USER_NOTIFICATION
ACCOUNT_USER_NOTIFICATION -.->|依帳號標籤快照過濾內容（internal/external）| ACCOUNT_PROJECTION_VIEW
ACCOUNT_USER_NOTIFICATION --> FCM_GATEWAY
FCM_GATEWAY -.->|推播通知| USER_DEVICE

%% 通知投影至個人中心（account-user.profile / account-user.notification 共享帳號文件集合，邏輯分離但 DB 同源）
ACCOUNT_USER_NOTIFICATION -.->|通知投影至個人中心| ACCOUNT_PROJECTION_VIEW


%% =================================================
%% OBSERVABILITY（可觀測性）
%% =================================================

subgraph OBSERVABILITY_LAYER[Observability Layer（可觀測性層）]
    TRACE_IDENTIFIER["trace-identifier / correlation-identifier（追蹤／關聯識別碼）"]
    DOMAIN_METRICS[domain-metrics（領域指標）]
    DOMAIN_ERROR_LOG[domain-error-log（領域錯誤日誌）]
end

WORKSPACE_COMMAND_HANDLER --> TRACE_IDENTIFIER
WORKSPACE_TRANSACTION_RUNNER --> TRACE_IDENTIFIER
WORKSPACE_EVENT_BUS --> TRACE_IDENTIFIER

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

classDef userPersonalCenter fill:#f0fdf4,stroke:#4ade80,color:#000;
classDef subjectCenter fill:#fefce8,stroke:#facc15,color:#000;
classDef eventFunnel fill:#f5f3ff,stroke:#a78bfa,color:#000;
classDef fcmGateway fill:#fce7f3,stroke:#f9a8d4,color:#000;
classDef userDevice fill:#e0f2fe,stroke:#38bdf8,color:#000;
classDef sharedKernel fill:#ecfeff,stroke:#22d3ee,color:#000;

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
class WORKSPACE_ORG_POLICY_CACHE workspace;
class WORKSPACE_SCOPE_READ_MODEL projection;
