import type { TranslationMessages } from './i18n.schema';

export type Locale = 'en' | 'zh-TW';

export interface I18nConfig {
  defaultLocale: Locale;
  locales: Locale[];
}

// The schema is now imported and re-exported for consumers.
// This keeps the schema definition in a separate file without breaking imports.
export type { TranslationMessages };
