// Event bus engine
export { WorkspaceEventBus } from './_bus'
// Event types and payload contracts
export type {
  WorkspaceEventName,
  WorkspaceEventHandler,
  PublishFn,
  SubscribeFn,
  WorkspaceEventPayloadMap,
  WorkspaceEventPayload,
  WorkspaceTaskCompletedPayload,
  WorkspaceTaskScheduleRequestedPayload,
  QARejectedPayload,
  WorkspaceAcceptanceFailedPayload,
  WorkspaceQAApprovedPayload,
  WorkspaceAcceptancePassedPayload,
  DocumentParserItemsExtractedPayload,
  DailyLogForwardRequestedPayload,
} from './_events'
// Context and hook for consuming the event bus
export { WorkspaceEventContext, useWorkspaceEvents } from './_context'
export type { WorkspaceEventContextType } from './_context'
