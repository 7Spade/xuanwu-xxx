'use client';

/**
 * account-user.notification — _components/notification-list.tsx
 *
 * Dropdown/panel displaying recent notifications.
 * Marks items as read when clicked.
 */

import { ScrollArea } from '@/shared/shadcn-ui/scroll-area';
import type { Notification } from '@/shared/types';
import { cn } from '@/shared/lib';

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

export function NotificationList({ notifications, onMarkRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        暫無通知
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-80">
      <ul className="divide-y divide-border">
        {notifications.map((notif) => (
          <li key={notif.id}>
            <button
              type="button"
              className={cn(
                'w-full flex flex-col gap-1 px-4 py-3 text-left hover:bg-muted/50 transition-colors',
                !notif.read && 'bg-primary/5'
              )}
              onClick={() => !notif.read && onMarkRead(notif.id)}
            >
              <div className="flex items-center gap-2">
                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                )}
                <span className={cn('text-sm font-medium', notif.read && 'text-muted-foreground')}>
                  {notif.title}
                </span>
              </div>
              <p className="text-xs text-muted-foreground pl-4">{notif.message}</p>
              <time className="text-xs text-muted-foreground/60 pl-4">
                {new Date(notif.timestamp).toLocaleString('zh-TW')}
              </time>
            </button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
