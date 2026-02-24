/**
 * projection.workspace-view — Public API
 *
 * Workspace read model (workspace projection view).
 * Fed by EVENT_FUNNEL_INPUT from workspace domain events.
 *
 * Per logic-overview.v3.md:
 *   EVENT_FUNNEL_INPUT → WORKSPACE_PROJECTION_VIEW
 */

export { getWorkspaceView, getWorkspaceCapabilities } from './_queries';
export { projectWorkspaceSnapshot, applyCapabilityUpdate } from './_projector';
export type { WorkspaceViewRecord } from './_projector';
