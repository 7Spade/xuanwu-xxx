# Feature Slice: `account-user.skill`

## Domain

Account Skill Layer — individual XP accumulation and skill proficiency tracking.
This slice holds **growth sovereignty**: only this BC may write XP values.

## Responsibilities

- `addXp` / `deductXp` — the ONLY two write paths for XP (enforces Invariants #11, #12, #13)
- Mandatory XP Ledger write before every aggregate update
- XP clamped strictly to `0–525` (from `SKILL_XP_MAX`)
- Publish `SkillXpAdded` / `SkillXpDeducted` events to Organization Event Bus

## Invariants Enforced

| # | Invariant | Enforcement |
|---|-----------|-------------|
| 11 | XP belongs to Account BC only | `addXp`/`deductXp` are the only write paths; Organization only receives events |
| 12 | Tier is never stored in DB | `AccountSkillRecord` has no `tier` field; derive via `getTier(xp)` |
| 13 | Every XP change produces a Ledger entry | `appendXpLedgerEntry()` is called BEFORE every aggregate write |

## Write Path

```
Server Action → addXp/deductXp → clamp(0~525) → appendXpLedgerEntry → setDocument(aggregate) → publishOrgEvent
```

## Internal Files

| File | Purpose |
|------|---------|
| `_actions.ts` | `addSkillXp`, `deductSkillXp` Server Actions |
| `_aggregate.ts` | `addXp`, `deductXp`, `getSkillXp` domain operations |
| `_ledger.ts` | `appendXpLedgerEntry`, `XpLedgerEntry` type |
| `index.ts` | Public API |

## Firestore Paths

| Path | Data |
|------|------|
| `accountSkills/{accountId}/skills/{skillId}` | `AccountSkillRecord` (xp, version — no tier) |
| `accountSkills/{accountId}/xpLedger/{auto-id}` | `XpLedgerEntry` (delta, reason, sourceId, timestamp) |

## Public API (`index.ts`)

```ts
export { addSkillXp, deductSkillXp } from './_actions';
export { addXp, deductXp, getSkillXp, SKILL_XP_MAX, SKILL_XP_MIN } from './_aggregate';
export type { AccountSkillRecord, XpLedgerEntry } from '...';
```

## Dependencies

- `@/shared/infra/firestore/` — read/write adapters
- `@/features/account-organization.event-bus` — publishes skill XP events
- `@/shared/lib` — `resolveSkillTier` / `getTier` (read-only derivation)

## Architecture Note

`logic-overview.v3.md S1`: `SERVER_ACTION_SKILL → ACCOUNT_SKILL_AGGREGATE → ACCOUNT_SKILL_XP_LEDGER → ORGANIZATION_EVENT_BUS`.
Organization may NOT write to this slice; it only receives events and sets `minXpRequired` gates in `ORG_SKILL_RECOGNITION`.
