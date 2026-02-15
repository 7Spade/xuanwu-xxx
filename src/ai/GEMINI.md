# Project: AI Layer

## 1. Responsibility

This directory contains all logic for interacting with Generative AI models and services via Genkit. It encapsulates the "dirty" details of AI model providers (like Google AI) and defines the application's core AI capabilities as "flows".

It is organized into:
- **`flows/`**: Self-contained Genkit flows that define specific AI-driven business logic (e.g., `adaptUIColorToOrgContext`). Each flow handles its own prompts, input/output schemas, and interaction with the AI model.
- **`genkit.ts`**: The central configuration and initialization file for the Genkit `ai` instance.

## 2. Dependency Rules

This layer must remain independent of the application's UI and state management. It provides server-side functions that can be called from other layers.

### Allowed Imports:
- `src/types`
- `src/lib`

### Disallowed Imports:
- `import ... from '@/hooks/...'`
- `import ... from '@/context/...'`
- `import ... from '@/components/...'`
- `import ... from '@/app/...'`

The AI layer knows nothing about React, hooks, or how the data it provides will be displayed.

## 3. Who Depends on This Layer?

The `infra` or `app` layers (via Server Actions). UI components should not call AI flows directly; they should go through a dedicated action or API route that provides a clean interface to the backend functionality.

## 4. Core Flows

- `adaptUIColorToOrgContext` - Determines appropriate UI colors based on an **organization's** identity description. This flow is specifically triggered for organizational contexts to create a branded theme.
