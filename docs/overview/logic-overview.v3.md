flowchart TD

%% =================================================
%% AUTHENTICATION + IDENTITY（身份驗證與識別）
%% =================================================

FIREBASE_AUTHENTICATION[Firebase Authentication（用戶驗證服務）]
ACCOUNT_AUTH[account.auth（登入／註冊／重設密碼）]

subgraph IDENTITY_LAYER[Identity Layer（身份層）]

    AUTHENTICATED_IDENTITY[authenticated-identity（已驗證身份）]
    ACCOUNT_IDENTITY_LINK["account-identity-link（firebaseUserId ↔ accountId 關聯）"]
    ACTIVE_ACCOUNT_CONTEXT["active-account-context（組織／工作區作用中帳號上下文）"]
    CUSTOM_CLAIMS[custom-claims（自訂權限宣告）]

end

FIREBASE_AUTHENTICATION --> ACCOUNT_AUTH
ACCOUNT_AUTH --> AUTHENTICATED_IDENTITY
AUTHENTICATED_IDENTITY --> ACCOUNT_IDENTITY_LINK
ACCOUNT_IDENTITY_LINK --> ACTIVE_ACCOUNT_CONTEXT
AUTHENTICATED_IDENTITY --> CUSTOM_CLAIMS


%% =================================================
%% ACCOUNT LAYER（帳號層）
%% =================================================

subgraph ACCOUNT_LAYER[Account Layer（帳號層）]

    USER_ACCOUNT[user-account（個人帳號）]
    USER_ACCOUNT_PROFILE["account-user.profile（使用者資料與設定）"]
    USER_ACCOUNT_WALLET["account-user.wallet（錢包：代幣／積分）"]

    ORGANIZATION_ACCOUNT[organization-account（組織帳號）]
    ORGANIZATION_ACCOUNT_SETTINGS[organization-account.settings（組織設定）]
    ORGANIZATION_ACCOUNT_AGGREGATE[organization-account.aggregate（組織帳號聚合實體）]

    subgraph ACCOUNT_GOVERNANCE[account-governance（帳號治理）]
        ACCOUNT_ROLE[account-governance.role（帳號角色）]
        ACCOUNT_POLICY[account-governance.policy（帳號政策）]
    end

end

ACCOUNT_IDENTITY_LINK --> USER_ACCOUNT
ACCOUNT_IDENTITY_LINK --> ORGANIZATION_ACCOUNT

USER_ACCOUNT --> USER_ACCOUNT_PROFILE
USER_ACCOUNT --> USER_ACCOUNT_WALLET

ORGANIZATION_ACCOUNT --> ORGANIZATION_ACCOUNT_SETTINGS
ORGANIZATION_ACCOUNT --> ORGANIZATION_ACCOUNT_AGGREGATE
ORGANIZATION_ACCOUNT --> ACCOUNT_GOVERNANCE


%% =================================================
%% ORGANIZATION LAYER（組織層）
%% =================================================

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

ORGANIZATION_ACCOUNT_AGGREGATE --> ORGANIZATION_ENTITY
ORGANIZATION_ENTITY --> ORGANIZATION_EVENT_BUS


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
        WORKSPACE_EVENT_STORE["workspace-core.event-store（事件儲存，可選）"]
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
ACTIVE_ACCOUNT_CONTEXT --> WORKSPACE_SCOPE_GUARD
CUSTOM_CLAIMS --> WORKSPACE_SCOPE_GUARD

WORKSPACE_SCOPE_GUARD --> WORKSPACE_POLICY_ENGINE
WORKSPACE_POLICY_ENGINE --> WORKSPACE_TRANSACTION_RUNNER

WORKSPACE_TRANSACTION_RUNNER --> WORKSPACE_AGGREGATE
WORKSPACE_AGGREGATE --> WORKSPACE_OUTBOX
WORKSPACE_AGGREGATE --> WORKSPACE_EVENT_STORE
WORKSPACE_TRANSACTION_RUNNER --> WORKSPACE_OUTBOX

WORKSPACE_OUTBOX --> WORKSPACE_EVENT_BUS


%% =================================================
%% EVENT BRIDGE（事件橋接）
%% =================================================

ORGANIZATION_EVENT_BUS --> WORKSPACE_SCOPE_GUARD
ORGANIZATION_EVENT_BUS --> ORGANIZATION_SCHEDULE
WORKSPACE_OUTBOX -->|ScheduleProposed（跨層事件）| ORGANIZATION_SCHEDULE
W_B_SCHEDULE -.->|根據標籤過濾可用帳號（跨層讀取）| SKILL_TAG_POOL


%% =================================================
%% PROJECTION LAYER（投影層）
%% =================================================

subgraph PROJECTION_LAYER[Projection Layer（資料投影層）]

    PROJECTION_VERSION[projection.version（版本追蹤）]
    READ_MODEL_REGISTRY[projection.read-model-registry（讀取模型註冊表）]

    WORKSPACE_PROJECTION_VIEW[projection.workspace-view（工作區投影視圖）]
    ACCOUNT_PROJECTION_VIEW[projection.account-view（帳號投影視圖）]
    ACCOUNT_PROJECTION_AUDIT[projection.account-audit（帳號稽核投影）]
    ACCOUNT_PROJECTION_SCHEDULE[projection.account-schedule（帳號排程投影）]
    ORGANIZATION_PROJECTION_VIEW[projection.organization-view（組織投影視圖）]

end

WORKSPACE_EVENT_BUS --> WORKSPACE_PROJECTION_VIEW
WORKSPACE_EVENT_BUS --> ACCOUNT_PROJECTION_VIEW
WORKSPACE_EVENT_BUS --> ACCOUNT_PROJECTION_AUDIT
WORKSPACE_EVENT_BUS --> ACCOUNT_PROJECTION_SCHEDULE
WORKSPACE_EVENT_BUS --> ORGANIZATION_PROJECTION_VIEW

ORGANIZATION_EVENT_BUS --> ORGANIZATION_PROJECTION_VIEW

PROJECTION_VERSION --> READ_MODEL_REGISTRY


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

class IDENTITY_LAYER identity;
class ACCOUNT_AUTH identity;
class ACCOUNT_LAYER account;
class ORGANIZATION_LAYER organization;
class WORKSPACE_CONTAINER workspace;
class PROJECTION_LAYER projection;
class OBSERVABILITY_LAYER observability;
class TRACK_A_TASKS,TRACK_A_QA,TRACK_A_ACCEPTANCE,TRACK_A_FINANCE trackA;
class TRACK_B_ISSUES trackB;
class PARSING_INTENT parsingIntent;
class SERVER_ACTION serverAction;
class SKILL_TAG_POOL skillTagPool;
