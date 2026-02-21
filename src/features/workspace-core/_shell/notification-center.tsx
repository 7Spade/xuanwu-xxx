
"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/shadcn-ui/popover";
import { Button } from "@/shared/shadcn-ui/button";
import { ScrollArea } from "@/shared/shadcn-ui/scroll-area";
import { Bell, Trash2, Check } from "lucide-react";
import { type Notification } from "@/shared/types";
import type { AppAction } from '../_components/app-provider'

interface NotificationCenterProps {
  notifications: Notification[];
  dispatch: React.Dispatch<AppAction>;
}

export function NotificationCenter({ notifications, dispatch }: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="size-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-background bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h4 className="text-sm font-bold uppercase tracking-widest">Dimension Pulse</h4>
          <Button variant="ghost" size="icon" className="size-6" onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}>
            <Trash2 className="size-3" />
          </Button>
        </div>
        <ScrollArea className="h-72">
          <div className="divide-y">
            {notifications.length > 0 ? notifications.map(n => (
              <div key={n.id} className={`p-4 transition-colors hover:bg-muted/50 ${!n.read ? 'bg-primary/5' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="flex items-center gap-1 text-xs font-bold leading-none">
                      <span className={`size-1.5 rounded-full ${n.type === 'success' ? 'bg-green-500' : n.type === 'alert' ? 'bg-red-500' : 'bg-primary'}`} />
                      {n.title}
                    </p>
                    <p className="text-[10px] leading-tight text-muted-foreground">{n.message}</p>
                    <p className="text-[9px] text-muted-foreground/60">{new Date(n.timestamp).toLocaleTimeString()}</p>
                  </div>
                  {!n.read && (
                    <Button variant="ghost" size="icon" className="size-5" onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}>
                      <Check className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-xs italic text-muted-foreground">
                No activity resonance detected yet.
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
