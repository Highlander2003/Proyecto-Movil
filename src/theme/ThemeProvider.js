// Proveedor de tema de la app
// - Expone: themeName, toggleTheme, setTheme mediante un contexto propio
// - Integra styled-components ThemeProvider para entregar el objeto `theme` a los estilos
// - Persiste la preferencia (oscuro/claro) en AsyncStorage con Zustand
import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as SCThemeProvider } from 'styled-components/native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTheme } from './index';

// Store minimalista para el tema con persistencia
const useThemeStore = create(
  persist(
    (set) => ({
      themeName: 'dark', // modo por defecto
      // Cambia directamente a un modo específico ('dark' | 'light')
      setTheme: (name) => set({ themeName: name }),
      // Alterna entre oscuro y claro
      toggleTheme: () => set((s) => ({ themeName: s.themeName === 'dark' ? 'light' : 'dark' }))
    }),
    { name: 'smartsteps-theme', storage: createJSONStorage(() => AsyncStorage) }
  )
);

// Contexto para exponer acciones y el nombre del tema a la app
const ThemeContext = createContext({ themeName: 'dark', toggleTheme: () => {}, setTheme: () => {} });

export default function AppThemeProvider({ children }) {
  // Lee valores/acciones del store persistido
  const themeName = useThemeStore((s) => s.themeName);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const setTheme = useThemeStore((s) => s.setTheme);

  // Memoiza el objeto de tema para evitar recalcular estilos innecesariamente
  const theme = useMemo(() => createTheme(themeName), [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, toggleTheme, setTheme }}>
      {/* Este ThemeProvider hace que `theme` esté disponible en styled-components */}
      <SCThemeProvider theme={theme}>{children}</SCThemeProvider>
    </ThemeContext.Provider>
  );
}

// Hook de conveniencia para consumir el contexto desde cualquier componente
export const useAppTheme = () => useContext(ThemeContext);
