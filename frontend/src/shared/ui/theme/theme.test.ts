import { afterEach, describe, expect, it } from 'vitest';
import {
  applyTheme,
  getStoredTheme,
  setStoredTheme,
  toggleTheme,
} from './theme';

afterEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('theme', () => {
  it('по умолчанию тёмная и переключается', () => {
    expect(getStoredTheme()).toBe('dark');
    expect(toggleTheme('dark')).toBe('light');
    setStoredTheme('light');
    expect(getStoredTheme()).toBe('light');
    applyTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});
