# Feature Slice: `workspace-governance.partners`

## Domain

Partner (協力廠商) management — create, view, and manage external partners.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | Partner CRUD |
| `_components/` | `PartnersView`, `PartnerDetailView` |
| `index.ts` | Public exports |

## Public API (`index.ts`)

```ts
export { PartnersView } from "./_components/partners-view";
export { PartnerDetailView } from "./_components/partner-detail-view";
```

## Who Uses This Slice?

- `app/dashboard/account/partners/page.tsx`
- `app/dashboard/account/partners/[id]/page.tsx`
