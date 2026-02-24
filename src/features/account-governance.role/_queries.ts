/**
 * account-governance.role — _queries.ts
 *
 * Read queries for account role management.
 */

import { collection, query, where, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import type { AccountRoleRecord } from './_actions';

/**
 * Fetches the role record for a specific account in an org.
 */
export async function getAccountRole(
  accountId: string,
  orgId: string
): Promise<AccountRoleRecord | null> {
  return getDocument<AccountRoleRecord>(`accountRoles/${orgId}_${accountId}`);
}

/**
 * Subscribes to all active roles for an account across all orgs.
 * Returns an unsubscribe function.
 */
export function subscribeToAccountRoles(
  accountId: string,
  onUpdate: (roles: AccountRoleRecord[]) => void
): Unsubscribe {
  const ref = collection(db, 'accountRoles');
  const q = query(ref, where('accountId', '==', accountId), where('isActive', '==', true));

  return onSnapshot(q, (snap) => {
    const roles = snap.docs.map((d) => ({ ...d.data() } as AccountRoleRecord));
    onUpdate(roles);
  });
}
