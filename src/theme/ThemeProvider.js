import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as SCThemeProvider } from 'styled-components/native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTheme } from './index';

const useThemeStore = create(
  persist(
    (set) => ({
      themeName: 'dark',
      setTheme: (name) => set({ themeName: name }),
      toggleTheme: () => set((s) => ({ themeName: s.themeName === 'dark' ? 'light' : 'dark' }))
    }),
    { name: 'smartsteps-theme', storage: createJSONStorage(() => AsyncStorage) }
  )
);

const ThemeContext = createContext({ themeName: 'dark', toggleTheme: () => {}, setTheme: () => {} });

export default function AppThemeProvider({ children }) {
  const themeName = useThemeStore((s) => s.themeName);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const theme = useMemo(() => createTheme(themeName), [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, toggleTheme, setTheme }}>
      <SCThemeProvider theme={theme}>{children}</SCThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);
