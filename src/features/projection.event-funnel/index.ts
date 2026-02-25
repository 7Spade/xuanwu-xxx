/**
 * projection.event-funnel — Public API
 *
 * EVENT_FUNNEL_INPUT: the Projection Layer's only external entry point.
 *
 * Per logic-overview_v5.md (VS8 Projection Bus):
 *   WORKSPACE_EVENT_BUS + ORGANIZATION_EVENT_BUS + TAG_LIFECYCLE_BUS → EVENT_FUNNEL_INPUT → all projections
 *
 * Usage: call once at app startup:
 *   const unsubWorkspace = registerWorkspaceFunnel(eventBus);
 *   const unsubOrg = registerOrganizationFunnel();
 *   const unsubTag = registerTagFunnel();
 */
export {
  registerWorkspaceFunnel,
  registerOrganizationFunnel,
  registerTagFunnel,
  replayWorkspaceProjections,
} from './_funnel';
