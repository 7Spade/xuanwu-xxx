# `docs/` — Architecture & Design Documentation

Project-wide architecture decisions, data schemas, and engineering standards.

## Files

| File | Contents |
|------|---------|
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
| `blueprints.md` | Feature blueprint templates |
| `tools.md` | Developer tooling guide |

## Rules

- Documentation here describes **current reality**, not aspirations
- Update the relevant doc when making architectural changes
- Do **not** put runnable code here — code examples are illustrations only
- Keep diagrams in Mermaid format for version control compatibility
