# Feature Slice: `workspace-core.event-bus`

## Domain

Workspace event bus infrastructure — publish/subscribe engine, event type contracts, and React context for cross-feature communication.

## Responsibilities

- Define all workspace-level event names and payload types
- Provide `WorkspaceEventBus` class (Observer pattern)
- Expose `WorkspaceEventContext` and `useWorkspaceEvents` hook

## Exports (via index.ts)

- `WorkspaceEventBus`
- All event payload types and `WorkspaceEventName`
- `WorkspaceEventContext`, `useWorkspaceEvents`, `WorkspaceEventContextType`
