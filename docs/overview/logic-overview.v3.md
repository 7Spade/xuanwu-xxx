flowchart TD

%% 身份驗證
FIREBASE_AUTH[Firebase Authentication]
ACCOUNT_AUTH[account.auth]

subgraph IDENTITY[Identity Layer]
    AUTHED_ID[authenticated-identity]
    ID_LINK["account-identity-link（firebaseUserId ↔ accountId）"]
    ACTIVE_CTX[active-account-context]
    CLAIMS[custom-claims]
end

FIREBASE_AUTH --> ACCOUNT_AUTH
ACCOUNT_AUTH --> AUTHED_ID
AUTHED_ID --> ID_LINK
ID_LINK --> ACTIVE_CTX
AUTHED_ID --> CLAIMS


%% 帳號層（Account Layer）
subgraph ACCOUNT[Account Layer]

    USER_ACCOUNT[user-account]
    USER_PROFILE[account-user.profile]
    USER_WALLET[account-user.wallet]
    USER_NOTIF[account-user.notification]

    ORG_ACCOUNT[organization-account]
    ORG_SETTINGS[organization-account.settings]
    ORG_AGG[organization-account.aggregate]

    subgraph ACC_GOV[account-governance]
        ACC_ROLE[account-governance.role]
        ACC_POLICY[account-governance.policy]
        NOTIF_ROUTER[account-governance.notification-router]
    end

end

ID_LINK --> USER_ACCOUNT
ID_LINK --> ORG_ACCOUNT
USER_ACCOUNT --> USER_PROFILE
USER_ACCOUNT --> USER_WALLET
ORG_ACCOUNT --> ORG_SETTINGS
ORG_ACCOUNT --> ORG_AGG
ORG_ACCOUNT --> ACC_GOV


%% 組織層（Organization Layer）
subgraph ORG[Organization Layer]

    subgraph ORG_CORE[organization-core]
        ORG_ENTITY[organization-core.aggregate]
        ORG_BUS[organization-core.event-bus]
    end

    subgraph ORG_GOV[organization-governance]
        ORG_MEMBER[organization-governance.member]
        ORG_TEAM[organization-governance.team]
        ORG_PARTNER[organization-governance.partner]
        ORG_POLICY[organization-governance.policy]
        SKILL_POOL[(職能標籤庫)]
    end

    ORG_SCHEDULE[organization.schedule]

end

ORG_AGG --> ORG_ENTITY
ORG_ENTITY --> ORG_BUS


%% 工作區容器（Workspace Container）
subgraph WS[Workspace Container]

    subgraph WS_APP[workspace-application]
        WS_CMD[workspace-application.command-handler]
        WS_GUARD[workspace-application.scope-guard]
        WS_POLICY[workspace-application.policy-engine]
        WS_RUNNER[workspace-application.transaction-runner]
        WS_OUTBOX["workspace-application.outbox（交易內）"]
    end

    subgraph WS_CORE[workspace-core]
        WS_SETTINGS[workspace-core.settings]
        WS_AGG[workspace-core.aggregate]
        WS_BUS[workspace-core.event-bus]
        WS_STORE["workspace-core.event-store（可選）"]
    end

    subgraph WS_GOV[workspace-governance]
        WS_MEMBER[workspace-governance.member]
        WS_ROLE[workspace-governance.role]
    end

    %% AB 雙軌業務邏輯
    subgraph WS_BIZ[workspace-business]
        direction TB

        W_FILES[workspace-business.files]
        W_PARSER[workspace-business.document-parser]
        PARSE_INTENT[("ParsingIntent（Digital Twin）")]
        W_DAILY[workspace-business.daily]
        W_SCHED[workspace-business.schedule]

        %% A 軌：主流程
        A_TASKS[workspace-business.tasks]
        A_QA[workspace-business.quality-assurance]
        A_ACCEPT[workspace-business.acceptance]
        A_FIN[workspace-business.finance]

        %% B 軌：異常追蹤
        B_ISSUES{{workspace-business.issues}}

        W_FILES -.->|原始檔案| W_PARSER
        W_PARSER -->|解析產出| PARSE_INTENT
        PARSE_INTENT -->|任務批次| A_TASKS
        PARSE_INTENT -->|財務指令| A_FIN
        PARSE_INTENT -->|解析異常| B_ISSUES
        A_TASKS -.->|SourcePointer| PARSE_INTENT
        PARSE_INTENT -.->|版本差異| A_TASKS

        A_TASKS -->|異常| B_ISSUES
        A_TASKS -->|正常| A_QA
        A_QA -->|異常| B_ISSUES
        A_QA -->|正常| A_ACCEPT
        A_ACCEPT -->|異常| B_ISSUES
        A_ACCEPT -->|正常| A_FIN
        A_FIN -->|異常| B_ISSUES

        A_TASKS -.-> W_DAILY
        A_TASKS -.->|任務分配| W_SCHED
        PARSE_INTENT -.->|職能需求| W_SCHED
    end

    %% B 軌 IssueResolved → A 軌自行訂閱恢復
    B_ISSUES -->|IssueResolved| WS_BUS

