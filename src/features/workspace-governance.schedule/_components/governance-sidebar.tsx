"use client";

import { type ScheduleItem } from "@/shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/shadcn-ui/card";
import { ScrollArea } from "@/shared/shadcn-ui/scroll-area";
import { Button } from "@/shared/shadcn-ui/button";
import { Badge } from "@/shared/shadcn-ui/badge";
import { Check, X } from "lucide-react";

interface GovernanceSidebarProps {
  proposals: ScheduleItem[];
  onApprove: (item: ScheduleItem) => void;
  onReject: (item: ScheduleItem) => void;
}

/**
 * @fileoverview GovernanceSidebar - A dedicated component for displaying and acting on pending proposals.
 * @description This component is now a "dumb" component, receiving data and callbacks
 * via props. It is responsible for rendering the list of pending schedule items and
 * delegating approval/rejection actions to its parent.
 */
export function GovernanceSidebar({ proposals, onApprove, onReject }: GovernanceSidebarProps) {
  return (
    <Card className="flex h-full flex-col rounded-none border-none shadow-none">
      <CardHeader className="border-b">
        <CardTitle className="text-sm font-bold uppercase tracking-widest">
          Pending Proposals ({proposals.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="space-y-3 p-4">
            {proposals.map(item => (
              <div key={item.id} className="space-y-2 rounded-lg border bg-background p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold">{item.title}</p>
                    <Badge variant="outline" className="mt-1 text-[9px]">{item.workspaceName}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => onReject(item)}>
                      <X className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-7 text-green-600" onClick={() => onApprove(item)}>
                      <Check className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {proposals.length === 0 && (
              <div className="py-12 text-center text-xs italic text-muted-foreground">
                No pending proposals.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
