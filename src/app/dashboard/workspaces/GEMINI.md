# Workspace Flow Sequences

This document details the sequence of operations for workspace creation and inter-capability event communication.

## 1. Workspace Creation Flow

This sequence describes how a new workspace is initialized from a user or organization action.

```
[User / Organization]
        │
        │ createWorkspace(data)
        ▼
[WorkspaceRepository.createWorkspace()]
        │  ──> Check: caller must be User / Organization
        ▼
[Firebase Firestore / Storage Adapter]
        │  ──> create workspace doc / initialize folders
        ▼
[Workspace Initialized]
        │
        ├─ WorkspaceEventBus Initialization
        │    ├─ Route / Filter
        │    └─ Policy / Permission Check
        │
        └─ Capabilities can be used within the Workspace
```

## 2. Capability Event Flow

This sequence shows how decoupled capabilities communicate within a single workspace via the event bus.

```
Capability (tasks/qa/acceptance)
       │
       │ emit(event)
       │  ──> event payload
       ▼
WorkspaceEventBus
 ├─ Route / Filter ──> Confirm which Capabilities are subscribed to this event
 ├─ Policy / Permission Check ──> Confirm the event initiation Capability's permissions
 └─ Send the event to subscribed Capabilities within the same Workspace
       │
       ▼
Subscribed Capability(s)
 ├─ Receive event payload
 ├─ Update status / UI
 └─ When data needs to be written
       │
       ▼
WorkspaceRepository
 ├─ Read / Write request
 ├─ Permission check (confirms the Capability can operate on Workspace resources)
 └─ Call Adapter
       │
       ▼
Firebase Adapter
 ├─ Read Adapter ──> Retrieve data
 └─ Write Adapter ──> Write data (Firestore / Storage)
```
