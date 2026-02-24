/**
 * account-governance.policy — _queries.ts
 *
 * Read queries for account policy management.
 *
 * Per logic-overview.v3.md: ACCOUNT_POLICY → CUSTOM_CLAIMS
 * Policies are read to determine effective permissions for an account.
 */

import { collection, query, where, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import type { AccountPolicy } from './_actions';

/**
 * Fetches a single account policy by ID.
 */
export async function getAccountPolicy(policyId: string): Promise<AccountPolicy | null> {
  return getDocument<AccountPolicy>(`accountPolicies/${policyId}`);
}

/**
 * Subscribes to all policies for an account.
 * Returns an unsubscribe function.
 */
export function subscribeToAccountPolicies(
  accountId: string,
  onUpdate: (policies: AccountPolicy[]) => void
): Unsubscribe {
  const ref = collection(db, 'accountPolicies');
  const q = query(ref, where('accountId', '==', accountId));

  return onSnapshot(q, (snap) => {
    const policies = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AccountPolicy));
    onUpdate(policies);
  });
}

/**
 * Fetches all active policies for an account.
 */
export async function getActiveAccountPolicies(accountId: string): Promise<AccountPolicy[]> {
  return new Promise((resolve) => {
    const ref = collection(db, 'accountPolicies');
    const q = query(ref, where('accountId', '==', accountId), where('isActive', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      unsub();
      resolve(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AccountPolicy)));
    });
  });
}
