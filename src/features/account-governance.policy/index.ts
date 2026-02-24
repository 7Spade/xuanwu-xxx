/**
 * account-governance.policy — Public API
 *
 * Account-level policy management. Policy changes trigger CUSTOM_CLAIMS refresh
 * downstream via account governance logic.
 *
 * Per logic-overview.v3.md: ACCOUNT_POLICY → CUSTOM_CLAIMS
 */

export {
  createAccountPolicy,
  updateAccountPolicy,
  deleteAccountPolicy,
} from './_actions';
export type { AccountPolicy, PolicyRule, CreatePolicyInput, UpdatePolicyInput } from './_actions';

export { getAccountPolicy, subscribeToAccountPolicies, getActiveAccountPolicies } from './_queries';

export { useAccountPolicy } from './_hooks/use-account-policy';
