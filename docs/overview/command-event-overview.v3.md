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
%% WORKSPACE COMMAND & EVENT SYSTEM（工作區指令與事件系統）
%% =================================================

subgraph WORKSPACE_CONTAINER[Workspace Container（工作區容器）]

    subgraph WORKSPACE_APPLICATION[workspace-application（應用層）]
        WORKSPACE_COMMAND_HANDLER[workspace-application.command-handler（指令處理器）]
        WORKSPACE_SCOPE_GUARD[workspace-application.scope-guard（作用域守衛）]
        WORKSPACE_OUTBOX["workspace-application.outbox（交易內發信箱）"]
    end

    subgraph WORKSPACE_CORE[workspace-core（核心層）]
        WORKSPACE_AGGREGATE[workspace-core.aggregate（核心聚合實體）]
        WORKSPACE_EVENT_BUS[workspace-core.event-bus（事件總線）]
        WORKSPACE_EVENT_STORE["workspace-core.event-store（事件儲存，可選）"]
    end

end

%% =================================================
%% COMMAND & EVENT FLOW（指令與事件流程）
%% =================================================

WORKSPACE_COMMAND_HANDLER --> WORKSPACE_SCOPE_GUARD
WORKSPACE_SCOPE_GUARD --> WORKSPACE_AGGREGATE
WORKSPACE_AGGREGATE --> WORKSPACE_OUTBOX
WORKSPACE_AGGREGATE --> WORKSPACE_EVENT_STORE

WORKSPACE_OUTBOX --> WORKSPACE_EVENT_BUS

%% EVENT BRIDGE（事件橋接）
ORGANIZATION_EVENT_BUS --> WORKSPACE_SCOPE_GUARD

%% =================================================
%% STYLES（樣式）
%% =================================================
classDef organization fill:#fff7ed,stroke:#fdba74,color:#000;
classDef workspace fill:#ede9fe,stroke:#c4b5fd,color:#000;

class ORGANIZATION_LAYER organization;
class WORKSPACE_CONTAINER workspace;
