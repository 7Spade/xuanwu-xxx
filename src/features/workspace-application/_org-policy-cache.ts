/**
 * workspace-application/_org-policy-cache.ts
 *
 * Local org-policy cache for the workspace application layer.
 *
 * Per logic-overview.v3.md:
 *   ORGANIZATION_EVENT_BUS →|政策變更事件| WORKSPACE_ORG_POLICY_CACHE
 *   WORKSPACE_ORG_POLICY_CACHE →|更新本地 read model| WORKSPACE_SCOPE_READ_MODEL
 *
 * This cache listens to OrgPolicyChanged events via the org event bus and
 * keeps a local in-memory snapshot of org policies that the Policy Engine
 * can consult without a round-trip to Firestore.
 *
 * The cache also updates the workspace scope read model (projection.workspace-scope-guard)
 * when policy changes affect workspace-level permissions.
 */

import type { OrgPolicyChangedPayload } from '@/features/account-organization.event-bus';
import { onOrgEvent } from '@/features/account-organization.event-bus';
import { upsertProjectionVersion } from '@/features/projection.registry';

export interface OrgPolicyEntry {
  policyId: string;
  orgId: string;
  changeType: 'created' | 'updated' | 'deleted';
  changedBy: string;
  cachedAt: string;
}

// In-process policy cache (survives for the life of the workspace session)
const policyCache = new Map<string, OrgPolicyEntry>();

/**
 * Returns the cached policy entry for a given policy ID, if available.
 */
export function getCachedOrgPolicy(policyId: string): OrgPolicyEntry | undefined {
  return policyCache.get(policyId);
}

/**
 * Returns all currently cached org policies.
 */
export function getAllCachedPolicies(): OrgPolicyEntry[] {
  return Array.from(policyCache.values());
}

/**
 * Registers the org policy cache listener on the organization event bus.
 * Should be called once at workspace startup (from workspace-provider.tsx).
 *
 * Returns an unsubscribe function.
 */
export function registerOrgPolicyCache(): () => void {
  const unsubscribe = onOrgEvent(
    'organization:policy:changed',
    (payload: OrgPolicyChangedPayload) => {
      if (payload.changeType === 'deleted') {
        policyCache.delete(payload.policyId);
      } else {
        policyCache.set(payload.policyId, {
          policyId: payload.policyId,
          orgId: payload.orgId,
          changeType: payload.changeType,
          changedBy: payload.changedBy,
          cachedAt: new Date().toISOString(),
        });
      }
      // Signal to the Workspace Scope Read Model that org policies have changed.
      // Invariant #7: Scope Guard reads only the local read model, so we bump
      // the projection version so any cache layer knows to re-evaluate access.
      upsertProjectionVersion(
        `workspace-scope-guard:org:${payload.orgId}`,
        Date.now(),
        new Date().toISOString(),
      ).catch((err: unknown) =>
        console.error(`[workspace-application] Failed to bump scope guard version for org ${payload.orgId}:`, err)
      );
    }
  );

  return unsubscribe;
}

/**
 * Clears the entire policy cache.
 * Useful when workspace session ends or org changes.
 */
export function clearOrgPolicyCache(): void {
  policyCache.clear();
}
