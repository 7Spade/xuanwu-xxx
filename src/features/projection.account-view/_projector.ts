/**
 * projection.account-view — _projector.ts
 *
 * Maintains the account projection read model + authority snapshot.
 * Implements shared-kernel.authority-snapshot contract.
 *
 * Stored at: accountView/{accountId}
 *
 * Per logic-overview.v3.md:
 *   EVENT_FUNNEL_INPUT → ACCOUNT_PROJECTION_VIEW
 *   ACCOUNT_USER_NOTIFICATION -.→ ACCOUNT_PROJECTION_VIEW (content filtering by tag)
 *   ACCOUNT_PROJECTION_VIEW -.→ shared-kernel.authority-snapshot (contract)
 */

import { serverTimestamp } from 'firebase/firestore';
import { setDocument, updateDocument } from '@/shared/infra/firestore/firestore.write.adapter';
import type { AuthoritySnapshot } from '@/shared-kernel/identity/authority-snapshot';
import type { Account } from '@/shared/types';

export interface AccountViewRecord {
  readonly implementsAuthoritySnapshot: true;
  accountId: string;
  name: string;
  accountType: 'user' | 'organization';
  email?: string;
  photoURL?: string;
  /** Roles this account holds across all org memberships (denormalized) */
  orgRoles: Record<string, string>; // orgId → role
  /** Skill tag slugs granted to this account */
  skillTagSlugs: string[];
  /** Internal/external membership flag for notification content filtering */
  membershipTag?: 'internal' | 'external';
  /** Latest authority snapshot */
  authoritySnapshot?: AuthoritySnapshot;
  readModelVersion: number;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

export async function projectAccountSnapshot(account: Account): Promise<void> {
  const record: Omit<AccountViewRecord, 'updatedAt'> & { updatedAt: ReturnType<typeof serverTimestamp> } = {
    implementsAuthoritySnapshot: true,
    accountId: account.id,
    name: account.name,
    accountType: account.accountType,
    email: account.email,
    photoURL: account.photoURL,
    orgRoles: {},
    skillTagSlugs: account.skillGrants?.map((sg) => sg.tagSlug) ?? [],
    readModelVersion: Date.now(),
    updatedAt: serverTimestamp(),
  };
  await setDocument(`accountView/${account.id}`, record);
}

export async function applyOrgRoleChange(
  accountId: string,
  orgId: string,
  role: string
): Promise<void> {
  await updateDocument(`accountView/${accountId}`, {
    [`orgRoles.${orgId}`]: role,
    readModelVersion: Date.now(),
    updatedAt: serverTimestamp(),
  });
}

export async function applyAuthoritySnapshot(
  accountId: string,
  snapshot: AuthoritySnapshot
): Promise<void> {
  await updateDocument(`accountView/${accountId}`, {
    authoritySnapshot: snapshot,
    readModelVersion: Date.now(),
    updatedAt: serverTimestamp(),
  });
}
