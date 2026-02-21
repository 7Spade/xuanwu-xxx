# Feature Slice: `workspace-governance.teams`

## Domain

Team management — create teams, manage team members and skills.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | Team CRUD, team member operations |
| `_components/` | `TeamsView`, `TeamDetailView` |
| `index.ts` | Public exports |

## Maps From (Legacy)

- `src/server-commands/account/` (team ops) → `_actions.ts`
- `src/view-modules/teams/` → `_components/`

## Public API (`index.ts`)

```ts
export { TeamsView } from "./_components/teams-view";
export { TeamDetailView } from "./_components/team-detail-view";
```

## Who Uses This Slice?

- `app/dashboard/account/teams/page.tsx`
- `app/dashboard/account/teams/[id]/page.tsx`
