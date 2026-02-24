/**
 * projection.organization-view — Public API
 *
 * Organization projection read model.
 * Fed by EVENT_FUNNEL_INPUT from organization events.
 *
 * Per logic-overview.v3.md:
 *   EVENT_FUNNEL_INPUT → ORGANIZATION_PROJECTION_VIEW
 */

export { getOrganizationView, getOrganizationMemberIds } from './_queries';
export { projectOrganizationSnapshot, applyMemberJoined, applyMemberLeft } from './_projector';
export type { OrganizationViewRecord } from './_projector';
