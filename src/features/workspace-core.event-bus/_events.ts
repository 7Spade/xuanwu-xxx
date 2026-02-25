// [職責] 事件名稱與 Payload 的 TypeScript 類型定義 (Contract)
import type { WorkspaceTask, DailyLog } from "@/shared/types"
import type { SkillRequirement } from "@/shared/types"

// WorkspaceScheduleProposedPayload is a cross-BC contract — defined in shared-kernel.
// Imported for local use (WorkspaceEventPayloadMap) and re-exported for consumers
// that import from workspace-core.event-bus.
import type { WorkspaceScheduleProposedPayload } from '@/shared-kernel/workforce/schedule-proposed-payload';
export type { WorkspaceScheduleProposedPayload } from '@/shared-kernel/workforce/schedule-proposed-payload';

// =================================================================
// == Payload Interfaces
// =================================================================

export interface WorkspaceTaskCompletedPayload {
  task: WorkspaceTask
}

export interface WorkspaceTaskScheduleRequestedPayload {
  taskName: string
}

export interface QualityAssuranceRejectedPayload {
  task: WorkspaceTask
  rejectedBy: string
}

export interface WorkspaceAcceptanceFailedPayload {
  task: WorkspaceTask
  rejectedBy: string
}

export interface WorkspaceQualityAssuranceApprovedPayload {
  task: WorkspaceTask
  approvedBy: string
}

export interface WorkspaceAcceptancePassedPayload {
  task: WorkspaceTask
  acceptedBy: string
}

export interface DocumentParserItemsExtractedPayload {
  sourceDocument: string
  intentId: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    discount?: number
    subtotal: number
  }>
  /** Skill requirements extracted from the document, forwarded to schedule proposals. */
  skillRequirements?: SkillRequirement[]
}

export interface DailyLogForwardRequestedPayload {
  log: DailyLog
  targetCapability: "tasks" | "issues"
  action: "create"
}

export interface FileSendToParserPayload {
  fileName: string
  downloadURL: string
  fileType: string
  /** The WorkspaceFile document ID — used by the parser to record a SourcePointer in ParsingIntent. */
  fileId?: string
}

export interface WorkspaceIssueResolvedPayload {
  issueId: string
  issueTitle: string
  resolvedBy: string
  /** SourcePointer: ID of the A-track task to unblock after resolution (Discrete Recovery). */
  sourceTaskId?: string
}

export interface WorkspaceFinanceDisbursementFailedPayload {
  taskId: string
  taskTitle: string
  amount: number
  reason: string
}

export interface WorkspaceTaskBlockedPayload {
  task: WorkspaceTask
  reason?: string
}

export interface WorkspaceTaskAssignedPayload {
  taskId: string
  taskName: string
  /** Branded assignee account ID */
  assigneeId: string
  workspaceId: string
  /** SourcePointer: the IntentID that originated this task, if any. */
  sourceIntentId?: string
}

// =================================================================
// Event Name Registry (Discriminated Union)
// =================================================================

export type WorkspaceEventName =
  | "workspace:tasks:completed"
  | "workspace:tasks:scheduleRequested"
  | "workspace:tasks:blocked"
  | "workspace:tasks:assigned"
  | "workspace:schedule:proposed"
  | "workspace:quality-assurance:rejected"
  | "workspace:acceptance:failed"
  | "workspace:quality-assurance:approved"
  | "workspace:acceptance:passed"
  | "workspace:document-parser:itemsExtracted"
  | "workspace:files:sendToParser"
  | "workspace:issues:resolved"
  | "workspace:finance:disburseFailed"
  | "daily:log:forwardRequested"

// =================================================================
// Event-to-Payload Mapping (Type-Safe Constraint)
// =================================================================

export interface WorkspaceEventPayloadMap {
  "workspace:tasks:completed": WorkspaceTaskCompletedPayload
  "workspace:tasks:scheduleRequested": WorkspaceTaskScheduleRequestedPayload
  "workspace:tasks:blocked": WorkspaceTaskBlockedPayload
  "workspace:tasks:assigned": WorkspaceTaskAssignedPayload
  "workspace:schedule:proposed": WorkspaceScheduleProposedPayload
  "workspace:quality-assurance:rejected": QualityAssuranceRejectedPayload
  "workspace:acceptance:failed": WorkspaceAcceptanceFailedPayload
  "workspace:quality-assurance:approved": WorkspaceQualityAssuranceApprovedPayload
  "workspace:acceptance:passed": WorkspaceAcceptancePassedPayload
  "workspace:document-parser:itemsExtracted": DocumentParserItemsExtractedPayload
  "workspace:files:sendToParser": FileSendToParserPayload
  "workspace:issues:resolved": WorkspaceIssueResolvedPayload
  "workspace:finance:disburseFailed": WorkspaceFinanceDisbursementFailedPayload
  "daily:log:forwardRequested": DailyLogForwardRequestedPayload
}

export type WorkspaceEventPayload<T extends WorkspaceEventName> =
  WorkspaceEventPayloadMap[T]

// =================================================================
// Handler and Function Type Definitions
// =================================================================

export type WorkspaceEventHandler<T extends WorkspaceEventName> = (
  payload: WorkspaceEventPayload<T>
) => Promise<void> | void

export type PublishFn = <T extends WorkspaceEventName>(
  type: T,
  payload: WorkspaceEventPayload<T>
) => void

export type SubscribeFn = <T extends WorkspaceEventName>(
  type: T,
  handler: WorkspaceEventHandler<T>
) => () => void // Returns an unsubscribe function