end

ORG_ENTITY --> WS


%% 請求流程（Request Flow）
SERVER_ACTION["_actions.ts（Server Action）"]
SERVER_ACTION -->|Command| WS_CMD
WS_CMD --> WS_GUARD
ACTIVE_CTX --> WS_GUARD
CLAIMS --> WS_GUARD
WS_GUARD --> WS_POLICY
WS_POLICY --> WS_RUNNER
WS_RUNNER -.->|業務邏輯| WS_BIZ
WS_RUNNER --> WS_AGG
WS_AGG --> WS_OUTBOX
WS_AGG --> WS_STORE
WS_RUNNER --> WS_OUTBOX
WS_OUTBOX --> WS_BUS


%% 事件橋接（Event Bridge）
ORG_BUS --> WS_GUARD
ORG_BUS --> ORG_SCHEDULE
WS_OUTBOX -->|ScheduleProposed| ORG_SCHEDULE

%% 職能標籤庫：扁平化資源池，Team/Partner 為同一池的組視圖
ORG_MEMBER -.->|內部帳號| SKILL_POOL
ORG_PARTNER -.->|外部帳號| SKILL_POOL
ORG_TEAM -.->|聚合視圖（內部組）| SKILL_POOL
W_SCHED -.->|標籤過濾| SKILL_POOL


%% 投影層（Projection Layer）
subgraph PROJ[Projection Layer]

    FUNNEL[["事件漏斗（Event Funnel）"]]
    PROJ_VER[projection.version]
    PROJ_REG[projection.read-model-registry]
    PROJ_WS[projection.workspace-view]
    PROJ_ACC[projection.account-view]
    PROJ_AUDIT[projection.account-audit]
    PROJ_SCHED[projection.account-schedule]
    PROJ_ORG[projection.organization-view]

end

WS_BUS -->|業務事件| FUNNEL
ORG_BUS -->|組織事件| FUNNEL
FUNNEL --> PROJ_WS
FUNNEL --> PROJ_ACC
FUNNEL --> PROJ_AUDIT
FUNNEL --> PROJ_SCHED
FUNNEL --> PROJ_ORG
PROJ_VER --> PROJ_REG


%% FCM 三層通知
%% 層一（觸發）：ORG_SCHEDULE 宣告事實，不關心誰收通知
%% 層二（路由）：NOTIF_ROUTER 依 TargetAccountID 分發
%% 層三（交付）：USER_NOTIF 依帳號標籤過濾後推播
FCM[["Firebase Cloud Messaging"]]
DEVICE[使用者裝置]

ORG_SCHEDULE -->|ScheduleAssigned| ORG_BUS
ORG_BUS -->|ScheduleAssigned（含 TargetAccountID）| NOTIF_ROUTER
NOTIF_ROUTER -->|路由至目標帳號| USER_NOTIF
USER_PROFILE -.->|FCM Token| USER_NOTIF
USER_NOTIF -.->|內外部標籤過濾| SKILL_POOL
USER_NOTIF --> FCM
FCM -.->|推播| DEVICE
USER_NOTIF -.->|投影| PROJ_ACC


%% 可觀測性（Observability）
subgraph OBS[Observability Layer]
    TRACE["trace-identifier / correlation-identifier"]
    METRICS[domain-metrics]
    ERR_LOG[domain-error-log]
end

WS_CMD --> TRACE
WS_RUNNER --> TRACE
WS_BUS --> TRACE
WS_RUNNER --> ERR_LOG
WS_BUS --> METRICS


%% 樣式
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
classDef fcmGateway fill:#fce7f3,stroke:#f9a8d4,color:#000;
classDef userDevice fill:#e0f2fe,stroke:#38bdf8,color:#000;
classDef eventFunnel fill:#f5f3ff,stroke:#a78bfa,color:#000;

class IDENTITY identity;
class ACCOUNT_AUTH identity;
class ACCOUNT,ACC_GOV account;
class USER_NOTIF,NOTIF_ROUTER account;
class ORG,ORG_CORE,ORG_GOV organization;
class WS,WS_APP,WS_CORE,WS_GOV workspace;
class PROJ projection;
class OBS observability;
class A_TASKS,A_QA,A_ACCEPT,A_FIN trackA;
class B_ISSUES trackB;
class PARSE_INTENT parsingIntent;
class SERVER_ACTION serverAction;
class SKILL_POOL skillTagPool;
class FUNNEL eventFunnel;
class FCM fcmGateway;
class DEVICE userDevice;
