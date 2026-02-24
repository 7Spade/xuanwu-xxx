/**
 * projection.account-audit — _queries.ts
 *
 * Read-side queries for the account audit projection.
 */

import { collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import { getDocuments } from '@/shared/infra/firestore/firestore.read.adapter';
import { createConverter } from '@/shared/infra/firestore/firestore.converter';
import type { AuditProjectionEntry } from './_projector';

export async function getAccountAuditEntries(
  accountId: string,
  maxEntries = 50
): Promise<AuditProjectionEntry[]> {
  const converter = createConverter<AuditProjectionEntry>();
  const colRef = collection(
    db,
    `auditProjection/${accountId}/entries`
  ).withConverter(converter);
  const q = query(colRef, orderBy('occurredAt', 'desc'), limit(maxEntries));
  return getDocuments(q);
}
