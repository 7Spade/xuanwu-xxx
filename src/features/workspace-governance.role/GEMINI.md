# Feature Slice: `workspace-governance.role`

## Domain

Workspace role management — manages roles within a specific workspace, split from `workspace-governance.members` to maintain single-responsibility principle.

## Distinction from `account-governance.role`

| Slice | Scope | Context |
|-------|-------|---------|
| `account-governance.role` | Account-level roles (org-wide) | Signs CUSTOM_CLAIMS |
| `workspace-governance.role` | Workspace-level roles | Workspace access control only |

## Responsibilities

- Define workspace-specific roles (e.g. workspace-owner, workspace-editor, workspace-viewer)
- Assign/revoke workspace roles for workspace members
- Provide role validation for workspace operations

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `assignWorkspaceRole`, `revokeWorkspaceRole` |
| `_queries.ts` | Workspace role subscription |
| `_components/` | `WorkspaceRoleSelector`, `WorkspaceRoleBadge` |
| `_hooks/` | `useWorkspaceRole` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `WorkspaceRole`, `Workspace`
- `@/shared/infra/firestore/` — Firestore reads/writes
