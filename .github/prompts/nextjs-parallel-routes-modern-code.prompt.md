---
agent: 'agent'
tools: ['edit/editFiles', 'search', 'bash']
description: 'Generate modern Next.js App Router code using parallel routes, intercepting routes, streaming, and minimal-risk architecture-safe changes.'
---

# Generate Next.js Parallel Routes (Modern Pattern)

Use this prompt when you need AI to generate or refactor features into modern Next.js App Router patterns with parallel routing.

## Primary Objective

Produce production-ready code that:

1. uses parallel route slots (`@slot`) for independent regions,
2. uses intercepting routes for modal overlays while preserving canonical routes,
3. keeps Server Components as default,
4. keeps business logic out of presentation-only components,
5. preserves existing behavior unless explicitly requested otherwise.

## Required Architecture Constraints

- Follow one-way dependencies: `app -> components -> context -> hooks -> infra -> lib -> types`.
- Do not place Firebase/infra calls directly inside dumb UI components.
- Prefer colocated hooks for feature logic and event handling.

## Generation Workflow

### A. Plan the route structure first

Output the proposed file tree before coding, including:

- parent layout
- slot routes (e.g., `@main`, `@sidebar`, `@modal`)
- intercepting route paths (`(.)`/`(..)`)
- `loading.tsx` and `error.tsx` placement

### B. Implement with server-first defaults

- Keep route/layout components server-side unless interactivity is required.
- Pass minimal typed DTO props to client components.

### C. Add modal interception pattern

If requirement includes modal detail view:

- add intercepting route under slot for overlay UX,
- keep canonical detail page route for deep-link/direct navigation.

### D. Add resiliency

- include `loading.tsx` for async boundaries,
- include `error.tsx` where route-level failures should be recoverable.

### E. Verify non-regression

After changes, run:

- `npm run lint`
- `npm run typecheck`
- `npm run build`

Then summarize:

1. route tree changes,
2. component boundaries,
3. behavior compatibility notes.

## Output Contract

Always provide:

1. **Proposed File Tree**
2. **Implementation Summary**
3. **Why this is modern Next.js**
4. **Risk & Regression Check**

