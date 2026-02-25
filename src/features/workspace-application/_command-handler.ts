/**
 * workspace-application/_command-handler.ts
 *
 * Primary entry point for all workspace commands.
 * Orchestrates the full command processing pipeline:
 *   ScopeGuard → PolicyEngine → TransactionRunner → Outbox flush
 *
 * Per logic-overview.v3.md:
 * - SERVER_ACTION →|發送 Command| WORKSPACE_COMMAND_HANDLER
 * - WORKSPACE_COMMAND_HANDLER → WORKSPACE_SCOPE_GUARD
 * - WORKSPACE_COMMAND_HANDLER --> TRACE_IDENTIFIER (Observability)
 * - WORKSPACE_SCOPE_GUARD → WORKSPACE_POLICY_ENGINE
 * - WORKSPACE_POLICY_ENGINE → WORKSPACE_TRANSACTION_RUNNER
 * - WORKSPACE_OUTBOX → WORKSPACE_EVENT_BUS
 * - Invariant #3: Application layer coordinates flow only — no domain rules.
 *
 * Usage example (from a Server Action or Client Action):
 * ```ts
 * const result = await executeCommand(
 *   { workspaceId, userId, action: 'tasks:create' },
 *   async (ctx) => {
 *     const id = await createTask(workspaceId, taskData);
 *     ctx.outbox.collect('workspace:tasks:completed', { task: { ...taskData, id } });
 *     return id;
 *   },
 *   publish  // WorkspaceEventBus.publish
 * );
 * ```
 */

import { checkWorkspaceAccess } from './_scope-guard';
import { evaluatePolicy, type WorkspaceRole } from './_policy-engine';
import { runTransaction, type TransactionContext } from './_transaction-runner';
import { createTraceContext, logDomainError } from '@/shared/observability';

export interface WorkspaceCommand {
  workspaceId: string;
  userId: string;
  /** Action identifier, e.g. "tasks:create", "finance:disburse", "issues:resolve" */
  action: string;
}

export interface CommandResult<T = void> {
  success: boolean;
  value?: T;
  error?: string;
}

/**
 * Executes a workspace command through the full application pipeline.
 *
 * @param command - The command metadata (workspaceId, userId, action).
 * @param handler - Domain logic to execute inside the transaction context.
 * @param publish - Optional event bus publish function for Outbox flush.
 */
export async function executeCommand<T>(
  command: WorkspaceCommand,
  handler: (ctx: TransactionContext) => Promise<T>,
  publish?: (type: string, payload: unknown) => void
): Promise<CommandResult<T>> {
  // TRACE_IDENTIFIER — create trace context for this command chain
  const trace = createTraceContext(`executeCommand:${command.action}`);

  try {
    // 1. Scope Guard — verify workspace access
    const scopeResult = await checkWorkspaceAccess(command.workspaceId, command.userId);
    if (!scopeResult.allowed) {
      return { success: false, error: `Access denied: ${scopeResult.reason}` };
    }

    // 2. Policy Engine — evaluate action permission
    const policyDecision = evaluatePolicy(scopeResult.role as WorkspaceRole, command.action);
    if (!policyDecision.permitted) {
      return { success: false, error: `Policy denied: ${policyDecision.reason}` };
    }

    // 3. Transaction Runner — execute handler with event collection
    const { value, events } = await runTransaction(
      command.workspaceId,
      command.userId,
      handler,
      trace.traceId
    );

    // 4. Outbox flush — deliver collected events to the event bus
    if (publish) {
      for (const event of events) {
        publish(event.type, event.payload);
      }
    }

    return { success: true, value };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Command execution failed';
    logDomainError({
      occurredAt: new Date().toISOString(),
      traceId: trace.traceId,
      source: 'workspace-application:command-handler',
      message,
      detail: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, error: message };
  }
}
