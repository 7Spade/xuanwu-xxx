import { type Locale, type I18nConfig } from "@/shared/i18n-types/i18n"

export const i18nConfig: I18nConfig = {
  defaultLocale: "en",
  locales: ["en", "zh-TW"],
}

/**
 * Get the locale from browser preferences or storage
 */
export function getPreferredLocale(): Locale {
  if (typeof window === "undefined") {
    return i18nConfig.defaultLocale
  }

  // Check localStorage first
  const stored = localStorage.getItem("locale")
  if (stored && i18nConfig.locales.includes(stored as Locale)) {
    return stored as Locale
  }

  // Check browser language
  const browserLang = navigator.language

  // Direct match
  if (i18nConfig.locales.includes(browserLang as Locale)) {
    return browserLang as Locale
  }

  // Check for language prefix match (e.g., 'zh' matches 'zh-TW')
  const langPrefix = browserLang.split("-")[0]
  const match = i18nConfig.locales.find((locale) =>
    locale.toLowerCase().startsWith(langPrefix.toLowerCase())
  )

  return (match as Locale) || i18nConfig.defaultLocale
}

/**
 * Save locale preference to localStorage
 */
export function setLocalePreference(locale: Locale): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("locale", locale)
  }
}

/**
 * Load translation messages for a specific locale
 */
export async function loadMessages(locale: Locale) {
  try {
    const response = await fetch(`/localized-files/${locale}.json`)
    if (!response.ok) {
      throw new Error(`Failed to load locale: ${locale}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error loading locale ${locale}:`, error)
    // Fallback to default locale
    if (locale !== i18nConfig.defaultLocale) {
      return loadMessages(i18nConfig.defaultLocale)
    }
    throw error
  }
}
