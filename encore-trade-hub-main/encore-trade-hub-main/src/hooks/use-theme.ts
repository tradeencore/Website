import { useState, useEffect } from 'react';

type Theme = 'dark'; // Only dark theme is supported now

export function useTheme() {
  // Always use dark theme
  const [theme] = useState<Theme>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Return theme but no setter since we're only using dark theme
  return { theme };
}
