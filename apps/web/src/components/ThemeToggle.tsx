'use client';

import { useTheme } from './ThemeProvider';

type Props = {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
};

export function ThemeToggle({ className = '', showLabel = false, size = 'md' }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const btnClass = size === 'sm' ? 'btn btn-sm' : 'btn btn-sm';

  return (
    <button
      type="button"
      className={`theme-toggle ${btnClass} ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <i className={`bi ${isDark ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`} aria-hidden />
      {showLabel && <span className="theme-toggle-label">{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
}
