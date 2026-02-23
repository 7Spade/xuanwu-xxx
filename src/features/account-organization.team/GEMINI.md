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
| `_actions.ts` | `createTeam`, `addTeamMember`, `removeTeamMember` |
| `_queries.ts` | Team list and member subscription |
| `_components/` | `TeamList`, `TeamCard`, `TeamMemberForm` |
| `_hooks/` | `useTeams` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `Team`, `Organization`
- `@/shared/infra/firestore/` — Firestore reads/writes
