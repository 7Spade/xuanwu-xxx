# Data Flow Reference (`src/shared/FLOWS.md`)

This document defines the **standard data flow paths** for this application.  
When in doubt about where a piece of logic belongs or how data should move, consult this file.

---

## Architecture Overview

```
app (pages/layouts)
  │
  ├── react-providers (global state: AppProvider, AccountProvider, WorkspaceProvider)
  │     └── react-hooks (state-hooks, command-hooks, service-hooks)
  │           └── server-commands (async Firebase writes/reads)
  │                 ├── domain-rules (pure validation, no I/O)
  │                 └── @/firebase/ (Firestore repositories)
  │
  └── use-cases (multi-step orchestrations + view bridges)
        └── server-commands → @/firebase/
```

One-way dependency rule: **no layer may import from a layer above it**.

---

## Flow A: UI Action → Firebase Write (Standard Command Flow)

Use this flow for any user-triggered write that is **self-contained** within one plugin/feature.

```mermaid
sequenceDiagram
    participant UI as view-modules / app component
    participant Hook as react-hooks/command-hooks
    participant Cmd as server-commands
    participant FB as @/firebase/ (repository)

    UI->>Hook: calls commandFn (e.g., toggleLike())
    Hook->>Hook: auth guard + useCallback
    Hook->>Cmd: await server-commands/daily/toggleLike(...)
    Cmd->>FB: repository.update(...)
    FB-->>Cmd: void
    Cmd-->>Hook: void
    Hook->>UI: toast success / update optimistic state
```

**Decision rule**: Use this path when:
- The action involves exactly **1 domain** (e.g., bookmarks, likes, task status)
- No cross-plugin coordination is needed after the write

---

## Flow B: Cross-Plugin Coordination (Event Bus Flow)

Use this flow when one plugin needs to **notify** another plugin after completing an operation, without coupling them directly.

```mermaid
sequenceDiagram
    participant PluginA as Plugin (e.g., Tasks)
    participant Bus as WorkspaceEventBus (via useWorkspaceEvents)
    participant Handler as _event-handlers/workspace-event-handler.tsx
    participant Cmd as server-commands
    participant PluginB as Plugin (e.g., Schedule / Issues)

    PluginA->>Bus: publish("workspace:tasks:completed", { task })
    Bus->>Handler: subscriber callback fires
    Handler->>Cmd: await server-commands/schedule/createScheduleItem(...)
    Cmd-->>Handler: void
    Handler->>PluginB: (PluginB re-renders via context or real-time listener)
```

**Decision rule**: Use this path when:
- The action in Plugin A triggers a **side effect in a different plugin** (Plugin B)
- You want zero direct import coupling between Plugin A and Plugin B
- Events are defined in `use-cases/workspace/event-bus/workspace-events.ts`

---

## Flow C: Multi-Step Orchestration (Use-Cases Flow)

Use this flow when a user action requires **≥ 2 server-command calls** that must succeed atomically.

```mermaid
sequenceDiagram
    participant UI as view-modules (e.g., CreateWorkspaceDialog)
    participant UC as use-cases
    participant CmdA as server-commands/workspace
    participant CmdB as server-commands/workspace (mountCapabilities)
    participant FB as @/firebase/

    UI->>UC: await createWorkspaceWithCapabilities(name, account, capabilities)
    UC->>CmdA: await createWorkspace(name, account)
    CmdA->>FB: write workspace doc
    FB-->>CmdA: workspaceId
    CmdA-->>UC: workspaceId
    UC->>CmdB: await mountCapabilities(workspaceId, capabilities)
    CmdB->>FB: write capability docs
    CmdB-->>UC: void
    UC-->>UI: workspaceId
```

**Decision rule**: Use this path when:
- The use case spans **≥ 2 server-command calls**
- Both calls must succeed (atomically grouped in a use-case function)
- The orchestration is **React-free** (callable from Server Actions too)

---

## Flow D: Real-Time State (Provider / Listener Flow)

Use this flow when a component needs **live data** that updates automatically from Firestore.

```mermaid
sequenceDiagram
    participant FB as Firestore (onSnapshot)
    participant Provider as react-providers (e.g., WorkspaceProvider)
    participant Hook as react-hooks/state-hooks
    participant UI as view-modules component

    FB-->>Provider: snapshot fires (real-time listener)
    Provider->>Provider: setState(newData)
    UI->>Hook: calls useWorkspace() / useAccount()
    Hook->>Provider: useContext(WorkspaceContext)
    Provider-->>Hook: { tasks, members, ... }
    Hook-->>UI: { tasks, members, ... }
```

**Decision rule**: Use this path when:
- Data changes in real-time and UI must stay in sync without user action
- Multiple components across the tree need the same data

---

## Quick Decision Guide

| Situation | Use |
|-----------|-----|
| Single-plugin user write (like, bookmark, update status) | **Flow A** — command hook |
| Plugin A triggers side effect in Plugin B | **Flow B** — event bus |
| Single action needs ≥ 2 Firebase writes | **Flow C** — use-case |
| Live data needed by multiple components | **Flow D** — provider listener |
| Pure data validation or business rule check | `domain-rules` directly (no flow needed) |

---

## Event Bus vs Direct Command: When to Choose

| | Event Bus | Direct Command |
|---|-----------|---------------|
| **Coupling** | Zero (publisher doesn't know subscribers) | Explicit (caller knows callee) |
| **Use when** | Cross-plugin coordination | Single-plugin or sequential write |
| **Traceability** | Via `_event-handlers/workspace-event-handler.tsx` | Via hook → server-command call stack |
| **Defined in** | `use-cases/workspace/event-bus/workspace-events.ts` | `server-commands/{domain}/{domain}.commands.ts` |

> See `docs/events.md` for the full list of workspace events and their payloads.
