import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

let currentTheme: Theme = (() => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('tt_theme');
  if (saved === 'dark' || saved === 'light') return saved as Theme;
  return 'light';
})();

const listeners = new Set<(theme: Theme) => void>();

function applyThemeToDOM(theme: Theme) {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }
}

function notify(theme: Theme) {
  currentTheme = theme;
  applyThemeToDOM(theme);
  if (typeof window !== 'undefined') {
    localStorage.setItem('tt_theme', theme);
  }
  listeners.forEach((listener) => listener(theme));
}

// Ensure initial DOM state is set immediately
applyThemeToDOM(currentTheme);

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
