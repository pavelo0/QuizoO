import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ThemeContext } from './theme-context';
import {
  applyTheme,
  getStoredTheme,
  setStoredTheme,
  toggleTheme,
  type Theme,
} from './theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    setStoredTheme(t);
    applyTheme(t);
  }, []);

  const toggle = useCallback(() => {
    setTheme(toggleTheme(theme));
  }, [theme, setTheme]);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
