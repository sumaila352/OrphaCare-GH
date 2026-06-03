'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  resolveTheme,
  type Theme,
  THEME_STORAGE_KEY,
} from '@/lib/theme';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setThemeState(resolveTheme(getStoredTheme()));
    setReady(true);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (!getStoredTheme()) {
        const next = mq.matches ? 'dark' : 'light';
        setThemeState(next);
        applyTheme(next);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (ready) applyTheme(theme);
  }, [theme, ready]);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, next);
    setThemeState(next);
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
