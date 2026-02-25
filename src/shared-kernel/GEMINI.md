# Shared Kernel (`src/shared-kernel/`)

## Role

Explicitly agreed cross-BC domain contracts. Every type, interface, or function
that lands here must be:

1. **Used by two or more distinct Bounded Contexts** (Workspace BC, Account BC,
   Organization BC, or Projection Layer).
2. **Pure** — zero dependencies on Firebase, React, or any I/O layer.
3. **Versioned via marker interfaces** where the contract is a structural guarantee
   (see `ImplementsEventEnvelopeContract`, `ImplementsAuthoritySnapshotContract`).

Per logic-overview.v3.md Invariant #8:
> Shared Kernel 必須顯式標示；未標示的跨 BC 共用一律視為侵入。

## Contents

| File | Contract | Consumers |
|------|----------|-----------|
| `event-envelope.ts` | `EventEnvelope<T>`, `ImplementsEventEnvelopeContract` | `workspace-core.event-bus`, `account-organization.event-bus` |
| `authority-snapshot.ts` | `AuthoritySnapshot`, `ImplementsAuthoritySnapshotContract` | `projection.workspace-scope-guard`, `projection.account-view` |
| `skill-tier.ts` | `SkillTier`, `TierDefinition`, `TIER_DEFINITIONS`, `resolveSkillTier()`, `getTier()`, `getTierRank()`, `tierSatisfies()` | `account-user.skill`, `account-organization.schedule`, `workspace-business.schedule`, `projection.account-skill-view`, `projection.org-eligible-member-view` |
| `skill-requirement.ts` | `SkillRequirement` | `workspace-business.schedule`, `workspace-business.document-parser`, `workspace-core.event-bus`, `account-organization.schedule` |
| `schedule-proposed-payload.ts` | `WorkspaceScheduleProposedPayload`, `ImplementsScheduleProposedPayloadContract` | `workspace-core.event-bus` (produces), `account-organization.schedule` (consumes) |
| `index.ts` | Re-exports all of the above | All consumers |

## Import

```ts
// Preferred: single entry point
import type { SkillTier, SkillRequirement } from '@/shared-kernel';
import { resolveSkillTier, tierSatisfies } from '@/shared-kernel';

// Also valid: granular import
import type { EventEnvelope } from '@/shared-kernel/event-envelope';
```

## Rules

- **No imports from `features/`** — ever.
- **No imports from `shared/`** — ever. The shared-kernel sits BELOW shared.
- Only intra-shared-kernel imports are allowed (e.g. `skill-requirement` imports
  `SkillTier` from `./skill-tier`).
- Adding a new export requires evidence that it is used by two or more BCs and
  carries no infrastructure dependency.

## Relationship to `shared/types`

`shared/types` re-exports shared-kernel types so that existing `@/shared/types`
import paths continue to work:

```ts
// shared/types/skill.types.ts (excerpt)
export type { SkillTier, TierDefinition } from '@/shared-kernel/skill-tier';
export type { SkillRequirement } from '@/shared-kernel/skill-requirement';
```

This means consumers do not need to change existing imports; they can migrate to
`@/shared-kernel` at their own pace.
