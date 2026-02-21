/**
 * @fileoverview share-button.tsx - A self-contained component for the "share/forward" action.
 * @description This component encapsulates all UI (a dropdown menu) and logic for
 * forwarding a daily log to other parts of the application via the event bus,
 * adhering to the single-responsibility principle.
 */
"use client";

import { useWorkspace } from "@/features/workspace-core";
import { type DailyLog } from "@/shared/types";
import { Button } from "@/shared/shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/shadcn-ui/dropdown-menu";
import { Share2 } from "lucide-react";
import { toast } from "@/shared/utility-hooks/use-toast";

interface ShareButtonProps {
  log: DailyLog;
}

export function ShareButton({ log }: ShareButtonProps) {
  const { eventBus } = useWorkspace();

  const handleForward = (target: "tasks") => {
    if (!eventBus) {
        toast({
            variant: "destructive",
            title: "Action Failed",
            description: "Event bus is not available in this context.",
        });
        return;
    }

    eventBus.publish("daily:log:forwardRequested", {
      log: log,
      targetCapability: target,
      action: "create",
    });

    toast({
      title: "Forward Action Triggered",
      description: `Request sent to the '${target}' capability.`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9">
          <Share2 className="size-5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => handleForward("tasks")}>
          Create Task from this Log
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
