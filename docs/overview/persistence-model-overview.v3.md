flowchart TD

%% =================================================
%% ORGANIZATION EVENT BUS（組織事件總線）
%% =================================================

subgraph ORGANIZATION_LAYER[Organization Layer（組織層）]
    subgraph ORGANIZATION_CORE[organization-core（組織核心）]
        ORGANIZATION_EVENT_BUS[organization-core.event-bus（組織事件總線）]
    end
end

%% =================================================
%% WORKSPACE WRITE MODEL（工作區寫入模型）
%% =================================================

subgraph WORKSPACE_CONTAINER[Workspace Container（工作區容器）]

    subgraph WORKSPACE_APPLICATION[workspace-application（應用層）]
        WORKSPACE_OUTBOX["workspace-application.outbox（交易內發信箱）"]
    end

    subgraph WORKSPACE_CORE[workspace-core（核心層）]
        WORKSPACE_AGGREGATE[workspace-core.aggregate（核心聚合實體）]
        WORKSPACE_EVENT_BUS[workspace-core.event-bus（事件總線）]
        WORKSPACE_EVENT_STORE["workspace-core.event-store（事件儲存，可選）"]
    end

end

%% =================================================
%% PROJECTION LAYER（投影層）
%% =================================================

subgraph PROJECTION_LAYER[Projection Layer（資料投影層）]

    EVENT_FUNNEL_INPUT[["事件漏斗（Event Funnel · 統一入口）"]]

    PROJECTION_VERSION[projection.version（版本追蹤）]
    READ_MODEL_REGISTRY[projection.read-model-registry（讀取模型註冊表）]

    WORKSPACE_PROJECTION_VIEW[projection.workspace-view（工作區投影視圖）]
    WORKSPACE_SCOPE_READ_MODEL[projection.workspace-scope-guard-view（Scope Guard 讀模型）]
    ACCOUNT_PROJECTION_VIEW[projection.account-view（帳號投影視圖）]
    ACCOUNT_PROJECTION_AUDIT[projection.account-audit（帳號稽核投影）]
    ACCOUNT_PROJECTION_SCHEDULE[projection.account-schedule（帳號排程投影）]
    ORGANIZATION_PROJECTION_VIEW[projection.organization-view（組織投影視圖）]

end

%% =================================================
%% PERSISTENCE FLOW（持久化流程）
%% =================================================

WORKSPACE_AGGREGATE --> WORKSPACE_EVENT_STORE
WORKSPACE_AGGREGATE --> WORKSPACE_OUTBOX

WORKSPACE_OUTBOX --> WORKSPACE_EVENT_BUS

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

PROJECTION_VERSION --> READ_MODEL_REGISTRY

%% =================================================
%% STYLES（樣式）
%% =================================================
classDef organization fill:#fff7ed,stroke:#fdba74,color:#000;
classDef workspace fill:#ede9fe,stroke:#c4b5fd,color:#000;
classDef projection fill:#fef9c3,stroke:#fde047,color:#000;
classDef eventFunnel fill:#f5f3ff,stroke:#a78bfa,color:#000;

class ORGANIZATION_LAYER organization;
class WORKSPACE_CONTAINER workspace;
class PROJECTION_LAYER projection;
class EVENT_FUNNEL_INPUT eventFunnel;
