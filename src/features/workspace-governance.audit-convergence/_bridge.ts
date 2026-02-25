export interface AuditConvergenceInput {
  accountId: string;
  workspaceId?: string;
  limit?: number;
}

export interface AuditProjectionQuery {
  accountId: string;
  workspaceId?: string;
  limit: number;
}

export const DEFAULT_AUDIT_QUERY_LIMIT = 50;
const MIN_AUDIT_QUERY_LIMIT = 1;
const MAX_AUDIT_QUERY_LIMIT = 200;

function normalizeAuditLimit(limit?: number): number {
  if (typeof limit !== 'number' || Number.isNaN(limit)) {
    return DEFAULT_AUDIT_QUERY_LIMIT;
  }

  return Math.max(
    MIN_AUDIT_QUERY_LIMIT,
    Math.min(MAX_AUDIT_QUERY_LIMIT, Math.trunc(limit))
  );
}

export function toAuditProjectionQuery(
  input: AuditConvergenceInput
): AuditProjectionQuery {
  return {
    accountId: input.accountId,
    workspaceId: input.workspaceId,
    limit: normalizeAuditLimit(input.limit),
  };
}
