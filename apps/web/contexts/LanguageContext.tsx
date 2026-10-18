'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import idMessages from '@/locales/id.json';
import enMessages from '@/locales/en.json';

export type Locale = 'id' | 'en';

type Messages = typeof idMessages;

const messagesMap: Record<Locale, Messages> = {
  id: idMessages,
  en: enMessages,
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCALE_COOKIE_NAME = 'rentmate_locale';
const LOCALE_STORAGE_KEY = 'rentmate_locale';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[key];
  }
  return typeof current === 'string' ? current : undefined;
}

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLocale?: Locale;
}> = ({ children, initialLocale = 'id' }) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Read saved locale on mount
  useEffect(() => {
    const saved = (getCookie(LOCALE_COOKIE_NAME) || localStorage.getItem(LOCALE_STORAGE_KEY)) as Locale | null;
    if (saved && (saved === 'id' || saved === 'en')) {
      setLocaleState(saved);
    }
  }, []);

  // Update html lang attribute when locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setCookie(LOCALE_COOKIE_NAME, newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const messages = messagesMap[locale];
    let value = getNestedValue(messages, key);

    if (value === undefined) {
      // Fallback to Indonesian if key not found
      value = getNestedValue(messagesMap.id, key);
    }

    if (value === undefined) {
      // Return the key itself as last fallback
      return key;
    }

    // Replace interpolation params: {{param}}
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value!.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(paramValue));
      });
    }

    return value;
  }, [locale]);

  const contextValue = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Alias for convenience
export const useTranslation = useLanguage;
