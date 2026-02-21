# Shared Module: `lib` (`src/shared/lib/`)

## Role

Pure utilities and domain business rules. No React, no I/O, no async. Deterministic functions only.

## Maps From (Legacy)

- `src/domain-rules/` — all rule files move here
- `src/shared/utils/` — utility helpers move here

## Contents

| File | Exports |
|------|---------|
| `account.rules.ts` | `isOwner`, `setupOrganizationWithTeam` |
| `schedule.rules.ts` | `canTransitionScheduleStatus` |
| `skill.rules.ts` | `TIER_DEFINITIONS`, `resolveSkillTier`, `tierSatisfies`, `grantSatisfiesRequirement` |
| `task.rules.ts` | `buildTaskTree` |
| `workspace.rules.ts` | `filterVisibleWorkspaces` |
| `user.rules.ts` | `getUserTeamIds` |
| `format-bytes.ts` | `formatBytes` |
| `i18n.ts` | `getI18nMessage` |
| `utils.ts` | `cn()`, `hexToHsl()` |
| `index.ts` | Re-exports all |

## Rules

- Only depends on `@/shared/types`
- No React, no Firebase, no network calls
- Pure functions with no side effects

## Alias

```ts
import { canTransitionScheduleStatus } from "@/shared/lib";
import { cn } from "@/shared/lib";
```
