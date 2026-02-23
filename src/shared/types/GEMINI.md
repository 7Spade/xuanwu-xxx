# Shared Module: `types` (`src/shared/types/`)

## Role

Global TypeScript domain types. The ubiquitous language of the system. Zero dependencies.

## Contents

| File | Types |
|------|-------|
| `account.types.ts` | `Account`, `Organization`, `MemberReference`, `Wallet`, `SkillGrant` |
| `workspace.types.ts` | `Workspace`, `Capability`, `CapabilitySettings` |
| `schedule.types.ts` | `ScheduleItem`, `ScheduleStatus`, `ScheduleProposal` |
| `task.types.ts` | `WorkspaceTask`, `TaskTree` |
| `daily.types.ts` | `DailyLog`, `DailyComment` |
| `audit.types.ts` | `AuditLog`, `AuditEventType` |
| `skill.types.ts` | `SkillTag`, `SkillGrant`, `SkillRequirement`, `SkillTier` |
| `user.types.ts` | `User`, `UserProfile` |
| `index.ts` | Re-exports all types |

## Rules

- **Zero dependencies** — no imports from `src/*`
- Only external type-only imports (e.g. `import type { Timestamp } from "firebase/firestore"`)
- No logic, no side effects, no `"use client"`

## Alias

```ts
import type { ScheduleItem } from "@/shared/types";
```
