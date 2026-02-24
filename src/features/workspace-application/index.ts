// workspace-application — Command Handler · Scope Guard · Policy Engine · Transaction Runner · Outbox
export { executeCommand, type WorkspaceCommand, type CommandResult } from './_command-handler'
export { checkWorkspaceAccess, type ScopeGuardResult } from './_scope-guard'
export { evaluatePolicy, type WorkspaceRole, type PolicyDecision } from './_policy-engine'
export { runTransaction, type TransactionContext, type TransactionResult } from './_transaction-runner'
export { createOutbox, type Outbox, type OutboxEvent } from './_outbox'
