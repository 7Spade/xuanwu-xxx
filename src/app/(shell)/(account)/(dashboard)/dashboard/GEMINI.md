# Dashboard Architecture

This document outlines the high-level entity relationships and event flow within the dashboard module.

## 1. Entity & Ownership Model

The core architectural entities and their relationships are as follows:

```
[ User Account ]──────────┐
                           │ owns via `dimensionId`
[ Organization Account ]───┼──────────►[ Workspace ]
                           │                │
                           │                └─ Capabilities
                           │                    ├─ emit(event)
                           │                    │
                           ▼                    ▼
                           └─ Members      WorkspaceEventBus
                              Teams           ├─ Route / Filter
                              Partners        ├─ Policy / Permission Check
                                              ▼
                                              Capabilities (same workspace only)

```

## 2. Core Principles

### Event Flow Example

1.  A Capability emits an event to the `WorkspaceEventBus`.
2.  The `EventBus` checks policies and permissions, then routes the event to other subscribed Capabilities **within the same Workspace**.
3.  Subscribed Capabilities respond to the event. Cross-workspace communication is forbidden.

### Workspace Creation Process

1.  A `User` or `Organization` (the `activeAccount`) calls a facade function `createWorkspace()`.
2.  The facade creates the `Workspace` data, setting the `dimensionId` to the `activeAccount.id`.
3.  The facade calls the appropriate `Firebase Adapter` to create the data in Firestore.
4.  The new `Workspace` initializes its own scoped `WorkspaceEventBus`.
5.  Mounted `Capabilities` can only operate on resources within their parent `Workspace`.
