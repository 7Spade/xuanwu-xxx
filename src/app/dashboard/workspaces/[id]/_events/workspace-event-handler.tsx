// [職責] 監聽事件並執行副作用 (The Orchestrator)
"use client";
import { useEffect } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { useApp } from "@/hooks/state/use-app";
import { toast } from "@/shared/hooks/use-toast";
import { ToastAction } from "@/shared/ui/toast";
import type { WorkspaceEventPayloadMap } from "@/features/workspace/event-bus/workspace-events";
import { WorkspaceTask } from "@/types/domain";
import { createIssue } from "@/actions/issue";
import { createScheduleItem } from "@/actions/schedule";
import { batchImportTasks } from "@/actions/task";

/**
 * @fileoverview Global event handler for workspace-level events.
 *
 * ARCHITECTURAL ROLE: Cross-Capability Orchestration
 * This component acts as a central Observer that subscribes to multiple workspace events.
 * It coordinates system-wide reactions without coupling capabilities to each other.
 */
/**
 * useWorkspaceEventHandler — side-effect hook (no render output).
 * Call this inside any Client Component that is a descendant of WorkspaceProvider.
 * Converts from a render-null component to a hook to eliminate the
 * context → app/ layer violation in workspace-context.tsx.
 */
export function useWorkspaceEventHandler() {
  const { eventBus, workspace, logAuditEvent } = useWorkspace();
  const { dispatch } = useApp();

  useEffect(() => {
    const pushNotification = (
      title: string,
      message: string,
      type: "info" | "success" | "alert"
    ) => {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: { title, message, type },
      });
    };

    const unsubQAApproved = eventBus.subscribe(
      "workspace:qa:approved",
      (payload) => {
        pushNotification(
          "QA Approved",
          `Task "${payload.task.name}" is now ready for final acceptance.`,
          "info"
        );
      }
    );

    const unsubAcceptancePassed = eventBus.subscribe(
      "workspace:acceptance:passed",
      (payload) => {
        pushNotification(
          "Task Accepted",
          `Task "${payload.task.name}" is now ready for financial settlement.`,
          "success"
        );
      }
    );

    const unsubQARejected = eventBus.subscribe(
      "workspace:qa:rejected",
      async (payload) => {
        await createIssue(
          workspace.id,
          `QA Rejected: ${payload.task.name}`,
          "technical",
          "high"
        );
        pushNotification(
          "QA Rejected & Issue Logged",
          `Task "${payload.task.name}" was sent back. An issue has been automatically created.`,
          "alert"
        );
      }
    );

    const unsubAcceptanceFailed = eventBus.subscribe(
      "workspace:acceptance:failed",
      async (payload) => {
        await createIssue(
          workspace.id,
          `Acceptance Failed: ${payload.task.name}`,
          "technical",
          "high"
        );
        pushNotification(
          "Acceptance Failed & Issue Logged",
          `Task "${payload.task.name}" was sent back. An issue has been automatically created.`,
          "alert"
        );
      }
    );

    const handleImport = (
      payload: WorkspaceEventPayloadMap["workspace:document-parser:itemsExtracted"]
    ) => {
      const importItems = () => {
        toast({
          title: "Importing items...",
          description: "Please wait a moment.",
        });

        const items: Omit<WorkspaceTask, "id" | "createdAt" | "updatedAt">[] =
          payload.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            subtotal: item.subtotal,
            progress: 0,
            type: "Imported",
            priority: "medium",
            progressState: "todo",
          }));

        batchImportTasks(workspace.id, items)
          .then(() => {
            toast({
              title: "Import Successful",
              description: `${payload.items.length} tasks have been added.`,
            });
            logAuditEvent(
              "Imported Tasks",
              `Imported ${payload.items.length} items from ${payload.sourceDocument}`,
              "create"
            );
          })
          .catch((error: unknown) => {
            const message =
              error instanceof Error ? error.message : "Import failed";
            toast({
              variant: "destructive",
              title: "Import Failed",
              description: message,
            });
          });
      };

      toast({
        title: `Found ${payload.items.length} items from "${payload.sourceDocument}".`,
        description: "Do you want to import them as new root tasks?",
        duration: 10000,
        action: (
          <ToastAction altText="Import" onClick={importItems}>
            Import
          </ToastAction>
        ),
      });
    };

    const unsubDocParse = eventBus.subscribe(
      "workspace:document-parser:itemsExtracted",
      handleImport
    );
    
    const unsubScheduleRequest = eventBus.subscribe(
        'workspace:tasks:scheduleRequested',
        (payload) => {
            dispatch({
                type: 'REQUEST_SCHEDULE_TASK',
                payload: {
                    taskName: payload.taskName,
                    workspaceId: workspace.id,
                }
            });
        }
    );
    
    const unsubTaskCompleted = eventBus.subscribe(
      'workspace:tasks:completed',
      async (payload) => {
        if (!workspace.dimensionId) return;
        try {
          await createScheduleItem({
            accountId: workspace.dimensionId,
            workspaceId: workspace.id,
            workspaceName: workspace.name,
            title: `Review: ${payload.task.name}`,
            startDate: new Date(),
            endDate: new Date(),
            status: 'PROPOSAL',
            originType: 'TASK_AUTOMATION',
            originTaskId: payload.task.id,
            assigneeIds: [],
          });
          
          toast({ 
            title: "Schedule Request Created", 
            description: `A proposal for "${payload.task.name}" has been sent to the organization for approval.`
          });
          logAuditEvent("Auto-Generated Schedule Proposal", `From task: ${payload.task.name}`, "create");
        } catch (error) {
           console.error("Failed to create schedule proposal:", error);
           toast({
             variant: "destructive",
             title: "Proposal Creation Failed",
             description: error instanceof Error ? error.message : "An unknown error occurred.",
           });
        }
      }
    );

    const unsubForwardRequested = eventBus.subscribe(
      'daily:log:forwardRequested',
      (payload) => {
        // For now, just show a toast to confirm the event was caught.
        // In a real implementation, this would trigger a dialog or another action.
        toast({
          title: "Forward Action Triggered",
          description: `Received request to forward log to the '${payload.targetCapability}' capability.`,
        });
      }
    );


    return () => {
      unsubQAApproved();
      unsubAcceptancePassed();
      unsubQARejected();
      unsubAcceptanceFailed();
      unsubDocParse();
      unsubScheduleRequest();
      unsubTaskCompleted();
      unsubForwardRequested();
    };
  }, [eventBus, dispatch, workspace.id, workspace.dimensionId, workspace.name, logAuditEvent])
}
