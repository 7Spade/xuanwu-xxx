# `src/shared/` — Globally Shared Code

Everything in this directory is used across multiple unrelated features and layers.  
**No domain-specific logic. No single-feature code.**

## Sub-directories

| Directory | Contents | Import alias |
|-----------|---------|-------------|
| `shadcn-ui/` | shadcn/ui primitive components (Button, Dialog, Card, …) | `@/shared/shadcn-ui/` |
| `hooks/` | `use-mobile.tsx`, `use-toast.ts` — framework-level UI hooks | `@/shared/hooks/` |
| `context/` | `theme-context`, `i18n-context`, `auth-context`, `firebase-context` — global providers | `@/shared/context/` |
| `utils/` | *(reserved)* additional shared pure helpers beyond `src/lib/` | `@/shared/utils/` |
| `config/` | *(reserved)* shared app constants (name, version, feature flags) | `@/shared/config/` |
| `constants/` | *(reserved)* shared domain-independent constants (route names, limits) | `@/shared/constants/` |
| `types/` | *(reserved)* UI-layer shared type definitions (form schemas, display props) | `@/shared/types/` |

## `shadcn-ui/` — shadcn/ui components

All shadcn primitive components live here. Install / update with:

```bash
npx shadcn@latest add <component>   # components.json points to @/shared/shadcn-ui
```

✅ Import: `import { Button } from "@/shared/shadcn-ui/button"`  
❌ Never import ui primitives from `@/app/_components/ui/` — that path no longer exists.

## `hooks/` — global UI hooks

```ts
import { useIsMobile } from "@/shared/hooks/use-mobile"
import { useToast }    from "@/shared/hooks/use-toast"
```

These are React-only, zero domain knowledge. Domain hooks belong in `src/hooks/`.

## `context/` — global providers

The four providers that wrap the entire app:

| File | Hook | Purpose |
|------|------|---------|
| `theme-context.tsx` | `useTheme` | Dark / light mode |
| `i18n-context.tsx` | `useI18n` | Translations |
| `auth-context.tsx` | `useAuth` | Firebase Auth session |
| `firebase-context.tsx` | `useFirebase` | Firebase SDK instances |

Domain contexts (`app-context`, `account-context`, `workspace-context`) remain in `src/context/`.

## What does NOT belong here

- Domain business logic → `src/server-commands/`
- Domain-specific hooks → `src/hooks/`
- Domain-specific contexts → `src/context/`
- Firebase SDK calls → `src/infra/`
- Simple one-liner utils → `src/lib/`
- Domain type aliases → `src/types/`

## Who depends on this layer

Every layer above `src/lib/`: `src/hooks/`, `src/context/`, `src/actions/`, `src/app/`.
