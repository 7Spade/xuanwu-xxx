flowchart TD

%% =================================================
%% AUTHENTICATION + IDENTITY
%% =================================================

FIREBASE_AUTHENTICATION[Firebase Authentication]

subgraph IDENTITY_LAYER[Identity Layer]

    AUTHENTICATED_IDENTITY[authenticated-identity]
    ACCOUNT_IDENTITY_LINK["account-identity-link (firebaseUserId ↔ accountId)"]
    ACTIVE_ACCOUNT_CONTEXT["active-account-context (organization / workspace)"]
    CUSTOM_CLAIMS[custom-claims]

end

FIREBASE_AUTHENTICATION --> AUTHENTICATED_IDENTITY
AUTHENTICATED_IDENTITY --> ACCOUNT_IDENTITY_LINK
ACCOUNT_IDENTITY_LINK --> ACTIVE_ACCOUNT_CONTEXT
AUTHENTICATED_IDENTITY --> CUSTOM_CLAIMS


%% =================================================
%% ACCOUNT LAYER
%% =================================================

subgraph ACCOUNT_LAYER[Account Layer]

    USER_ACCOUNT[user-account]
    USER_ACCOUNT_PROFILE[user-account.profile]
    USER_ACCOUNT_SETTINGS[user-account.settings]
    USER_ACCOUNT_WALLET["user-account.wallet (coin / token)"]

    ORGANIZATION_ACCOUNT[organization-account]
    ORGANIZATION_ACCOUNT_SETTINGS[organization-account.settings]

    subgraph ACCOUNT_GOVERNANCE[account-governance]
        ACCOUNT_ROLE[account-governance.role]
        ACCOUNT_POLICY[account-governance.policy]
        ACCOUNT_AUDIT_LOG[account-governance.audit-log]
    end

end

ACCOUNT_IDENTITY_LINK --> USER_ACCOUNT
ACCOUNT_IDENTITY_LINK --> ORGANIZATION_ACCOUNT

USER_ACCOUNT --> USER_ACCOUNT_PROFILE
USER_ACCOUNT --> USER_ACCOUNT_SETTINGS
USER_ACCOUNT --> USER_ACCOUNT_WALLET

ORGANIZATION_ACCOUNT --> ORGANIZATION_ACCOUNT_SETTINGS
ORGANIZATION_ACCOUNT --> ACCOUNT_GOVERNANCE


%% =================================================
%% ORGANIZATION LAYER
%% =================================================

subgraph ORGANIZATION_LAYER[Organization Layer]

    subgraph ORGANIZATION_CORE[organization-core]
        ORGANIZATION_ENTITY[organization-core.aggregate]
        ORGANIZATION_EVENT_BUS[organization-core.event-bus]
    end

    subgraph ORGANIZATION_GOVERNANCE[organization-governance]
        ORGANIZATION_MEMBER[organization-governance.member]
        ORGANIZATION_TEAM[organization-governance.team]
        ORGANIZATION_PARTNER[organization-governance.partner]
        ORGANIZATION_POLICY[organization-governance.policy]
        ORGANIZATION_AUDIT_LOG[organization-governance.audit-log]
    end

    ORGANIZATION_SCHEDULE["organization.schedule (human-resource scheduling)"]

end

ORGANIZATION_ACCOUNT --> ORGANIZATION_ENTITY
ORGANIZATION_ENTITY --> ORGANIZATION_EVENT_BUS


%% =================================================
%% WORKSPACE CONTAINER
%% =================================================

