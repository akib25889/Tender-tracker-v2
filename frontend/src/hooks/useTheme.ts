import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'winter' | 'warm';

let currentTheme: Theme = (() => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('tt_theme');
  if (saved === 'worm') return 'warm';
  if (saved === 'dark' || saved === 'light' || saved === 'winter' || saved === 'warm') return saved as Theme;
  return 'light';
})();

const listeners = new Set<(theme: Theme) => void>();

function applyThemeToDOM(theme: Theme) {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'winter', 'warm', 'worm');
    root.classList.add(theme);
    if (theme === 'warm') {
      root.classList.add('worm'); // alias support
    }
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
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
    if (currentTheme === 'light') {
      notify('dark');
    } else if (currentTheme === 'dark') {
      notify('winter');
    } else if (currentTheme === 'winter') {
      notify('warm');
    } else {
      notify('light');
    }
  };

  return { theme, setTheme, toggleTheme };
}
