"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Locale, type TranslationMessages } from '@/shared/i18n-types/i18n';
import { getPreferredLocale, setLocalePreference, loadMessages, i18nConfig } from '@/shared/lib';

interface I18nContextValue {
  locale: Locale;
  messages: TranslationMessages | null;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(i18nConfig.defaultLocale);
  const [messages, setMessages] = useState<TranslationMessages | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize locale on mount
  useEffect(() => {
    const initLocale = getPreferredLocale();
    setLocaleState(initLocale);
  }, []);

  // Load messages when locale changes
  useEffect(() => {
    let isMounted = true;
    
    async function load() {
      setIsLoading(true);
      try {
        const msgs = await loadMessages(locale);
        if (isMounted) {
          setMessages(msgs);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setLocalePreference(newLocale);
  };

  // Translation function with dot notation support
  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!messages) return key;

    const keys = key.split('.');
    let value: unknown = messages;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Return key if path not found
      }
    }

    if (typeof value !== 'string') return key;
    if (!params) return value;
    return value.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
  };

  return (
    <I18nContext.Provider value={{ locale, messages, setLocale, t, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
