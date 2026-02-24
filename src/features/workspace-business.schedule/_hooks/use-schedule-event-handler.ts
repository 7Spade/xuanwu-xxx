// [職責] W_B_SCHEDULE — B 軌 IssueResolved 事件訂閱（離散恢復原則）
"use client";

import { useEffect } from "react";
import { useWorkspace } from "@/features/workspace-core";
import { toast } from "@/shared/utility-hooks/use-toast";

/**
 * Subscribes to B-track `IssueResolved` events via the workspace event bus.
 *
 * Per logic-overview.v3.md (AB dual-track discrete recovery):
 *   TRACK_B_ISSUES →|IssueResolved 事件| WORKSPACE_EVENT_BUS
 *   W_B_SCHEDULE subscribes (not direct coupling) and may resume blocked items.
 *
 * Invariant #2: cross-BC communication only via Event/Projection — no direct dependency
 * on TRACK_B_ISSUES internals.
 */
export function useScheduleEventHandler() {
  const { eventBus } = useWorkspace();

  useEffect(() => {
    const unsubIssueResolved = eventBus.subscribe(
      "workspace:issues:resolved",
      (payload) => {
        // Discrete recovery: notify the schedule layer that an issue is resolved.
        // Schedule items that were blocked pending this resolution may now proceed.
        toast({
          title: "Schedule Recovery Available",
          description: `Issue "${payload.issueTitle}" resolved by ${payload.resolvedBy}. Review any blocked schedule items.`,
        });
      }
    );

    return () => {
      unsubIssueResolved();
    };
  }, [eventBus]);
}
