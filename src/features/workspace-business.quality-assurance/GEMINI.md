# Feature Slice: `workspace-business.quality-assurance`

## Domain

Quality Assurance (品質驗證) — A-track business view for quality threshold checks.

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_components/` | `WorkspaceQualityAssurance` |
| `index.ts` | Public exports |

## Public API (`index.ts`)

```ts
export { WorkspaceQualityAssurance } from "./_components/quality-assurance-view";
```

## Who Uses This Slice?

- `app/(shell)/(account)/(workspaces)/workspaces/[id]/@businesstab/quality-assurance/page.tsx`
