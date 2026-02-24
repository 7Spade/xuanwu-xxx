// [職責] 監聽事件並執行副作用 (The Orchestrator)
"use client";
import { useEffect } from "react";
import { useWorkspace } from '../_components/workspace-provider';
import { useApp } from './use-app';
import { toast } from "@/shared/utility-hooks/use-toast";
import { ToastAction } from "@/shared/shadcn-ui/toast";
import type { WorkspaceTask } from "@/shared/types";
import { createIssue } from "@/features/workspace-business.issues";
import { createScheduleItem } from "@/features/workspace-business.schedule";
import { batchImportTasks } from "@/features/workspace-business.tasks";
import { markParsingIntentImported } from "@/features/workspace-business.document-parser";
import { Timestamp } from "firebase/firestore";

type DocParserPayload = {
  sourceDocument: string;
  intentId: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    subtotal: number;
  }>;
};

/**
 * useWorkspaceEventHandler — side-effect hook (no render output).
 * Call inside any Client Component that is a descendant of WorkspaceProvider.
 * Subscribes to workspace-level events and orchestrates cross-capability reactions.
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
      "workspace:quality-assurance:approved",
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

    const unsubQualityAssuranceRejected = eventBus.subscribe(
      "workspace:quality-assurance:rejected",
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

    const handleImport = (payload: DocParserPayload) => {
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
            sourceIntentId: payload.intentId,
          }));

        batchImportTasks(workspace.id, items)
          .then(async () => {
            await markParsingIntentImported(workspace.id, payload.intentId).catch(
              (err: unknown) => console.error("Failed to mark intent imported:", err)
            );
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
      "workspace:tasks:scheduleRequested",
      (payload) => {
        dispatch({
          type: "REQUEST_SCHEDULE_TASK",
          payload: {
            taskName: payload.taskName,
            workspaceId: workspace.id,
          },
        });
      }
    );

    const unsubTaskCompleted = eventBus.subscribe(
      "workspace:tasks:completed",
      async (payload) => {
        if (!workspace.dimensionId) return;
        try {
          await createScheduleItem({
            accountId: workspace.dimensionId,
            workspaceId: workspace.id,
            workspaceName: workspace.name,
            title: `Review: ${payload.task.name}`,
            startDate: Timestamp.fromDate(new Date()),
            endDate: Timestamp.fromDate(new Date()),
            status: "PROPOSAL",
            originType: "TASK_AUTOMATION",
            originTaskId: payload.task.id,
            assigneeIds: [],
          });

          toast({
            title: "Schedule Request Created",
            description: `A proposal for "${payload.task.name}" has been sent to the organization for approval.`,
          });
          logAuditEvent(
            "Auto-Generated Schedule Proposal",
            `From task: ${payload.task.name}`,
            "create"
          );
        } catch (error) {
          console.error("Failed to create schedule proposal:", error);
          toast({
            variant: "destructive",
            title: "Proposal Creation Failed",
            description:
              error instanceof Error
                ? error.message
                : "An unknown error occurred.",
          });
        }
      }
    );

    const unsubForwardRequested = eventBus.subscribe(
      "daily:log:forwardRequested",
      (payload) => {
        toast({
          title: "Forward Action Triggered",
          description: `Received request to forward log to the '${payload.targetCapability}' capability.`,
        });
      }
    );

    const unsubIssueResolved = eventBus.subscribe(
      "workspace:issues:resolved",
      (payload) => {
        pushNotification(
          "B-Track Issue Resolved",
          `Issue "${payload.issueTitle}" closed by ${payload.resolvedBy}. A-Track may now resume.`,
          "success"
        );
      }
    );

    // TRACK_A_FINANCE -->|異常| TRACK_B_ISSUES
    const unsubFinanceFailed = eventBus.subscribe(
      "workspace:finance:disburseFailed",
      async (payload) => {
        await createIssue(
          workspace.id,
          `Disbursement Failed: ${payload.taskTitle}`,
          "financial",
          "high"
        );
        pushNotification(
          "Finance Failure & Issue Logged",
          `Disbursement for "${payload.taskTitle}" failed. A financial issue has been created.`,
          "alert"
        );
      }
    );

    // TRACK_A_TASKS -->|異常| TRACK_B_ISSUES
    const unsubTaskBlocked = eventBus.subscribe(
      "workspace:tasks:blocked",
      async (payload) => {
        await createIssue(
          workspace.id,
          `Task Blocked: ${payload.task.name}`,
          "technical",
          "high"
        );
        pushNotification(
          "Task Blocked & Issue Logged",
          `Task "${payload.task.name}" is blocked. A B-track issue has been created.`,
          "alert"
        );
      }
    );

    return () => {
      unsubQAApproved();
      unsubAcceptancePassed();
      unsubQualityAssuranceRejected();
      unsubAcceptanceFailed();
      unsubDocParse();
      unsubScheduleRequest();
      unsubTaskCompleted();
      unsubForwardRequested();
      unsubIssueResolved();
      unsubFinanceFailed();
      unsubTaskBlocked();
    };
  }, [eventBus, dispatch, workspace.id, workspace.dimensionId, workspace.name, logAuditEvent]);
}
