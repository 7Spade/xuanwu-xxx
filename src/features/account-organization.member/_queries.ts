/**
 * account-organization.member — _queries.ts
 *
 * Read queries for org-level member management.
 *
 * Org members are stored as an array in accounts/{orgId}.members.
 * onSnapshot on the org document provides real-time member list updates.
 */

import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { db } from '@/shared/infra/firestore/firestore.client'
import { getDocument } from '@/shared/infra/firestore/firestore.read.adapter'
import type { Account, MemberReference } from '@/shared/types'

/**
 * Fetches the members array of an organization account.
 */
export async function getOrgMembers(orgId: string): Promise<MemberReference[]> {
  const account = await getDocument<Account>(`accounts/${orgId}`)
  return account?.members ?? []
}

/**
 * Subscribes to real-time updates of an organization's member list.
 * Members are stored inline on the organization account document.
 * Returns an unsubscribe function.
 */
export function subscribeToOrgMembers(
  orgId: string,
  onUpdate: (members: MemberReference[]) => void
): Unsubscribe {
  const ref = doc(db, 'accounts', orgId)
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      onUpdate([])
      return
    }
    const data = snap.data() as Account
    onUpdate(data.members ?? [])
  })
}
