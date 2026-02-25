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
