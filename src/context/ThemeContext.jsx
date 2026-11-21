import { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeContext } from './ThemeContextCore';

export const THEME_STORAGE_KEY = 'applytrack_theme';

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    // Default to dark mode for existing and new users
    return 'dark';
  });

  const applyThemeToDOM = useCallback((newTheme) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', newTheme);
    root.classList.remove('dark', 'light');
    root.classList.add(newTheme);
  }, []);

  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme, applyThemeToDOM]);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
