/**
 * projection.account-view — Public API
 *
 * Account read model + authority snapshot contract.
 * Implements shared-kernel.authority-snapshot (invariant #8).
 *
 * Per logic-overview.v3.md:
 *   EVENT_FUNNEL_INPUT → ACCOUNT_PROJECTION_VIEW
 *   ACCOUNT_USER_NOTIFICATION -.→ ACCOUNT_PROJECTION_VIEW (content filter)
 *   ACCOUNT_PROJECTION_VIEW -.→ shared-kernel.authority-snapshot
 */

export { getAccountView, getAccountAuthoritySnapshot, getAccountMembershipTag } from './_queries';
export { projectAccountSnapshot, applyOrgRoleChange, applyAuthoritySnapshot } from './_projector';
export type { AccountViewRecord } from './_projector';
