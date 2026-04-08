const KEY = 'quizoo-theme';
export type Theme = 'dark' | 'light';

export function getStoredTheme(): Theme {
  try {
    const theme = localStorage.getItem(KEY);
    if (theme === 'dark' || theme === 'light') return theme;
  } catch {
    /* storage unavailable */
  }
  return 'dark';
}

export function setStoredTheme(theme: Theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* storage unavailable */
  }
}
export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme =
    theme === 'dark' ? 'dark' : 'light';
}
export function toggleTheme(current: Theme): Theme {
  return current === 'dark' ? 'light' : 'dark';
}
