// Definición del tema de la app
// - baseTheme: tokens neutrales (radio, espaciados, tipografía)
// - createTheme(mode): combina baseTheme con la paleta de colores según el modo (dark/light)
import { darkColors, lightColors } from './colors';

export const baseTheme = {
  // Radio de las esquinas redondeadas por defecto
  radius: 14,
  // Escala de espaciado en múltiplos de 8 (8,16,24,...) para consistencia vertical/horizontal
  spacing: (n = 1) => 8 * n,
  // Tamaños de fuente base; puedes variarlos por plataforma si lo requieres
  typography: {
    heading: 24,
    subheading: 18,
    body: 16,
    small: 14
  },
};

export const createTheme = (mode = 'dark') => {
  // Selecciona la paleta por modo
  const colors = mode === 'dark' ? darkColors : lightColors;
  return {
    // Modo activo ("dark" | "light")
    mode,
    // Paleta de colores seleccionada
    colors,
    // Tokens neutrales disponibles en theme.*
    ...baseTheme,
    // Tokens de componentes comunes para uso consistente
    button: {
      height: 48,   // altura de botones principales
      paddingH: 16  // padding horizontal interno
    },
    card: {
      padding: 16   // padding interno de tarjetas
    }
  };
};
