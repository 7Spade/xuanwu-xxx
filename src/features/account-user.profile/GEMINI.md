# Feature Slice: `account-user.profile`

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

## Public API (`index.ts`)

```ts
export { UserSettingsView } from "./_components/user-settings-view";
```

## Who Uses This Slice?

- `app/dashboard/account/settings/page.tsx`
