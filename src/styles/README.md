# `src/styles/` — Global Styles

> **Status: `globals.css` lives here.** Referenced by `src/app/layout.tsx` and `components.json`.

## Current files

| File | Description |
|------|-------------|
| `globals.css` | Tailwind base, CSS variables for the theme (light/dark), custom @layer overrides |

## What belongs here (if used)

- Additional global CSS files imported by `globals.css`
- Tailwind `@layer` overrides that are too large to keep in `globals.css`
- CSS custom property (variable) definitions for theming

## What does NOT belong here

- Component-scoped styles → use Tailwind classes directly on the component
- Tailwind configuration → `tailwind.config.ts` (root)

## Styling rules

- Use **Tailwind CSS utility classes** as the primary styling mechanism
- **Never** use hardcoded color values — use theme variables: `bg-primary`, `text-destructive`, `border-border`, etc.
- Theme colors are defined as HSL CSS variables in `src/styles/globals.css`
- Dark mode is supported via the `dark:` Tailwind variant

## Current guidance

Add styles to `src/styles/globals.css` first.  
Only extract to additional files if `globals.css` becomes difficult to manage.
