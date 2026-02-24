'use client';

/**
 * account-user.notification — _hooks/use-user-notifications.ts
 *
 * React hook that subscribes to a user's personal notification stream.
 */

import { useState, useEffect } from 'react';
import { subscribeToNotifications, markNotificationRead } from '../_queries';
import type { Notification } from '@/shared/types';

export function useUserNotifications(accountId: string | undefined, maxCount = 20) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!accountId) return;

    const unsubscribe = subscribeToNotifications(accountId, maxCount, (notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    });

    return () => unsubscribe();
  }, [accountId, maxCount]);

  const markRead = async (notificationId: string) => {
    if (!accountId) return;
    await markNotificationRead(accountId, notificationId);
  };

  return { notifications, unreadCount, markRead };
}
