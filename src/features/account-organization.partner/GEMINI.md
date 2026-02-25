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
| `_actions.ts` | `createPartnerGroup`, `sendPartnerInvite`, `dismissPartnerMember` |
| `_queries.ts` | `getOrgPartners`, `subscribeToOrgPartners`, `subscribeToOrgPartnerInvites` |
| `_components/` | `PartnersView`, `PartnerDetailView` |
| `_hooks/` | `usePartnerManagement` |
| `index.ts` | Public API |

## Public API (`index.ts`)

```ts
export { usePartnerManagement } from './_hooks/use-partner-management';
export { PartnersView, PartnerDetailView } from './_components/...';
export { getOrgPartners, subscribeToOrgPartners, subscribeToOrgPartnerInvites } from './_queries';
```

## Dependencies

- `@/shared/types` — `Partner`, `Organization`
- `@/shared/infra/firestore/` — Firestore reads/writes
- `@/shared/app-providers/app-context` — `useApp` for active account context
