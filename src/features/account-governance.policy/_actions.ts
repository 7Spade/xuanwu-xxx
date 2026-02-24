'use server';

/**
 * account-governance.policy — _actions.ts
 *
 * Server actions for account-level policy management.
 *
 * Per logic-overview.v3.md:
 *   ACCOUNT_POLICY → CUSTOM_CLAIMS
 *   Policy changes are account-scoped; CUSTOM_CLAIMS refresh is triggered downstream
 *   by account governance logic (not via org event bus — this is an account-level BC).
 *
 * Invariant #1: This BC only writes its own aggregate.
 * Invariant #3: Application layer coordinates flow only.
 */

import { addDocument, updateDocument, deleteDocument } from '@/shared/infra/firestore/firestore.write.adapter';

export interface AccountPolicy {
  id: string;
  accountId: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRule {
  resource: string;
  actions: string[];
  effect: 'allow' | 'deny';
}

export interface CreatePolicyInput {
  accountId: string;
  name: string;
  description: string;
  rules: PolicyRule[];
}

export interface UpdatePolicyInput {
  name?: string;
  description?: string;
  rules?: PolicyRule[];
  isActive?: boolean;
}

/**
 * Creates a new account policy.
 * CUSTOM_CLAIMS refresh is triggered by the governance layer reading updated policies.
 */
export async function createAccountPolicy(input: CreatePolicyInput): Promise<string> {
  const now = new Date().toISOString();
  const ref = await addDocument<Omit<AccountPolicy, 'id'>>(
    `accountPolicies`,
    {
      accountId: input.accountId,
      name: input.name,
      description: input.description,
      rules: input.rules,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }
  );
  return ref.id;
}

/**
 * Updates an existing account policy.
 */
export async function updateAccountPolicy(
  policyId: string,
  input: UpdatePolicyInput
): Promise<void> {
  await updateDocument(`accountPolicies/${policyId}`, {
    ...input,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Deletes an account policy.
 */
export async function deleteAccountPolicy(policyId: string): Promise<void> {
  await deleteDocument(`accountPolicies/${policyId}`);
}
