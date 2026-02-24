# Feature Slice: `workspace-application`

## Domain

Workspace application layer — coordinates the command processing pipeline. Receives commands from `_actions.ts` server actions and orchestrates scope guard, policy engine, transaction runner, and outbox.

## Responsibilities

- **Command Handler**: receive and dispatch workspace commands
- **Scope Guard**: validate workspace access using `projection.workspace-scope-guard` (reads local read model only — invariant #7)
- **Policy Engine**: validate workspace-level policies
- **Org-Policy Cache**: anti-corruption layer — local cache of organization policies (populated via `account-organization.event-bus` policy change events)
- **Transaction Runner**: execute domain business logic, collect uncommitted aggregate events
- **Outbox**: collect aggregate events and write to `workspace-core.event-bus`

## Internal Files (Application Layer Specialization)

| File / Dir | Purpose |
|-----------|---------|
| `_command-handler.ts` | Command receive and dispatch |
| `_scope-guard.ts` | Access validation (reads `projection.workspace-scope-guard`) |
| `_policy-engine.ts` | Policy validation |
| `_org-policy-cache.ts` | Org policy anti-corruption layer (local cache) |
| `_transaction-runner.ts` | Aggregate execution + outbox collection |
| `_outbox.ts` | Transaction outbox → `workspace-core.event-bus` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
import { executeCommand, type WorkspaceCommand, type CommandResult } from '@/features/workspace-application'
import { checkWorkspaceAccess, type ScopeGuardResult } from '@/features/workspace-application'
import { evaluatePolicy, type WorkspaceRole, type PolicyDecision } from '@/features/workspace-application'
import { runTransaction, type TransactionContext, type TransactionResult } from '@/features/workspace-application'
import { createOutbox, type Outbox, type OutboxEvent } from '@/features/workspace-application'
import { registerOrgPolicyCache, getCachedOrgPolicy, getAllCachedPolicies, clearOrgPolicyCache } from '@/features/workspace-application'
```

## Dependencies

- `@/features/projection.workspace-scope-guard` — scope guard read model (via public API)
- `@/features/workspace-core` — workspace aggregate
- `@/features/workspace-core.event-bus` — event publishing
- `@/shared/types` — command types

## Architecture Note

`logic-overview.v3.md`:
- Application layer **coordinates flow only** — no domain rules (invariant #3)
- Scope Guard reads ONLY local `projection.workspace-scope-guard`, NOT external event buses (invariant #7)
- Transaction Runner collects aggregate events and writes to Outbox (invariant #4)
