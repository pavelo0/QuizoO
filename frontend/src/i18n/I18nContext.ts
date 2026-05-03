import { createContext } from 'react';
import type { Locale, TranslationKey } from './messages';

export type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);
