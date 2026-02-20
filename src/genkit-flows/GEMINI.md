# Genkit Flows Layer (`src/genkit-flows/`)

## Role

Encapsulates all Generative AI logic via Google Genkit. Defines AI flows as typed, composable server-side functions. Knows nothing about React, UI state, or domain invariants.

## Boundary Rules

- 僅封裝 Genkit flow 定義與 AI orchestration。
- 不得包含 UI 元件或 React 程式碼（`"use client"` 禁止）。
- 不得包含 domain 不變條件（邏輯在 `domain-rules`）。
- 不得依賴 `shared`（無需工具函式）。
- 所有 prompt 組裝不得耦合 React 狀態。
- 僅可被 `server-commands` 呼叫。

## Structure

```
genkit-flows/
  genkit.ts              ← central Genkit ai instance configuration
  flows/
    *.flow.ts            ← individual AI flow definitions
```

## Allowed Imports

```ts
import ... from "genkit/*"                // ✅ Genkit SDK
import type ... from "@/domain-types/..."  // ✅ typed I/O schemas
import ... from "@/firebase/..."           // ✅ Firebase data (if needed for context)
```

## Forbidden Imports

```ts
import ... from "react"                    // ❌ no React
import ... from "@/react-hooks/..."        // ❌ no React hooks
import ... from "@/react-providers/..."    // ❌ no React context
import ... from "@/server-commands/..."    // ❌ no upward dependency
import ... from "@/shared/..."             // ❌ no shared utilities
import ... from "@/use-cases/..."          // ❌ no upward dependency
import ... from "@/view-modules/..."       // ❌ no UI
import ... from "@/app/..."                // ❌ no upward dependency
```

## Side Effects

AI flows produce LLM calls (Google AI / Vertex AI). May produce Firebase reads for context retrieval.

## Who Depends on This Layer?

`src/server-commands/` only — all AI calls go through server actions.
