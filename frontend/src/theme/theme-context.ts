import { createContext } from 'react';
import type { Theme } from './theme';

export type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
