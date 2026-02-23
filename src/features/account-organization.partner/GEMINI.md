# Feature Slice: `account-organization.partner`

## Domain

Partner management — external group view within an organization. Partners are aggregated views of external accounts sharing skill tags from the flat skill-tag pool.

## Distinction from `account-organization.team`

| Slice | View | Account Type |
|-------|------|--------------|
| `account-organization.team` | Internal group view | Internal accounts |
| `account-organization.partner` | External group view | External accounts |

Both slices draw from the same `SKILL_TAG_POOL` in `account-organization.skill-tag`.

## Responsibilities

- Create and manage partner relationships (external groups)
- Aggregate skill tags from partner account members
- Partner account invitation and access management

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createPartner`, `addPartnerMember`, `removePartnerMember` |
| `_queries.ts` | Partner list and member subscription |
| `_components/` | `PartnerList`, `PartnerCard`, `PartnerForm` |
| `_hooks/` | `usePartners` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
// future exports
```

## Dependencies

- `@/shared/types` — `Partner`, `Organization`
- `@/shared/infra/firestore/` — Firestore reads/writes
