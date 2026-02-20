# Domain Types Layer (`src/domain-types/`)

## Role

Defines all core TypeScript types, interfaces, enums, and value objects for the entire application. This is the ubiquitous language of the system expressed in code. The foundation — everything else depends on it; it depends on nothing.

## Boundary Rules

- 僅定義型別、介面、enum、value object。
- 不得依賴任何其他資料夾（`src/*`）。
- 不得包含邏輯、副作用或非同步程式碼。
- `"use client"` 指令在此層是明確禁止的（ESLint 強制）。

## Allowed Imports

```ts
// None from src/* — only external type packages are permitted
import type { Timestamp } from "firebase/firestore"  // ✅ external type-only
```

## Forbidden Imports

```ts
import ... from "@/firebase/..."          // ❌ no src dependencies
import ... from "@/domain-rules/..."      // ❌ no src dependencies
import ... from "@/server-commands/..."   // ❌ no src dependencies
import ... from "@/react-hooks/..."       // ❌ no src dependencies
import ... from "@/react-providers/..."   // ❌ no src dependencies
import ... from "@/shared/..."            // ❌ no src dependencies
import ... from "@/genkit-flows/..."      // ❌ no src dependencies
import ... from "@/use-cases/..."         // ❌ no src dependencies
import ... from "@/view-modules/..."      // ❌ no src dependencies
import ... from "@/app/..."               // ❌ no src dependencies
```

## Side Effects

**None.** Type definitions only — no runtime code.

## Who Depends on This Layer?

**Every layer.** `domain-rules`, `firebase`, `genkit-flows`, `server-commands`, `use-cases`, `react-hooks`, `react-providers`, `view-modules`, `app`, `shared`.
