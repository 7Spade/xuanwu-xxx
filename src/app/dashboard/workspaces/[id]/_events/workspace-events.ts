// [職責] 事件名稱與 Payload 的 TypeScript 類型定義 (Contract)
import type { WorkspaceTask, DailyLog } from '@/types/domain';

// =================================================================
// == Payload Interfaces
// =================================================================

export interface WorkspaceTaskCompletedPayload {
  task: WorkspaceTask;
}

export interface WorkspaceTaskScheduleRequestedPayload {
  taskName: string;
}

export interface QARejectedPayload {
  task: WorkspaceTask;
  rejectedBy: string;
}

export interface WorkspaceAcceptanceFailedPayload {
  task: WorkspaceTask;
  rejectedBy: string;
}

export interface WorkspaceQAApprovedPayload {
  task: WorkspaceTask;
  approvedBy: string;
}

export interface WorkspaceAcceptancePassedPayload {
  task: WorkspaceTask;
  acceptedBy: string;
}

export interface DocumentParserItemsExtractedPayload {
  sourceDocument: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    subtotal: number;
  }>;
}

export interface DailyLogForwardRequestedPayload {
    log: DailyLog;
    targetCapability: 'tasks' | 'issues';
    action: 'create';
}

// =================================================================
// Event Name Registry (Discriminated Union)
// =================================================================

export type WorkspaceEventName =
  | 'workspace:tasks:completed'
  | 'workspace:tasks:scheduleRequested'
  | 'workspace:qa:rejected'
  | 'workspace:acceptance:failed'
  | 'workspace:qa:approved'
  | 'workspace:acceptance:passed'
  | 'workspace:document-parser:itemsExtracted'
  | 'daily:log:forwardRequested';

// =================================================================
// Event-to-Payload Mapping (Type-Safe Constraint)
// =================================================================

export interface WorkspaceEventPayloadMap {
  'workspace:tasks:completed': WorkspaceTaskCompletedPayload;
  'workspace:tasks:scheduleRequested': WorkspaceTaskScheduleRequestedPayload;
  'workspace:qa:rejected': QARejectedPayload;
  'workspace:acceptance:failed': WorkspaceAcceptanceFailedPayload;
  'workspace:qa:approved': WorkspaceQAApprovedPayload;
  'workspace:acceptance:passed': WorkspaceAcceptancePassedPayload;
  'workspace:document-parser:itemsExtracted': DocumentParserItemsExtractedPayload;
  'daily:log:forwardRequested': DailyLogForwardRequestedPayload;
}

export type WorkspaceEventPayload<T extends WorkspaceEventName> =
  WorkspaceEventPayloadMap[T];

// =================================================================
// Handler and Function Type Definitions
// =================================================================

export type WorkspaceEventHandler<T extends WorkspaceEventName> = (
  payload: WorkspaceEventPayload<T>
) => Promise<void> | void;

export type PublishFn = <T extends WorkspaceEventName>(
  type: T,
  payload: WorkspaceEventPayload<T>
) => void;

export type SubscribeFn = <T extends WorkspaceEventName>(
  type: T,
  handler: (payload: WorkspaceEventPayloadMap[T]) => void
) => () => void; // Returns an unsubscribe function
