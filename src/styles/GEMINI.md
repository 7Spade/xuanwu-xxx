# Styles Layer (`src/styles/`)

## Role

Design system foundation — CSS variables, global resets, and Tailwind base styles. Contains no TypeScript logic or type definitions.

## Boundary Rules

- 僅包含樣式與設計系統 token（CSS 變數、Tailwind utilities）。
- 不得包含邏輯或型別定義。
- 不得依賴任何其他資料夾（零 `import` 語句）。
- 不得包含 React 元件或 TypeScript 程式碼。

## Files

| File | Contents |
|------|----------|
| `globals.css` | Tailwind directives, CSS custom properties (design tokens), global resets |

## Design Tokens (CSS Custom Properties)

All tokens live in `:root` (light) and `.dark` (dark mode overrides) blocks inside `globals.css`.

Token categories:
- **Color**: `--background`, `--foreground`, `--primary`, `--accent`, `--muted`, `--border`, `--ring`
- **Sidebar**: `--sidebar-background`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring` (must stay aligned with app design tokens — **not** Shadcn defaults)
- **Radius**: `--radius`
- **Sidebar dimensions**: `--sidebar-width`, `--sidebar-width-icon`

## Key Constraints

- Shadcn component tokens must be kept in sync with the app's own design tokens to avoid color inconsistency.
- `--sidebar-*` variables must reference the same hue/chroma as `--primary` and `--background` to ensure visual consistency.
- Adding a new CSS variable here requires a corresponding Tailwind extension in `tailwind.config.ts`.

## Who Depends on This Layer?

`src/shared/shadcn-ui/` (component primitives consume CSS variables) and `src/app/layout.tsx` (imports `globals.css`).
