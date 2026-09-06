import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

let currentTheme: Theme = (() => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('tt_theme');
  if (saved === 'dark' || saved === 'light') return saved as Theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
})();

const listeners = new Set<(theme: Theme) => void>();

function notify(theme: Theme) {
  currentTheme = theme;
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('tt_theme', theme);
  }
  listeners.forEach((listener) => listener(theme));
}

// Ensure initial DOM state is set immediately
if (typeof document !== 'undefined') {
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(currentTheme);

  useEffect(() => {
    listeners.add(setThemeState);
    return () => {
      listeners.delete(setThemeState);
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    notify(newTheme);
  };

  const toggleTheme = () => {
    notify(currentTheme === 'dark' ? 'light' : 'dark');
  };

  return { theme, setTheme, toggleTheme };
}
