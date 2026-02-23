# Project: Internationalization (i18n) Messages

## 1. Responsibility

This directory holds the static JSON files that contain all user-facing text for the application's supported languages. Each file corresponds to a specific locale (e.g., `en.json`, `zh-TW.json`).

This is the **single source of truth for all translated strings**.

## 2. Dependency Rules

These are static data assets; they contain no code and have no dependencies.

### Allowed Imports:
- None.

### Disallowed Imports:
- None.

## 3. Who Depends on This Layer?

The application's internationalization system, specifically the `i18n.ts` configuration file and the `I18nProvider` in `src/shared/ui/app-providers/`, reads these files to load the appropriate messages.

No other part of the application should ever import or read these JSON files directly. All access to translations MUST go through the `useI18n()` hook to ensure consistency and proper context management.
