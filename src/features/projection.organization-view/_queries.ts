/**
 * projection.organization-view — _queries.ts
 *
 * Read-side queries for the organization projection view.
 */

import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter';
import type { OrganizationViewRecord } from './_projector';

export async function getOrganizationView(orgId: string): Promise<OrganizationViewRecord | null> {
  return getDocument<OrganizationViewRecord>(`organizationView/${orgId}`);
}

export async function getOrganizationMemberIds(orgId: string): Promise<string[]> {
  const view = await getOrganizationView(orgId);
  return view?.memberIds ?? [];
}
