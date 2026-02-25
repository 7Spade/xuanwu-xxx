# Feature Slice: `workspace-business.workflow`

## Domain

Workspace A-track workflow aggregate baseline.

This slice provides the minimal state machine boundary for:

- `tasks`
- `quality-assurance`
- `acceptance`
- `finance`

## Responsibilities

- Define workflow aggregate state shape
- Define canonical stage order
- Enforce forward-only stage transition rules

## Internal Files

| File | Purpose |
|------|---------|
| `_aggregate.ts` | Workflow aggregate state and pure transition helpers |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
export {
  WORKFLOW_STAGE_ORDER,
  createWorkflowAggregate,
  canAdvanceWorkflowStage,
  advanceWorkflowStage,
} from './_aggregate';
export type { WorkflowStage, WorkflowAggregateState } from './_aggregate';
```

## Architecture Note

Aligned with `logic-overview.v3.md` A3 intent:
`workspace-business.workflow.aggregate` is the single invariant boundary
for A-track stage progression.
