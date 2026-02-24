/**
 * projection.organization-view — _projector.ts
 *
 * Maintains the organization projection read model.
 * Stored at: organizationView/{orgId}
 *
 * Per logic-overview.v3.md:
 *   EVENT_FUNNEL_INPUT → ORGANIZATION_PROJECTION_VIEW
 */

import { serverTimestamp } from 'firebase/firestore';
import { setDocument, updateDocument } from '@/shared/infra/firestore/firestore.write.adapter';
import type { Account } from '@/shared/types';

export interface OrganizationViewRecord {
  orgId: string;
  name: string;
  ownerId: string;
  memberCount: number;
  teamCount: number;
  partnerCount: number;
  /** Flat list of member account IDs */
  memberIds: string[];
  /** Map of teamId → team name */
  teamIndex: Record<string, string>;
  readModelVersion: number;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

export async function projectOrganizationSnapshot(org: Account): Promise<void> {
  const record: Omit<OrganizationViewRecord, 'updatedAt'> & { updatedAt: ReturnType<typeof serverTimestamp> } = {
    orgId: org.id,
    name: org.name,
    ownerId: org.ownerId ?? '',
    memberCount: org.members?.length ?? 0,
    teamCount: org.teams?.length ?? 0,
    partnerCount: 0,
    memberIds: org.memberIds ?? [],
    teamIndex: Object.fromEntries(org.teams?.map((t) => [t.id, t.name]) ?? []),
    readModelVersion: Date.now(),
    updatedAt: serverTimestamp(),
  };
  await setDocument(`organizationView/${org.id}`, record);
}

export async function applyMemberJoined(
  orgId: string,
  memberId: string
): Promise<void> {
  const view = await import('@/shared/infra/firestore/firestore.read.adapter').then(
    (m) => m.getDocument<OrganizationViewRecord>(`organizationView/${orgId}`)
  );
  const memberIds = [...(view?.memberIds ?? []), memberId];
  await updateDocument(`organizationView/${orgId}`, {
    memberIds,
    memberCount: memberIds.length,
    readModelVersion: Date.now(),
    updatedAt: serverTimestamp(),
  });
}

export async function applyMemberLeft(
  orgId: string,
  memberId: string
): Promise<void> {
  const view = await import('@/shared/infra/firestore/firestore.read.adapter').then(
    (m) => m.getDocument<OrganizationViewRecord>(`organizationView/${orgId}`)
  );
  const memberIds = (view?.memberIds ?? []).filter((id) => id !== memberId);
  await updateDocument(`organizationView/${orgId}`, {
    memberIds,
    memberCount: memberIds.length,
    readModelVersion: Date.now(),
    updatedAt: serverTimestamp(),
  });
}
