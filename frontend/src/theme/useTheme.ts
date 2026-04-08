import { useContext } from 'react';
import { ThemeContext } from './theme-context';

export function useTheme() {
  const c = useContext(ThemeContext);
  if (!c) throw new Error('useTheme needs ThemeProvider');
  return c;
}
