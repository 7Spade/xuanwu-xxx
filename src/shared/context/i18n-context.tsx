"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, TranslationMessages } from '@/types/i18n';
import { getPreferredLocale, setLocalePreference, loadMessages, i18nConfig } from '@/lib/i18n';

interface I18nContextValue {
  locale: Locale;
  messages: TranslationMessages | null;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
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
  const t = (key: string): string => {
    if (!messages) return key;

    const keys = key.split('.');
    let value: any = messages;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if path not found
      }
    }

    return typeof value === 'string' ? value : key;
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
