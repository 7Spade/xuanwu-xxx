# Feature Slice: `projection.account-skill-view`

## Domain

Account Skill XP read model — per-account, per-skill XP snapshot.

Updated by the Event Funnel when `organization:skill:xpAdded` or
`organization:skill:xpDeducted` fires from the Organization Event Bus.

## Responsibilities

- Maintain `xp` per `(accountId, skillId)` pair as a Firestore document.
- Tier is NEVER stored — always computed at query time via `resolveSkillTier(xp)`.
- Expose read queries for per-account skill views (consumed by UI and Schedule).

## Invariants Enforced

| # | Invariant | Enforcement |
|---|-----------|-------------|
| 12 | Tier is never stored in DB | `AccountSkillEntry` has no `tier` field; callers derive via `resolveSkillTier(xp)` |
| 14 | Schedule reads projection, not aggregate | `getAccountSkillView` is the authoritative read path; aggregate is write-only |

## Write Path (Event Funnel → Projector)

```
organization:skill:xpAdded   → applySkillXpAdded(accountId, skillId, newXp)
organization:skill:xpDeducted → applySkillXpDeducted(accountId, skillId, newXp)
```

## Internal Files

| File | Purpose |
|------|---------|
| `_projector.ts` | `applySkillXpAdded`, `applySkillXpDeducted`, `AccountSkillEntry` type |
| `_queries.ts` | `getAccountSkillEntry`, `getAccountSkillView` read queries |
| `index.ts` | Public API |

## Firestore Paths

| Path | Data |
|------|------|
| `accountSkillView/{accountId}/skills/{skillId}` | `AccountSkillEntry` (xp, readModelVersion — no tier) |

## Public API (`index.ts`)

```ts
export { applySkillXpAdded, applySkillXpDeducted } from './_projector';
export { getAccountSkillEntry, getAccountSkillView } from './_queries';
export type { AccountSkillEntry } from './_projector';
```

## Dependencies

- `@/shared/infra/firestore/` — read/write adapters
- `firebase/firestore` — serverTimestamp, getDocs, collection

## Architecture Note

`logic-overview.v3.md S3`:
`EVENT_FUNNEL_INPUT → ACCOUNT_SKILL_VIEW`
`ACCOUNT_SKILL_VIEW -.→ getTier 計算（不存 DB）`

Consumers that need tier must call `resolveSkillTier(entry.xp)` from `@/shared/lib`.
This projection is the ONLY authoritative read source for per-account skill XP.
The `account-user.skill` aggregate is write-only; do NOT query it from the UI.
