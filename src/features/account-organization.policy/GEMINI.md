# Feature Slice: `account-organization.policy`

## Domain

Organization policy management — defines compliance and access rules at the organization level, bridging to workspace policy enforcement via the org-policy-cache anti-corruption layer.

## Responsibilities

- Define and manage organization-level policies (membership rules, workspace access rules)
- Publish policy-changed events to `account-organization.event-bus`
- Downstream: workspace policy cache consumes policy change events

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createOrgPolicy`, `updateOrgPolicy`, `deleteOrgPolicy` |
| `_queries.ts` | Policy subscription |
| `_components/` | `OrgPolicyList`, `OrgPolicyForm` |
| `_hooks/` | `useOrgPolicy` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `OrgPolicy`
- `@/shared/infra/firestore/` — Firestore reads/writes

## Architecture Note

`logic-overview.v3.md`: `ORGANIZATION_EVENT_BUS → WORKSPACE_ORG_POLICY_CACHE`.
Policy changes published here flow through the organization event bus to update the workspace's local org-policy cache.
