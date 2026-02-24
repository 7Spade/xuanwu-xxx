# Feature Slice: `workspace-governance.members`

## Domain

Workspace member management — who has access to a specific workspace.

## Responsibilities

- List, add, remove workspace members
- Account-level members view
- Workspace members panel

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `addMember`, `removeMember`, `updateMemberRole`, `getWorkspaceMembers` |
| `_queries.ts` | Firestore listeners |
| `_components/` | `MembersView`, `WorkspaceMembers` |
| `index.ts` | Public exports |

## Public API (`index.ts`)

```ts
export { MembersView } from "./_components/members-view";
export { WorkspaceMembers } from "./_components/members-panel";
```

## Who Uses This Slice?

- `app/dashboard/account/members/page.tsx`
- `app/(shell)/(account)/(workspaces)/workspaces/[id]/@businesstab/members/page.tsx`
