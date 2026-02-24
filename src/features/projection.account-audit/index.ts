/**
 * projection.account-audit — Public API
 *
 * Account audit projection.
 * Fed by EVENT_FUNNEL_INPUT.
 *
 * Per logic-overview.v3.md:
 *   EVENT_FUNNEL_INPUT → ACCOUNT_PROJECTION_AUDIT
 */

export { getAccountAuditEntries } from './_queries';
export { appendAuditEntry } from './_projector';
export type { AuditProjectionEntry } from './_projector';
