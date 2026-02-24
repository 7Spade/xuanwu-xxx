# Feature Slice: `projection.org-eligible-member-view`

## Domain

Organization-scoped eligible member read model — the ONLY source that
`organization.schedule` (and `workspace-business.schedule`) may use to check
member availability and skill tiers.

## Responsibilities

- Track `xp` per `(orgId, accountId, skillId)` for all org members.
- Maintain the `eligible` flag for schedule assignment availability.
- Expose queries that compute tier on-the-fly via `resolveSkillTier(xp)`.
- Tier is NEVER stored — always derived at query time.

## Invariants Enforced

| # | Invariant | Enforcement |
|---|-----------|-------------|
| 12 | Tier is never stored in DB | `OrgEligibleMemberEntry.skills` stores only `{ xp }`; tier computed via `enrichWithTier` |
| 14 | Schedule reads only this projection | `getOrgMemberEligibility` / `getOrgEligibleMembersWithTier` are the only valid read paths for schedule |

## Write Path (Event Funnel → Projector)

```
organization:member:joined   → initOrgMemberEntry(orgId, accountId)
organization:member:left     → removeOrgMemberEntry(orgId, accountId)
organization:skill:xpAdded   → applyOrgMemberSkillXp(orgId, accountId, skillId, newXp)
organization:skill:xpDeducted → applyOrgMemberSkillXp(orgId, accountId, skillId, newXp)
```

## Internal Files

| File | Purpose |
|------|---------|
| `_projector.ts` | `initOrgMemberEntry`, `removeOrgMemberEntry`, `applyOrgMemberSkillXp`, `OrgEligibleMemberEntry` type |
| `_queries.ts` | `getOrgMemberEligibility`, `getOrgEligibleMembers`, `getOrgMemberEligibilityWithTier`, `getOrgEligibleMembersWithTier` |
| `index.ts` | Public API |

## Firestore Paths

| Path | Data |
|------|------|
| `orgEligibleMemberView/{orgId}/members/{accountId}` | `OrgEligibleMemberEntry` (skills: `{ [skillId]: { xp } }`, eligible, readModelVersion — no tier) |

## Public API (`index.ts`)

```ts
export { initOrgMemberEntry, removeOrgMemberEntry, applyOrgMemberSkillXp } from './_projector';
export {
  getOrgMemberEligibility,
  getOrgEligibleMembers,
  getOrgMemberEligibilityWithTier,
  getOrgEligibleMembersWithTier,
} from './_queries';
export type { OrgEligibleMemberEntry, OrgMemberSkillWithTier, OrgEligibleMemberView } from '...';
```

## Dependencies

- `@/shared/infra/firestore/` — read/write/delete adapters
- `firebase/firestore` — serverTimestamp, getDocs, collection
- `@/shared/lib` — `resolveSkillTier` (pure function, no I/O)
- `@/shared/types` — `SkillTier`

## Architecture Note

`logic-overview.v3.md S3`:
`EVENT_FUNNEL_INPUT → ORG_ELIGIBLE_MEMBER_VIEW`
`ORG_ELIGIBLE_MEMBER_VIEW -.→ getTier 計算（不存 DB）`
`W_B_SCHEDULE -.→ ORG_ELIGIBLE_MEMBER_VIEW（查詢可用帳號 · eligible=true · 只讀）`

`account-organization.schedule/_schedule.ts` imports `getOrgMemberEligibility` from
this slice to validate schedule assignment eligibility (Invariant #14).
