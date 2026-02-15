# Project: Infrastructure Layer

## 1. Responsibility

This directory is the "engine room" of the application. It contains all logic for interacting with external services (e.g., Firebase Authentication, Firestore, Storage). It encapsulates the "dirty" details of SDKs and APIs.

It is organized into:
- **`adapters`**: Direct, low-level calls to the external SDKs (e.g., `addDoc`, `signInWithEmailAndPassword`).
- **`facades`**: High-level business operations that may compose multiple adapter calls (e.g., `createWorkspace`, `recruitOrganizationMember`).

## 2. Dependency Rules

This layer must remain independent of the application's UI and state management.

### Allowed Imports:
- `src/types`
- `src/lib`

### Disallowed Imports:
- `import ... from '@/hooks/...'`
- `import ... from '@/context/...'`
- `import ... from '@/components/...'`
- `import ... from '@/ai/...'`
- `import ... from '@/app/...'`

The infrastructure layer knows nothing about React, hooks, or how the data it provides will be displayed.

## 3. Who Depends on This Layer?

The `context` and `hooks` layers. UI components (`app`, `components`) MUST NOT import from `infra` directly; they must go through the state management (`context`) or logic (`hooks`) layers.
