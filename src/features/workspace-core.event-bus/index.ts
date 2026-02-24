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
  QualityAssuranceRejectedPayload,
  WorkspaceAcceptanceFailedPayload,
  WorkspaceQualityAssuranceApprovedPayload,
  WorkspaceAcceptancePassedPayload,
  DocumentParserItemsExtractedPayload,
  DailyLogForwardRequestedPayload,
  FileSendToParserPayload,
  WorkspaceIssueResolvedPayload,
  WorkspaceFinanceDisbursementFailedPayload,
  WorkspaceTaskBlockedPayload,
  WorkspaceTaskAssignedPayload,
  WorkspaceScheduleProposedPayload,
} from './_events'
// Context and hook for consuming the event bus
export { WorkspaceEventContext, useWorkspaceEvents } from './_context'
export type { WorkspaceEventContextType } from './_context'
// Event Funnel — routes events from both buses to the Projection Layer
export { registerWorkspaceFunnel, registerOrganizationFunnel, replayWorkspaceProjections } from './_event-funnel'
