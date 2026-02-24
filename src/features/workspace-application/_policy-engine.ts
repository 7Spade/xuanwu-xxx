/**
 * workspace-application/_policy-engine.ts
 *
 * Evaluates workspace-level policies based on role and requested action.
 *
 * Per logic-overview.v3.md:
 * - WORKSPACE_SCOPE_GUARD → WORKSPACE_POLICY_ENGINE → WORKSPACE_TRANSACTION_RUNNER
 * - Application layer coordinates flow only — no domain rules (invariant #3)
 *
 * Current: simple role-based capability model.
 * Future: extended with org-policy-cache (WORKSPACE_ORG_POLICY_CACHE) when
 * account-organization.event-bus delivers policy change events.
 */

export type WorkspaceRole = 'Manager' | 'Contributor' | 'Viewer';

export interface PolicyDecision {
  permitted: boolean;
  reason?: string;
}

// Role → allowed action patterns (resource:action, resource:* = all actions)
const ROLE_PERMISSIONS: Record<WorkspaceRole, readonly string[]> = {
  Manager: [
    'workspace:*',
    'tasks:*',
    'issues:*',
    'members:*',
    'settings:*',
    'finance:*',
    'schedule:*',
    'files:*',
    'daily:*',
    'quality-assurance:*',
    'acceptance:*',
  ],
  Contributor: [
    'workspace:read',
    'tasks:*',
    'issues:create',
    'issues:read',
    'issues:comment',
    'finance:read',
    'schedule:read',
    'files:*',
    'daily:*',
    'quality-assurance:read',
    'acceptance:read',
  ],
  Viewer: [
    'workspace:read',
    'tasks:read',
    'issues:read',
    'finance:read',
    'schedule:read',
    'files:read',
    'daily:read',
  ],
};

/**
 * Evaluates whether a role may perform a given action.
 *
 * @param role - The workspace role of the caller (from ScopeGuard).
 * @param action - The requested action, e.g. "tasks:create", "finance:disburse".
 */
export function evaluatePolicy(role: WorkspaceRole, action: string): PolicyDecision {
  const permissions = ROLE_PERMISSIONS[role] ?? [];
  const [resource] = action.split(':');

  const permitted = permissions.some((p) => {
    if (p === 'workspace:*') return true; // Manager wildcard
    if (p === `${resource}:*`) return true; // Resource wildcard
    return p === action; // Exact match
  });

  return {
    permitted,
    reason: permitted
      ? undefined
      : `Role "${role}" is not permitted to perform "${action}"`,
  };
}
