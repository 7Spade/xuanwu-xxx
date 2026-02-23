flowchart TD

    AUTH[Firebase Auth]

    subgraph ACCOUNT_LAYER[Account Layer]
        USER[User Account]
        USER_PROFILE[user.profile]
        USER_SETTINGS[user.settings]
        USER_WALLET["user.wallet (coin / token)"]

        ORG[Organization Account]
        ORG_SETTINGS[organization.settings]
    end


    subgraph ORG_LAYER[Organization Layer]
        ORG_MEM[Organization Members]
        ORG_TEAM[Organization Teams]
        ORG_PARTNER[Organization Partners]
        ORG_POLICY[Organization Policies]
        ORG_SCHEDULE["Organization Schedule (人力調度)"]
    end


    subgraph WS_CONTAINER[Workspace Container]

        WS_SETTINGS[workspace.settings]

        subgraph WS_CORE[workspace-core]
            WE[Workspace Entity]
            EB[workspace-core.event-bus]
        end

        subgraph WS_GOV[workspace-governance]
            WS_MEM[Workspace Members]
            WS_ROLE[Workspace Roles]
            WS_POLICY[Workspace Policy Engine]
        end

        subgraph WS_BIZ[workspace-business]
            ACCEPT[acceptance]
            DAILY[daily]
            DOC[document-parser]
            FILES[files]
            FIN[finance]
            ISSUES[issues]
            QA[qa]
            TASKS[tasks]
            WS_SCHEDULE["Workspace Schedule (待辦產生)"]
            WS_AUDIT[Workspace Audit Log]
        end
    end


    subgraph PROJECTION[Projection Layer]
        W_VIEW[Workspace Views]
        A_VIEW[Account Aggregate Views]

        A_AUDIT[Account Audit Aggregate]
        A_SCHEDULE[Account Schedule Aggregate]
    end


    AUTH --> USER
    AUTH --> ORG

    USER --> USER_PROFILE
    USER --> USER_SETTINGS
    USER --> USER_WALLET

    ORG --> ORG_SETTINGS
    ORG --> ORG_LAYER
    ORG --> WS_CONTAINER

    WS_CONTAINER --> WS_SETTINGS

    WS_BIZ --> WS_POLICY
    WS_POLICY --> WE
    WE --> EB

    EB --> W_VIEW
    EB --> A_VIEW
    EB --> A_AUDIT
    EB --> A_SCHEDULE

    WS_SCHEDULE --> ORG_SCHEDULE
