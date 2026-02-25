# Feature Slice: `account-organization.team`

## Domain

Team management — internal group view within an organization. Teams are aggregated views of internal accounts sharing the same skill tags from the flat skill-tag pool.

## Distinction from `account-organization.partner`

| Slice | View | Account Type |
|-------|------|--------------|
| `account-organization.team` | Internal group view | Internal accounts |
| `account-organization.partner` | External group view | External accounts |

Both slices draw from the same `SKILL_TAG_POOL` in `account-organization.skill-tag`.

## Responsibilities

- Create and manage teams (internal groups)
- Aggregate skill tags from team member accounts
- Team member assignment and removal

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createTeam`, `updateTeamMembers` |
| `_queries.ts` | `getOrgTeams`, `subscribeToOrgTeams` |
| `_components/` | `TeamsView`, `TeamDetailView` |
| `_hooks/` | `useTeamManagement` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
export { useTeamManagement } from './_hooks/use-team-management';
export { TeamsView, TeamDetailView } from './_components/...';
export { getOrgTeams, subscribeToOrgTeams } from './_queries';
```

## Dependencies

- `@/shared/types` — `Team`, `Organization`
- `@/shared/infra/firestore/` — Firestore reads/writes
- `@/shared/app-providers/app-context` — `useApp` for active account context
