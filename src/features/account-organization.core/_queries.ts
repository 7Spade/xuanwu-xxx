/**
 * account-organization.core — _queries.ts
 *
 * Read queries for the organization aggregate.
 *
 * Organization accounts are stored in accounts/{orgId}.
 * onSnapshot provides real-time updates.
 */

import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { db } from '@/shared/infra/firestore/firestore.client'
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter'
import type { Account } from '@/shared/types'

/**
 * Fetches a single organization account by ID.
 */
export async function getOrganization(orgId: string): Promise<Account | null> {
  return getDocument<Account>(`accounts/${orgId}`)
}

/**
 * Subscribes to real-time updates of an organization account document.
 * Returns an unsubscribe function.
 */
export function subscribeToOrganization(
  orgId: string,
  onUpdate: (org: Account | null) => void
): Unsubscribe {
  const ref = doc(db, 'accounts', orgId)
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      onUpdate(null)
      return
    }
    onUpdate({ id: snap.id, ...snap.data() } as Account)
  })
}
