/**
 * projection.event-funnel — Public API
 *
 * EVENT_FUNNEL_INPUT: the Projection Layer's only external entry point.
 *
 * Per logic-overview.v3.md (PROJECTION_LAYER subgraph):
 *   WORKSPACE_EVENT_BUS + ORGANIZATION_EVENT_BUS → EVENT_FUNNEL_INPUT → all projections
 *
 * Usage: call once at app startup in workspace-provider.tsx:
 *   const unsubWorkspace = registerWorkspaceFunnel(eventBus);
 *   const unsubOrg = registerOrganizationFunnel();
 */
export {
  registerWorkspaceFunnel,
  registerOrganizationFunnel,
  replayWorkspaceProjections,
} from './_funnel';
