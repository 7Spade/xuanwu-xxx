# Feature Slice: `user-settings`

## Domain

User personal settings — profile, preferences (language/theme), security (password change).

## Responsibilities

- Display and update user profile (name, avatar)
- Change language and theme preferences
- Change password

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `updateProfile`, `updatePassword`, `updatePreferences` |
| `_components/` | `UserSettingsView`, `UserSettings`, `ProfileCard`, `PreferencesCard`, `SecurityCard` |
| `index.ts` | Public exports |

## Maps From (Legacy)

- `src/server-commands/user/` → `_actions.ts`
- `src/view-modules/user-settings/` → `_components/`

## Public API (`index.ts`)

```ts
export { UserSettingsView } from "./_components/user-settings-view";
```

## Who Uses This Slice?

- `app/dashboard/account/settings/page.tsx`
