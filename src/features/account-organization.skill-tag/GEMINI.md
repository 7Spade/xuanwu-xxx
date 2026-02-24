# Feature Slice: `account-organization.skill-tag`

## Domain

Two aggregates:

1. **Skill Tag Pool** (`SKILL_TAG_POOL_AGGREGATE`) — flat resource pool of skills for an organization.  
2. **Org Skill Recognition** (`ORG_SKILL_RECOGNITION`) — records the organization's acknowledgment of a member's skill, with an optional `minXpRequired` gate.

## Responsibilities

### Skill Tag Pool
- Manage the organization's flat skill/certification tag library
- Enforce tag uniqueness within an org (by `tagSlug`)
- Guard against deletion of tags still referenced by members/partners (`refCount`)
- Members and Partners hold READ-ONLY references by `tagSlug`

### Org Skill Recognition
- Grant/revoke skill recognition for org members
- Set `minXpRequired` thresholds (org-controlled gate — NEVER writes Account XP)
- Validate `skillId` against the global `SKILL_DEFINITION_AGGREGATE` before granting (read-only FK reference)
- Publish `SkillRecognitionGranted` / `SkillRecognitionRevoked` to Organization Event Bus

## Invariants Enforced

| # | Invariant | Enforcement |
|---|-----------|-------------|
| 11 | Organization cannot modify Account XP | `ORG_SKILL_RECOGNITION` only reads via `minXpRequired` gate; never writes to `account-user.skill` |
| A6 | Skill Tag deletion rules managed by dedicated Aggregate | `removeSkillTagFromPool` checks `refCount > 0` and throws |
| 8 | Cross-BC coupling must be explicit (Shared Kernel) | `skillId` validated against static `findSkill()` (Capability BC read-only FK) |

## Internal Files

| File | Purpose |
|------|---------|
| `_skill-tag-pool.ts` | `addSkillTagToPool`, `removeSkillTagFromPool`, `incrementTagRefCount`, `decrementTagRefCount` |
| `_org-skill-recognition.ts` | `grantSkillRecognition`, `revokeSkillRecognition` (domain writes + event publish) |
| `_queries.ts` | `getOrgSkillTag`, `getOrgSkillTags`, `getSkillRecognition`, `getMemberSkillRecognitions` (read queries) |
| `index.ts` | Public API |

## Firestore Paths

| Path | Data |
|------|------|
| `orgSkillTagPool/{orgId}/tags/{tagSlug}` | `OrgSkillTagEntry` (tagSlug, refCount, addedBy) |
| `orgSkillRecognition/{orgId}/members/{accountId}/skills/{skillId}` | `OrgSkillRecognitionRecord` (minXpRequired, status, grantedBy) |

## Public API (`index.ts`)

```ts
// Skill Tag Pool
export { addSkillTagToPool, removeSkillTagFromPool, incrementTagRefCount, decrementTagRefCount } from './_skill-tag-pool';
// Org Skill Recognition
export { grantSkillRecognition, revokeSkillRecognition } from './_org-skill-recognition';
// Read queries
export { getOrgSkillTag, getOrgSkillTags, getSkillRecognition, getMemberSkillRecognitions } from './_queries';
```

## Dependencies

- `@/shared/infra/firestore/` — read/write adapters
- `@/features/account-organization.event-bus` — publishes recognition events
- `@/shared/constants/skills` — `findSkill()` for Capability BC FK validation

## Architecture Note

`logic-overview.v3.md`:
- `SKILL_TAG_POOL_AGGREGATE --> SKILL_TAG_POOL`
- `ORG_SKILL_RECOGNITION →|SkillRecognitionGranted / SkillRecognitionRevoked| ORGANIZATION_EVENT_BUS`
- `SKILL_DEFINITION_AGGREGATE -.->|技能定義參照（skillId · 唯讀）| ORG_SKILL_RECOGNITION`

Organization Members/Partners reference pool tags by `tagSlug` only — they do not own the tags.

