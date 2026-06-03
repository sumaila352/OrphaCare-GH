export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'orphacare-theme';

export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(THEME_STORAGE_KEY);
  return v === 'light' || v === 'dark' ? v : null;
}

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(stored: Theme | null): Theme {
  return stored ?? getSystemTheme();
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-bs-theme', theme);
  root.style.colorScheme = theme;
}
