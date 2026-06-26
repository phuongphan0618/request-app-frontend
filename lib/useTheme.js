'use client';
import { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';

const useSyncEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useSyncEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved !== null) setIsDark(saved === 'dark');
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
