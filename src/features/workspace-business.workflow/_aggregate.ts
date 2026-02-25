export type WorkflowStage =
  | 'tasks'
  | 'quality-assurance'
  | 'acceptance'
  | 'finance';

export interface WorkflowAggregateState {
  workflowId: string;
  workspaceId: string;
  stage: WorkflowStage;
  blockedIssueId?: string;
  version: number;
  updatedAt: number;
}

export const WORKFLOW_STAGE_ORDER: readonly WorkflowStage[] = [
  'tasks',
  'quality-assurance',
  'acceptance',
  'finance',
] as const;

export function createWorkflowAggregate(
  workspaceId: string,
  workflowId: string
): WorkflowAggregateState {
  const now = Date.now();
  return {
    workflowId,
    workspaceId,
    stage: 'tasks',
    version: 1,
    updatedAt: now,
  };
}

export function canAdvanceWorkflowStage(
  current: WorkflowStage,
  next: WorkflowStage
): boolean {
  const currentIndex = WORKFLOW_STAGE_ORDER.indexOf(current);
  const nextIndex = WORKFLOW_STAGE_ORDER.indexOf(next);
  return currentIndex >= 0 && nextIndex === currentIndex + 1;
}

export function advanceWorkflowStage(
  state: WorkflowAggregateState,
  next: WorkflowStage
): WorkflowAggregateState {
  if (!canAdvanceWorkflowStage(state.stage, next)) {
    throw new Error(
      `Invalid workflow transition: ${state.stage} -> ${next}`
    );
  }

  return {
    ...state,
    stage: next,
    blockedIssueId: undefined,
    version: state.version + 1,
    updatedAt: Date.now(),
  };
}

/**
 * Blocks the workflow aggregate, associating the blocking B-track issue.
 *
 * Per logic-overview.v3.md (A3 + AB dual-track):
 * - A-track stages flow to TRACK_B_ISSUES on anomaly.
 * - WORKFLOW_AGGREGATE holds `blockedIssueId` as the single blocking reference.
 * - Unblock is triggered by `workspace:issues:resolved` event (Discrete Recovery Principle).
 *
 * Invariant A8: Transaction Runner guarantees single-aggregate atomicity per command.
 */
export function blockWorkflow(
  state: WorkflowAggregateState,
  issueId: string
): WorkflowAggregateState {
  return {
    ...state,
    blockedIssueId: issueId,
    version: state.version + 1,
    updatedAt: Date.now(),
  };
}

/**
 * Unblocks the workflow aggregate after the associated B-track issue is resolved.
 *
 * Per logic-overview.v3.md:
 *   TRACK_B_ISSUES →|IssueResolved 事件| WORKSPACE_EVENT_BUS
 *   A 軌自行訂閱後恢復（不直接回流）— Discrete Recovery Principle.
 *
 * Only unblocks if the resolved issue matches the current `blockedIssueId`.
 * Returns the original state unchanged when there is no matching block.
 */
export function unblockWorkflow(
  state: WorkflowAggregateState,
  resolvedIssueId: string
): WorkflowAggregateState {
  if (state.blockedIssueId !== resolvedIssueId) {
    return state;
  }
  return {
    ...state,
    blockedIssueId: undefined,
    version: state.version + 1,
    updatedAt: Date.now(),
  };
}
