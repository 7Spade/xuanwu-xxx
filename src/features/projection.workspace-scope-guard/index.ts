/**
 * projection.workspace-scope-guard — Public API
 *
 * Scope Guard dedicated read model.
 * Implements shared-kernel.authority-snapshot contract.
 *
 * Per logic-overview.v3.md:
 *   ACTIVE_ACCOUNT_CONTEXT → WORKSPACE_SCOPE_READ_MODEL → WORKSPACE_SCOPE_GUARD
 *   WORKSPACE_ORG_POLICY_CACHE → (update) → WORKSPACE_SCOPE_READ_MODEL
 */

export { getScopeGuardView, queryWorkspaceAccess } from './_queries';
export { initScopeGuardView, applyGrantEvent } from './_projector';
export type { WorkspaceScopeGuardView, WorkspaceScopeGrantEntry } from './_read-model';
export { buildAuthoritySnapshot } from './_read-model';
