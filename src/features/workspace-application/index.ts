// workspace-application — Command Handler · Scope Guard · Policy Engine · Transaction Runner · Outbox · Org Policy Cache
export { executeCommand, type WorkspaceCommand, type CommandResult } from './_command-handler'
export { checkWorkspaceAccess, type ScopeGuardResult } from './_scope-guard'
export { evaluatePolicy, type WorkspaceRole, type PolicyDecision } from './_policy-engine'
export { runTransaction, type TransactionContext, type TransactionResult } from './_transaction-runner'
export { createOutbox, type Outbox, type OutboxEvent } from './_outbox'
export {
  registerOrgPolicyCache,
  getCachedOrgPolicy,
  getAllCachedPolicies,
  clearOrgPolicyCache,
  type OrgPolicyEntry,
} from './_org-policy-cache'
