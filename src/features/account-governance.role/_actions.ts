'use server';

/**
 * account-governance.role — _actions.ts
 *
 * Server actions for account role management.
 *
 * Per logic-overview.v3.md:
 *   ACCOUNT_ROLE → CUSTOM_CLAIMS
 *   Role changes trigger CUSTOM_CLAIMS refresh.
 *
 * Invariants:
 *   #1 — This BC only writes its own aggregate.
 *   #5 — Custom Claims are a permission cache, not the source of truth.
 */

import { setDocument, updateDocument } from '@/shared/infra/firestore/firestore.write.adapter';
import { publishOrgEvent } from '@/features/account-organization.event-bus';
import type { OrganizationRole } from '@/shared/types';

export interface AccountRoleRecord {
  accountId: string;
  orgId: string;
  role: OrganizationRole;
  grantedBy: string;
  grantedAt: string;
  revokedAt?: string;
  isActive: boolean;
}

export interface AssignRoleInput {
  accountId: string;
  orgId: string;
  role: OrganizationRole;
  grantedBy: string;
}

/**
 * Assigns an org-level role to an account.
 * Publishes OrgMemberJoined event downstream — triggers CUSTOM_CLAIMS refresh.
 */
export async function assignAccountRole(input: AssignRoleInput): Promise<void> {
  const record: AccountRoleRecord = {
    accountId: input.accountId,
    orgId: input.orgId,
    role: input.role,
    grantedBy: input.grantedBy,
    grantedAt: new Date().toISOString(),
    isActive: true,
  };

  await setDocument(
    `accountRoles/${input.orgId}_${input.accountId}`,
    record
  );

  await publishOrgEvent('organization:member:joined', {
    orgId: input.orgId,
    accountId: input.accountId,
    role: input.role,
    joinedBy: input.grantedBy,
  });
}

/**
 * Revokes an org-level role from an account.
 * Publishes OrgMemberLeft event downstream — triggers CUSTOM_CLAIMS refresh.
 */
export async function revokeAccountRole(
  accountId: string,
  orgId: string,
  revokedBy: string
): Promise<void> {
  await updateDocument(`accountRoles/${orgId}_${accountId}`, {
    isActive: false,
    revokedAt: new Date().toISOString(),
  });

  await publishOrgEvent('organization:member:left', {
    orgId,
    accountId,
    removedBy: revokedBy,
  });
}
