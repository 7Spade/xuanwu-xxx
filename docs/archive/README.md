# `docs/` — Architecture & Design Documentation

Project-wide architecture decisions, data schemas, and engineering standards.

## Files

| File | Contents |
|------|---------|
| `vertical-slice-architecture.md` | Full VSA design: feature slices, shared modules, dependency rules |
| `architecture.md` | Technology stack and architectural principles overview |
| `boundaries.md` | Layer dependency rules (what may import what) |
| `conventions.md` | Naming conventions and coding standards |
| `schema.md` | Firestore collection and document schemas |
| `events.md` | WorkspaceEventBus event catalogue |
| `context.md` | React Context provider hierarchy |
| `interactions.md` | User interaction and data flow diagrams |
| `security.md` | Firebase security rules rationale |
| `performance.md` | Performance guidelines and limits |
| `limits.md` | Firestore query and data size limits |
| `glossary.md` | Domain terminology definitions |
| `blueprints.md` | Feature blueprint index |
| `tools.md` | Developer tooling guide |
| `GEMINI.md` | AI agent instructions for this directory |

## `system-design/`

| File | Contents |
|------|---------|
| `architecture-overview.md` | VSA architecture principles and data flow patterns |
| `structure-overview.md` | Complete directory tree with file descriptions |
| `dependency-overview.md` | Per-module import allow/deny lists and ESLint rules |
| `data-flow-overview.md` | Four canonical data flow paths (A–D) |
| `interaction-overview.md` | Runtime interaction patterns between layers |
| `directory-tree-overview.md` | Annotated full directory tree |

## `design/`

| File | Contents |
|------|---------|
| `skill-tag-system.md` | Skill/tag/XP system design |

## Rules

- Documentation here describes **current reality**, not aspirations
- Update the relevant doc when making architectural changes
- Do **not** put runnable code here — code examples are illustrations only
- Keep diagrams in Mermaid format for version control compatibility
