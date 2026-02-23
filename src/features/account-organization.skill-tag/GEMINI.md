# Feature Slice: `account-organization.skill-tag`

## Domain

Skill tag pool — flat resource pool of skills and certifications shared across all organization accounts (both internal and external). Teams and Partners are aggregate views over this same pool.

## Responsibilities

- Manage the flat skill/certification tag pool for an organization
- Assign skill tags to accounts (internal and external)
- Provide tag lookup and filtering for team/partner aggregate views

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `addSkillTag`, `removeSkillTag`, `assignTagToAccount` |
| `_queries.ts` | Tag pool subscription |
| `_components/` | `SkillTagPool`, `SkillTagSelector` |
| `_hooks/` | `useSkillTags` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `SkillTag`, `Organization`, `Account`
- `@/shared/infra/firestore/` — Firestore reads/writes

## Architecture Note

`logic-overview.v3.md`: `ORGANIZATION_MEMBER → SKILL_TAG_POOL`, `ORGANIZATION_PARTNER → SKILL_TAG_POOL`, `ORGANIZATION_TEAM → SKILL_TAG_POOL`.
All dotted edges represent tag aggregation views; the pool itself is flat and owned by this slice.
