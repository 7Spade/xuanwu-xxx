'use client';

/**
 * account-user.notification — _components/notification-badge.tsx
 *
 * Notification bell icon with unread count badge.
 * Used in the top navigation bar.
 */

import { Bell } from 'lucide-react';
import { Badge } from '@/shared/shadcn-ui/badge';
import { Button } from '@/shared/shadcn-ui/button';

interface NotificationBadgeProps {
  unreadCount: number;
  onClick?: () => void;
}

export function NotificationBadge({ unreadCount, onClick }: NotificationBadgeProps) {
  return (
    <Button variant="ghost" size="icon" className="relative" onClick={onClick}>
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
