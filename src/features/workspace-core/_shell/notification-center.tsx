
"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/shadcn-ui/popover";
import { Button } from "@/shared/shadcn-ui/button";
import { ScrollArea } from "@/shared/shadcn-ui/scroll-area";
import { Bell, Trash2, Check } from "lucide-react";
import { Notification } from "@/shared/types";

interface NotificationCenterProps {
  notifications: Notification[];
  dispatch: React.Dispatch<any>;
}

export function NotificationCenter({ notifications, dispatch }: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b flex items-center justify-between">
          <h4 className="font-bold text-sm uppercase tracking-widest">Dimension Pulse</h4>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        <ScrollArea className="h-72">
          <div className="divide-y">
            {notifications.length > 0 ? notifications.map(n => (
              <div key={n.id} className={`p-4 hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-xs font-bold leading-none flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${n.type === 'success' ? 'bg-green-500' : n.type === 'alert' ? 'bg-red-500' : 'bg-primary'}`} />
                      {n.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{n.message}</p>
                    <p className="text-[9px] text-muted-foreground/60">{new Date(n.timestamp).toLocaleTimeString()}</p>
                  </div>
                  {!n.read && (
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}>
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-muted-foreground text-xs italic">
                No activity resonance detected yet.
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
