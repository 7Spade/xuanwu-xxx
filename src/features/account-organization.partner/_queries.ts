/**
 * account-organization.partner — _queries.ts
 *
 * Read queries for org-level external partner management.
 *
 * Partners are stored as `accounts/{orgId}.teams[]` (type === 'external').
 * onSnapshot on the org account document provides real-time updates.
 *
 * Per logic-overview.v3.md:
 *   ORGANIZATION_PARTNER["organization-governance.partner（合作夥伴 · 外部組視圖）"]
 *   ORGANIZATION_PARTNER -.->|外部帳號擁有標籤（唯讀引用）| SKILL_TAG_POOL
 *
 * Boundary constraint:
 *   These queries read ONLY from this org's account document and subcollections.
 *   Skill tag data is referenced by tagSlug — read from account-organization.skill-tag.
 */

import { collection, doc, onSnapshot, orderBy, query, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import type { Account, PartnerInvite, Team } from '@/shared/types';

/**
 * Fetches all external partner groups for an organization.
 * Partner groups have `type === 'external'`.
 */
export async function getOrgPartners(orgId: string): Promise<Team[]> {
  const account = await getDocument<Account>(`accounts/${orgId}`);
  return (account?.teams ?? []).filter((t: Team) => t.type === 'external');
}

/**
 * Subscribes to real-time updates of an organization's external partner list.
 * Partners are stored inline on the organization account document.
 * Returns an unsubscribe function.
 */
export function subscribeToOrgPartners(
  orgId: string,
  onUpdate: (partners: Team[]) => void
): Unsubscribe {
  const ref = doc(db, 'accounts', orgId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      onUpdate([]);
      return;
    }
    const data = snap.data() as Account;
    onUpdate((data.teams ?? []).filter((t: Team) => t.type === 'external'));
  });
}

/**
 * Subscribes to real-time partner invite updates for an organization.
 *
 * Invites are stored at `accounts/{orgId}/invites` — this is Account BC (Subject Center) data.
 * Components in account-organization.partner MUST use this query instead of reading
 * invites through useAccount (WorkspaceContainer) to respect BC boundaries.
 *
 * Boundary invariant: Subject Center components must not cross into WorkspaceContainer
 * to read data that belongs to the Subject Center.
 */
export function subscribeToOrgPartnerInvites(
  orgId: string,
  onUpdate: (invites: PartnerInvite[]) => void
): Unsubscribe {
  const ref = query(
    collection(db, 'accounts', orgId, 'invites'),
    orderBy('invitedAt', 'desc')
  );
  return onSnapshot(ref, (snap) => {
    const invites = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PartnerInvite));
    onUpdate(invites);
  });
}
