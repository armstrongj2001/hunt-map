import React, { createContext, useContext, useState } from 'react';
import { lightTheme, darkTheme } from './colors';

// Spacing scale (4px grid from design brief)
export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  base: 16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// Type scale from design brief
export const fontSize = {
  hero:    32,
  section: 24,
  card:    18,
  body:    16,
  caption: 14,
  label:   12,
  overline: 11,
};

export const fontWeight = {
  regular:   '400',
  medium:    '500',
  semibold:  '600',
  bold:      '700',
};

export const borderRadius = {
  sm:   8,
  md:   12,
  lg:   16,
  pill: 20,
  full: 9999,
};

// Theme context — provides colors + dark mode toggle to every component
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const colors = isDark ? darkTheme : lightTheme;

  function toggleTheme() {
    setIsDark(prev => !prev);
  }

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook — call useTheme() in any component to get colors + toggle
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
