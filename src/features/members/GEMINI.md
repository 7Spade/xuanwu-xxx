# Feature Slice: `members`

## Domain

Member management — both account-level (org members) and workspace-level (plugin members).

## Responsibilities

- List, add, remove workspace members
- Account-level members view
- Workspace plugin members tab

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `addMember`, `removeMember`, `updateMemberRole`, `getWorkspaceMembers` |
| `_queries.ts` | Firestore listeners |
| `_components/` | `MembersView`, `MembersPlugin` |
| `index.ts` | Public exports |

## Maps From (Legacy)

- `src/server-commands/members/` → `_actions.ts`
- `src/view-modules/members/` → `_components/`
- `src/view-modules/workspaces/plugins/members/` → `_components/`

## Public API (`index.ts`)

```ts
export { MembersView } from "./_components/members-view";
export { MembersPlugin } from "./_components/members-plugin";
```

## Who Uses This Slice?

- `app/dashboard/account/members/page.tsx`
- `app/dashboard/workspaces/[id]/@plugin-tab/members/page.tsx`
