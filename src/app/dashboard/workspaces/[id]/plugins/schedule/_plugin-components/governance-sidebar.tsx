// @/app/dashboard/workspaces/[id]/plugins/schedule/_route-components/governance-sidebar.tsx
"use client";

import { ScheduleItem } from "@/domain-types/domain";
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
    <Card className="h-full border-none rounded-none shadow-none flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="text-sm font-bold uppercase tracking-widest">
          Pending Proposals ({proposals.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {proposals.map(item => (
              <div key={item.id} className="p-3 rounded-lg border bg-background space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold">{item.title}</p>
                    <Badge variant="outline" className="text-[9px] mt-1">{item.workspaceName}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onReject(item)}>
                      <X className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => onApprove(item)}>
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {proposals.length === 0 && (
              <div className="text-center py-12 text-xs text-muted-foreground italic">
                No pending proposals.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
