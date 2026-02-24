/**
 * workspace-governance.role — Public API
 *
 * Workspace-level role management (split from workspace-governance.members).
 * Does NOT sign CUSTOM_CLAIMS — that is account-governance.role's responsibility.
 *
 * Per logic-overview.v3.md: WORKSPACE_ROLE — workspace access control only.
 */

export { assignWorkspaceRole, revokeWorkspaceRole } from './_actions';
export type { AssignWorkspaceRoleInput, RevokeWorkspaceRoleInput } from './_actions';

export { getWorkspaceGrant, getWorkspaceGrants } from './_queries';

export { useWorkspaceRole } from './_hooks/use-workspace-role';
