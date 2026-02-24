/**
 * account-organization.policy — _queries.ts
 *
 * Read queries for organization policy management.
 * Used by workspace-application._org-policy-cache to subscribe to policy changes.
 */

import { collection, query, where, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import type { OrgPolicy } from './_actions';

/**
 * Fetches a single org policy by ID.
 */
export async function getOrgPolicy(policyId: string): Promise<OrgPolicy | null> {
  return getDocument<OrgPolicy>(`orgPolicies/${policyId}`);
}

/**
 * Subscribes to all active policies for an organization.
 * Primary consumer: workspace-application._org-policy-cache (ACL anti-corruption layer).
 */
export function subscribeToOrgPolicies(
  orgId: string,
  onUpdate: (policies: OrgPolicy[]) => void
): Unsubscribe {
  const ref = collection(db, 'orgPolicies');
  const q = query(ref, where('orgId', '==', orgId), where('isActive', '==', true));

  return onSnapshot(q, (snap) => {
    const policies = snap.docs.map((d) => ({ id: d.id, ...d.data() } as OrgPolicy));
    onUpdate(policies);
  });
}

/**
 * Fetches all active policies for an org by scope.
 */
export async function getOrgPoliciesByScope(
  orgId: string,
  scope: OrgPolicy['scope']
): Promise<OrgPolicy[]> {
  return new Promise((resolve) => {
    const ref = collection(db, 'orgPolicies');
    const q = query(
      ref,
      where('orgId', '==', orgId),
      where('scope', '==', scope),
      where('isActive', '==', true)
    );
    const unsub = onSnapshot(q, (snap) => {
      unsub();
      resolve(snap.docs.map((d) => ({ id: d.id, ...d.data() } as OrgPolicy)));
    });
  });
}
