/**
 * account-user.notification — _queries.ts
 *
 * Firestore reads for a user's personal notification list.
 * Stored at: accounts/{accountId}/notifications/{notifId}
 */

import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/shared/infra/firestore/firestore.client';
import type { Notification } from '@/shared/types';

/**
 * Subscribes to the latest notifications for a user.
 * Returns an unsubscribe function.
 */
export function subscribeToNotifications(
  accountId: string,
  maxCount: number,
  onUpdate: (notifications: Notification[]) => void
): Unsubscribe {
  const ref = collection(db, 'accounts', accountId, 'notifications');
  const q = query(ref, orderBy('timestamp', 'desc'), limit(maxCount));

  return onSnapshot(q, (snap) => {
    const notifications: Notification[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title as string,
        message: data.message as string,
        type: (data.type as Notification['type']) ?? 'info',
        read: (data.read as boolean) ?? false,
        timestamp: typeof data.timestamp?.toMillis === 'function'
          ? data.timestamp.toMillis()
          : Date.now(),
      };
    });
    onUpdate(notifications);
  });
}

/**
 * Marks a notification as read.
 */
export async function markNotificationRead(
  accountId: string,
  notificationId: string
): Promise<void> {
  const ref = doc(db, 'accounts', accountId, 'notifications', notificationId);
  await updateDoc(ref, { read: true });
}
