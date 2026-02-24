# Feature Slice: `projection.event-funnel`

## Domain

Event Funnel (`EVENT_FUNNEL_INPUT`) — the Projection Layer's **only external entry point**.

Receives events from both the Workspace Event Bus and the Organization Event Bus, then routes them to the appropriate projections.

## Responsibilities

- Subscribe to all `WORKSPACE_EVENT_BUS` events and forward to workspace projections
- Subscribe to all `ORGANIZATION_EVENT_BUS` events and forward to org/skill projections
- Update `projection.registry` (PROJECTION_VERSION) with stream offsets after each event
- Support event replay from `workspace-core.event-store` to rebuild projections

## Internal Files (Projection Slice Specialization)

| File | Purpose |
|------|---------|
| `_funnel.ts` | `registerWorkspaceFunnel`, `registerOrganizationFunnel`, `replayWorkspaceProjections` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
export { registerWorkspaceFunnel, registerOrganizationFunnel, replayWorkspaceProjections } from './_funnel';
```

## Dependencies

- `@/features/workspace-core.event-bus` — `WorkspaceEventBus` type
- `@/features/account-organization.event-bus` — `onOrgEvent`
- `@/features/projection.registry` — `upsertProjectionVersion`
- `@/features/projection.account-audit` — `appendAuditEntry`
- `@/features/projection.account-schedule` — `applyScheduleAssigned`
- `@/features/projection.organization-view` — `applyMemberJoined`, `applyMemberLeft`
- `@/features/projection.account-skill-view` — `applySkillXpAdded`, `applySkillXpDeducted`
- `@/features/projection.org-eligible-member-view` — `applyOrgMemberSkillXp`, `initOrgMemberEntry`, `removeOrgMemberEntry`
- `@/features/account-organization.schedule` — `handleScheduleProposed`

## Architecture Note

`logic-overview.v3.md`: `EVENT_FUNNEL_INPUT` is in the `PROJECTION_LAYER` subgraph, not in `WORKSPACE_CONTAINER`. It is the **sole** entry point for all projection updates — no projection writes directly on event bus events; they all go through this funnel.

`workspace-core.event-bus` re-exports from this slice for backwards compatibility.
