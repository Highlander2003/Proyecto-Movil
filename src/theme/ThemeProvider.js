// Proveedor de tema de la app
// - Expone: themeName, toggleTheme, setTheme mediante un contexto propio
// - Integra styled-components ThemeProvider para entregar el objeto `theme` a los estilos
// - Persiste la preferencia (oscuro/claro) en AsyncStorage con Zustand
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { ThemeProvider as SCThemeProvider } from 'styled-components/native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTheme } from './index';
import { Appearance, AccessibilityInfo } from 'react-native';
import { normalizeTextScale, recommendTheme } from '../services/adaptive';

// Store minimalista para el tema con persistencia
const useThemeStore = create(
  persist(
    (set, get) => ({
      themeName: 'dark', // modo por defecto
      adaptiveTheme: true, // adapta según sistema/hora
      adaptiveText: true, // adapta tamaño de texto según accesibilidad
      textScale: 1,
      // Cambia directamente a un modo específico ('dark' | 'light')
      setTheme: (name) => set({ themeName: name }),
      // Alterna entre oscuro y claro
      toggleTheme: () => set((s) => ({ themeName: s.themeName === 'dark' ? 'light' : 'dark' })),
      // Habilita/deshabilita la adaptación de tema
      setAdaptiveTheme: (val) => set({ adaptiveTheme: !!val }),
      // Habilita/deshabilita la adaptación de texto
      setAdaptiveText: (val) => set({ adaptiveText: !!val }),
      // Establece escala de texto
      setTextScale: (scale) => set({ textScale: scale }),
      // Aplica recomendación inmediata de tema
      applyAdaptiveThemeNow: () => {
        const name = recommendTheme({ deviceScheme: Appearance.getColorScheme?.() });
        set({ themeName: name });
      }
    }),
    { name: 'smartsteps-theme', storage: createJSONStorage(() => AsyncStorage) }
  )
);

// Contexto para exponer acciones y el nombre del tema a la app
const ThemeContext = createContext({
  themeName: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  adaptiveTheme: true,
  setAdaptiveTheme: () => {},
  adaptiveText: true,
  setAdaptiveText: () => {},
});

export default function AppThemeProvider({ children }) {
  // Lee valores/acciones del store persistido
  const themeName = useThemeStore((s) => s.themeName);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const adaptiveTheme = useThemeStore((s) => s.adaptiveTheme);
  const setAdaptiveTheme = useThemeStore((s) => s.setAdaptiveTheme);
  const adaptiveText = useThemeStore((s) => s.adaptiveText);
  const setAdaptiveText = useThemeStore((s) => s.setAdaptiveText);
  const textScale = useThemeStore((s) => s.textScale);
  const setTextScale = useThemeStore((s) => s.setTextScale);
  const applyAdaptiveThemeNow = useThemeStore((s) => s.applyAdaptiveThemeNow);

  // Memoiza el objeto de tema para evitar recalcular estilos innecesariamente
  const theme = useMemo(() => createTheme(themeName, textScale), [themeName, textScale]);

  // Efecto: aplicar tema adaptativo y suscribir a cambios de esquema del sistema
  useEffect(() => {
    if (!adaptiveTheme) return; // no hacer nada si el usuario lo desactiva

    // Aplicación inmediata según recomendación
    applyAdaptiveThemeNow();

    // Suscribirse a cambios de apariencia del sistema
    const sub = Appearance?.addChangeListener?.(({ colorScheme }) => {
      const name = recommendTheme({ deviceScheme: colorScheme });
      setTheme(name);
    });
    return () => {
      // RN 0.73+: addChangeListener devuelve objeto con remove()
      try {
        sub?.remove?.();
      } catch (_) {
        // ignorar
      }
    };
  }, [adaptiveTheme, setTheme, applyAdaptiveThemeNow]);

  // Efecto: ajustar escala de texto según configuración de accesibilidad
  useEffect(() => {
    let mounted = true;
    if (!adaptiveText) return;
    AccessibilityInfo.getFontScale?.().then((scale) => {
      if (!mounted) return;
      const normalized = normalizeTextScale(scale || 1);
      setTextScale(normalized);
    });
    return () => {
      mounted = false;
    };
  }, [adaptiveText, setTextScale]);

  return (
    <ThemeContext.Provider value={{ themeName, toggleTheme, setTheme, adaptiveTheme, setAdaptiveTheme, adaptiveText, setAdaptiveText }}>
      {/* Este ThemeProvider hace que `theme` esté disponible en styled-components */}
      <SCThemeProvider theme={theme}>{children}</SCThemeProvider>
    </ThemeContext.Provider>
  );
}

// Hook de conveniencia para consumir el contexto desde cualquier componente
export const useAppTheme = () => useContext(ThemeContext);
