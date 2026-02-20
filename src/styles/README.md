# `src/styles/` — Global Styles (Reserved)

> **Status: Currently, all global styles live in `src/app/globals.css`.**  
> This directory is reserved for additional style files if the styling layer grows.

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
- Theme colors are defined as HSL CSS variables in `src/app/globals.css`
- Dark mode is supported via the `dark:` Tailwind variant

## Current guidance

Add styles to `src/app/globals.css` first.  
Only extract to this directory if `globals.css` becomes difficult to manage.
