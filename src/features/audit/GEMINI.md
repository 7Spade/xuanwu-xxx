# Feature Slice: `audit`

## Domain

Audit trail — record and display all account and workspace events chronologically.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_queries.ts` | `onSnapshot` listeners for audit logs |
| `_hooks/` | `useAccountAudit`, `useWorkspaceAudit` |
| `_components/` | `AuditView`, `AuditAccountView`, `AuditWorkspaceView`, `AuditTimeline`, `AuditEventItem`, `AuditDetailSheet`, `AuditTypeIcon` |
| `index.ts` | Public exports |

## Maps From (Legacy)

- `src/react-hooks/state-hooks/use-account-audit.ts` → `_hooks/`
- `src/react-hooks/state-hooks/use-workspace-audit.ts` → `_hooks/`
- `src/view-modules/workspaces/plugins/audit/` → `_components/`

## Note

Audit logs are **read-only** in the UI. Write operations happen automatically server-side
(triggered by other actions). This slice has no `_actions.ts`.

## Public API (`index.ts`)

```ts
export { AuditWorkspaceView } from "./_components/audit.workspace-view";
export { AuditAccountView } from "./_components/audit.account-view";
```

## Who Uses This Slice?

- `app/dashboard/account/audit/page.tsx`
- `app/dashboard/workspaces/[id]/@plugin-tab/audit/page.tsx`
