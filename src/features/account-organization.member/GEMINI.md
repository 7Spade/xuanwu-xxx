# Feature Slice: `account-organization.member`

## Domain

Organization-level member management — who belongs to the organization/account (not workspace-level).

## Distinction from `workspace-governance.members`

| Slice | Scope | Context |
|-------|-------|---------|
| `account-organization.member` | **Org-level** — who is in the organization | `/dashboard/account/members` |
| `workspace-governance.members` | **Workspace-level** — who has access to a specific workspace | `/workspaces/[id]/@businesstab/members` |

## Responsibilities

- Invite / remove organization members
- Manage org-level roles and permissions
- Member directory and search

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `inviteMember`, `removeMember`, `updateRole` |
| `_queries.ts` | Org member list subscription |
| `_components/` | `OrgMembersView`, `InviteDialog` |
| `_hooks/` | `useOrgMembers` |
| `index.ts` | Public API |

## Dependencies

- `@/shared/types` — `Account`, `MemberReference`
- `@/shared/infra/firestore/` — Firestore reads/writes
- `@/shared/app-providers/app-context` — `useApp` for active account context
