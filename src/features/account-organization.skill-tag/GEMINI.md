# Feature Slice: `account-organization.skill-tag`

## Domain

Two aggregates:

1. **Skill Tag Pool** (`SKILL_TAG_POOL`) — organization-scoped view of the global Tag Authority Center.
   Per v5: passively updated by TagLifecycleEvents from `centralized-tag`.
2. **Org Skill Recognition** (`ORG_SKILL_RECOGNITION`) — records the organization's acknowledgment of a member's skill, with an optional `minXpRequired` gate.

## v5 Role Change (logic-overview_v5.md)

`SKILL_TAG_POOL` is now defined as:
> `= Tag Authority 的組織作用域快照\n消費 TagLifecycleEvent 被動更新`

- **`centralized-tag.aggregate`** (VS0) is the global authority for tagSlug uniqueness (Invariant #17, A6).
- This pool is the org's **activation view**: an org activates tags it wants to use from the global dictionary.
- Label/category changes and deprecations from `centralized-tag` propagate passively via `syncTag*ToPool()` functions called by `projection.event-funnel`.

## Responsibilities

### Skill Tag Pool
- Manage which global tags an org has activated (by `tagSlug`)
- Track `refCount` per tag to guard against removal while members still hold references
- Passively sync label/category updates, deprecations, and deletions from `centralized-tag` via TagLifecycleEvents (T2)

### Org Skill Recognition
- Grant/revoke skill recognition for org members
- Set `minXpRequired` thresholds (org-controlled gate — NEVER writes Account XP)
- Validate `skillId` against the global `SKILL_DEFINITION_AGGREGATE` before granting (read-only FK reference)
- Publish `SkillRecognitionGranted` / `SkillRecognitionRevoked` events

## Invariants Enforced

| # | Invariant | Enforcement |
|---|-----------|-------------|
| 11 | Organization cannot modify Account XP | `ORG_SKILL_RECOGNITION` only reads via `minXpRequired` gate; never writes to `account-user.skill` |
| T2 | SKILL_TAG_POOL = Tag Authority's org-scope projection | Only tagSlugs from `centralized-tag` may be activated; passive sync functions handle lifecycle |
| 8 | Cross-BC coupling must be explicit (Shared Kernel) | `skillId` validated against static `findSkill()` (Capability BC read-only FK) |

## Internal Files

| File | Purpose |
|------|---------|
| `_skill-tag-pool.ts` | Active: `addSkillTagToPool`, `removeSkillTagFromPool`, `incrementTagRefCount`, `decrementTagRefCount` · Passive: `syncTagUpdateToPool`, `syncTagDeprecationToPool`, `syncTagDeletionToPool` |
| `_org-skill-recognition.ts` | `grantSkillRecognition`, `revokeSkillRecognition` (domain writes + event publish) |
| `_queries.ts` | `getOrgSkillTag`, `getOrgSkillTags`, `getSkillRecognition`, `getMemberSkillRecognitions` (read queries) |
| `index.ts` | Public API |

## Firestore Paths

| Path | Data |
|------|------|
| `orgSkillTagPool/{orgId}/tags/{tagSlug}` | `OrgSkillTagEntry` (tagSlug, refCount, deprecatedAt?, addedBy) |
| `orgSkillRecognition/{orgId}/members/{accountId}/skills/{skillId}` | `OrgSkillRecognitionRecord` (minXpRequired, status, grantedBy) |

## Dependencies

- `@/features/centralized-tag` — `TagUpdatedPayload`, `TagDeprecatedPayload`, `TagDeletedPayload` (passive sync)
- `@/shared/infra/firestore/` — read/write adapters
- `@/features/account-organization.event-bus` — publishes recognition events
- `@/shared/constants/skills` — `findSkill()` for Capability BC FK validation

## Architecture Note

`logic-overview_v5.md` VS4:
- `SKILL_TAG_POOL[("職能標籤庫\naccount-organization.skill-tag\n= Tag Authority 的組織作用域快照\n消費 TagLifecycleEvent 被動更新")]`
- `ORG_SKILL_RECOGNITION --> ORG_EVENT_BUS`

