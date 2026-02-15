# Project: Server-Side Cloud Functions

## 1. Responsibility

This directory contains all backend logic deployed as **Firebase Cloud Functions**. This is a separate, server-side Node.js environment, completely decoupled from the Next.js frontend application.

Its responsibilities include:
- **Database Triggers**: Reacting to events in Firestore (e.g., `onWrite`, `onCreate`).
- **Scheduled Tasks**: Running periodic jobs (e.g., nightly cleanups).
- **Callable Functions**: Providing secure, server-side business logic that can be invoked directly from the client application.
- **HTTP Endpoints**: Creating custom API endpoints for specific server-side tasks.

## 2. Dependency Rules

This is a self-contained application and MUST NOT interact with the frontend codebase.

### Allowed Imports:
- `firebase-admin` for privileged backend access.
- `firebase-functions` for defining triggers and functions.
- Official Node.js built-in modules.

### Disallowed Imports:
- **CRITICAL**: No imports from the `src/` directory are permitted. This environment has no knowledge of React, Next.js, components, hooks, or frontend contexts.

## 3. Who Depends on This Layer?

The Next.js client application can **invoke** these functions (e.g., via an HTTP request or the Firebase SDK's `httpsCallable`), but it **cannot** import any code directly from this `functions` directory. They are two separate, deployed applications that communicate over the network.
