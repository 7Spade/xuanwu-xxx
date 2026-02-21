# Feature Slice: `workspace-business.partners`

## Domain

Partner (協力廠商) management — create, view, and manage external partners.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | Partner CRUD |
| `_components/` | `PartnersView`, `PartnerDetailView` |
| `index.ts` | Public exports |

## Maps From (Legacy)

- `src/server-commands/account/` (partner ops) → `_actions.ts`
- `src/view-modules/partners/` → `_components/`

## Public API (`index.ts`)

```ts
export { PartnersView } from "./_components/partners-view";
export { PartnerDetailView } from "./_components/partner-detail-view";
```

## Who Uses This Slice?

- `app/dashboard/account/partners/page.tsx`
- `app/dashboard/account/partners/[id]/page.tsx`
