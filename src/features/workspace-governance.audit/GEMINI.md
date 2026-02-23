# Feature Slice: `workspace-governance.audit`

## Domain

Audit trail — record and display all account and workspace events chronologically.

## Architecture Note

Per `logic-overview.v3.md`: `WORKSPACE_GOVERNANCE` only contains `members` and `role`. Audit trail functionality is conceptually tied to:
- `workspace-core.event-store` — source of workspace event history
- `projection.account-audit` — source of account audit projection

This slice groups both workspace-level and account-level audit views for practical delivery. Decoupling into `workspace-core.event-store` (workspace audit) and `projection.account-audit` (account audit) is deferred until those projection slices are implemented.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_queries.ts` | `onSnapshot` listeners for audit logs |
| `_hooks/` | `useAccountAudit`, `useWorkspaceAudit`, `useLogger` |
| `_components/` | `WorkspaceAudit`, `AccountAuditComponent`, `AuditTimeline`, `AuditEventItem`, `AuditDetailSheet`, `AuditTypeIcon` |
| `index.ts` | Public exports |

## Note

Audit logs are **read-only** in the UI. Write operations happen automatically server-side
(triggered by other actions). This slice has no `_actions.ts`.

## Public API (`index.ts`)

```ts
export { WorkspaceAudit } from "./_components/audit.workspace-view";
export { AccountAuditComponent } from "./_components/audit.account-view";
export { AuditDetailSheet } from "./_components/audit-detail-sheet";
export { AuditEventItem } from "./_components/audit-event-item";
export { AuditTimeline, AuditEventItemContainer } from "./_components/audit-timeline";
export { AuditTypeIcon } from "./_components/audit-type-icon";
export { useAccountAudit, useWorkspaceAudit, useLogger } from "./_hooks/...";
export { default } from "./_components/audit.view";  // AccountAuditView — for dashboard/account/audit/page.tsx
```

## Who Uses This Slice?

- `app/dashboard/account/audit/page.tsx`
- `app/dashboard/workspaces/[id]/@businesstab/audit/page.tsx`
- `src/features/workspace-business.daily/_hooks/use-workspace-daily.ts` (`useLogger`)
