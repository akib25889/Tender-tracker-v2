import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'tt_theme';
// 'winter', 'warm' and 'worm' were retired in the token migration; anyone
// still holding one of those lands on light.

function readStored(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    // Anything else — a retired theme, or a value from an older build —
    // is normalised, so storage only ever holds 'light' or 'dark'.
    if (saved !== null) localStorage.setItem(STORAGE_KEY, 'light');
  } catch {
    /* storage unavailable — fall through to the default */
  }
  return 'light';
}

let currentTheme: Theme = readStored();

const listeners = new Set<(theme: Theme) => void>();

function applyThemeToDOM(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark', 'light', 'winter', 'warm', 'worm');
  root.classList.add(theme);
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;
}

function notify(theme: Theme) {
  currentTheme = theme;
  applyThemeToDOM(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* the choice just will not persist */
  }
  listeners.forEach((listener) => listener(theme));
}

applyThemeToDOM(currentTheme);

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(currentTheme);

  useEffect(() => {
    listeners.add(setThemeState);
    return () => {
      listeners.delete(setThemeState);
    };
  }, []);

  return {
    theme,
    setTheme: (next: Theme) => notify(next),
    toggleTheme: () => notify(currentTheme === 'dark' ? 'light' : 'dark'),
  };
}
