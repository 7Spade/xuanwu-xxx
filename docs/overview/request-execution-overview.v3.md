flowchart TD

%% =================================================
%% IDENTITY CONTEXT（身份上下文）
%% =================================================

subgraph IDENTITY_LAYER[Identity Layer（身份層）]
    ACTIVE_ACCOUNT_CONTEXT["active-account-context（組織／工作區作用中帳號上下文）"]
    CUSTOM_CLAIMS[custom-claims（自訂權限宣告）]
end

%% =================================================
%% WORKSPACE APPLICATION（工作區應用層）
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
        WORKSPACE_AGGREGATE[workspace-core.aggregate（核心聚合實體）]
        WORKSPACE_EVENT_BUS[workspace-core.event-bus（事件總線）]
    end

    subgraph WORKSPACE_BUSINESS[workspace-business（業務層）]
        WORKSPACE_BUSINESS_ACCEPTANCE[workspace-business.acceptance（業務受理）]
        WORKSPACE_BUSINESS_DAILY[workspace-business.daily（日常作業）]
        WORKSPACE_BUSINESS_DOCUMENT_PARSER[workspace-business.document-parser（文件解析）]
        WORKSPACE_BUSINESS_FILES[workspace-business.files（檔案管理）]
        WORKSPACE_BUSINESS_FINANCE[workspace-business.finance（財務處理）]
        WORKSPACE_BUSINESS_ISSUES[workspace-business.issues（問題追蹤）]
        WORKSPACE_BUSINESS_QUALITY_ASSURANCE[workspace-business.quality-assurance（品質保證）]
        WORKSPACE_BUSINESS_TASKS[workspace-business.tasks（任務管理）]
        WORKSPACE_BUSINESS_SCHEDULE["workspace-business.schedule（排程管理 · 提案 · 決策）"]

end

%% =================================================
%% OBSERVABILITY（可觀測性）
%% =================================================

subgraph OBSERVABILITY_LAYER[Observability Layer（可觀測性層）]
    TRACE_IDENTIFIER["trace-identifier / correlation-identifier（追蹤／關聯識別碼）"]
    DOMAIN_METRICS[domain-metrics（領域指標）]
    DOMAIN_ERROR_LOG[domain-error-log（領域錯誤日誌）]
end

%% =================================================
%% REQUEST EXECUTION FLOW（請求執行流程）
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
WORKSPACE_TRANSACTION_RUNNER --> WORKSPACE_OUTBOX

WORKSPACE_OUTBOX --> WORKSPACE_EVENT_BUS

WORKSPACE_COMMAND_HANDLER --> TRACE_IDENTIFIER
WORKSPACE_TRANSACTION_RUNNER --> TRACE_IDENTIFIER
WORKSPACE_EVENT_BUS --> TRACE_IDENTIFIER

WORKSPACE_TRANSACTION_RUNNER --> DOMAIN_ERROR_LOG
WORKSPACE_EVENT_BUS --> DOMAIN_METRICS

%% =================================================
%% STYLES（樣式）
%% =================================================
classDef identity fill:#dbeafe,stroke:#93c5fd,color:#000;
classDef workspace fill:#ede9fe,stroke:#c4b5fd,color:#000;
classDef observability fill:#f3f4f6,stroke:#d1d5db,color:#000;
classDef serverAction fill:#fed7aa,stroke:#fb923c,color:#000;

class IDENTITY_LAYER identity;
class WORKSPACE_CONTAINER workspace;
class OBSERVABILITY_LAYER observability;
class SERVER_ACTION serverAction;