subgraph WORKSPACE_CONTAINER[Workspace Container]

    WORKSPACE_SETTINGS[workspace.settings]

    subgraph WORKSPACE_APPLICATION[workspace-application]
        WORKSPACE_COMMAND_HANDLER[workspace-application.command-handler]
        WORKSPACE_SCOPE_GUARD[workspace-application.scope-guard]
        WORKSPACE_POLICY_ENGINE[workspace-application.policy-engine]
        WORKSPACE_TRANSACTION_RUNNER[workspace-application.transaction-runner]
        WORKSPACE_OUTBOX["workspace-application.outbox (within transaction)"]
    end

    subgraph WORKSPACE_CORE[workspace-core]
        WORKSPACE_AGGREGATE[workspace-core.aggregate]
        WORKSPACE_EVENT_BUS[workspace-core.event-bus]
        WORKSPACE_EVENT_STORE["workspace-core.event-store (optional)"]
    end

    subgraph WORKSPACE_GOVERNANCE[workspace-governance]
        WORKSPACE_MEMBER[workspace-governance.member]
        WORKSPACE_ROLE[workspace-governance.role]
    end

    subgraph WORKSPACE_BUSINESS[workspace-business]
        WORKSPACE_BUSINESS_ACCEPTANCE[workspace-business.acceptance]
        WORKSPACE_BUSINESS_DAILY[workspace-business.daily]
        WORKSPACE_BUSINESS_DOCUMENT_PARSER[workspace-business.document-parser]
        WORKSPACE_BUSINESS_FILES[workspace-business.files]
        WORKSPACE_BUSINESS_FINANCE[workspace-business.finance]
        WORKSPACE_BUSINESS_ISSUES[workspace-business.issues]
        WORKSPACE_BUSINESS_QUALITY_ASSURANCE[workspace-business.quality-assurance]
        WORKSPACE_BUSINESS_TASKS[workspace-business.tasks]
        WORKSPACE_BUSINESS_SCHEDULE["workspace-business.schedule (task generation)"]
        WORKSPACE_BUSINESS_AUDIT_LOG[workspace-business.audit-log]
    end

end

ORGANIZATION_ENTITY --> WORKSPACE_CONTAINER
WORKSPACE_CONTAINER --> WORKSPACE_SETTINGS


%% =================================================
%% CORRECT REQUEST FLOW
%% =================================================

WORKSPACE_BUSINESS --> WORKSPACE_COMMAND_HANDLER

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

WORKSPACE_BUSINESS_SCHEDULE --> ORGANIZATION_SCHEDULE


%% =================================================
%% EVENT BRIDGE
%% =================================================

ORGANIZATION_EVENT_BUS --> WORKSPACE_SCOPE_GUARD
ORGANIZATION_EVENT_BUS --> ORGANIZATION_SCHEDULE


%% =================================================
%% PROJECTION LAYER
%% =================================================

subgraph PROJECTION_LAYER[Projection Layer]

    PROJECTION_VERSION[projection.version]
    READ_MODEL_REGISTRY[projection.read-model-registry]

    WORKSPACE_PROJECTION_VIEW[projection.workspace-view]
    ACCOUNT_PROJECTION_VIEW[projection.account-view]
    ACCOUNT_PROJECTION_AUDIT[projection.account-audit]
    ACCOUNT_PROJECTION_SCHEDULE[projection.account-schedule]
    ORGANIZATION_PROJECTION_VIEW[projection.organization-view]

end

WORKSPACE_EVENT_BUS --> WORKSPACE_PROJECTION_VIEW
WORKSPACE_EVENT_BUS --> ACCOUNT_PROJECTION_VIEW
WORKSPACE_EVENT_BUS --> ACCOUNT_PROJECTION_AUDIT
WORKSPACE_EVENT_BUS --> ACCOUNT_PROJECTION_SCHEDULE
WORKSPACE_EVENT_BUS --> ORGANIZATION_PROJECTION_VIEW

ORGANIZATION_EVENT_BUS --> ORGANIZATION_PROJECTION_VIEW

PROJECTION_VERSION --> READ_MODEL_REGISTRY


%% =================================================
%% OBSERVABILITY
%% =================================================

subgraph OBSERVABILITY_LAYER[Observability Layer]
    TRACE_IDENTIFIER["trace-identifier / correlation-identifier"]
    DOMAIN_METRICS[domain-metrics]
    DOMAIN_ERROR_LOG[domain-error-log]
end

WORKSPACE_COMMAND_HANDLER --> TRACE_IDENTIFIER
WORKSPACE_TRANSACTION_RUNNER --> TRACE_IDENTIFIER
WORKSPACE_EVENT_BUS --> TRACE_IDENTIFIER

WORKSPACE_TRANSACTION_RUNNER --> DOMAIN_ERROR_LOG
WORKSPACE_EVENT_BUS --> DOMAIN_METRICS
