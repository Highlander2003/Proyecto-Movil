import { darkColors, lightColors } from './colors';

export const baseTheme = {
  radius: 14,
  spacing: (n = 1) => 8 * n,
  typography: {
    heading: 24,
    subheading: 18,
    body: 16,
    small: 14
  },
};

export const createTheme = (mode = 'dark') => {
  const colors = mode === 'dark' ? darkColors : lightColors;
  return {
    mode,
    colors,
    ...baseTheme,
    button: {
      height: 48,
      paddingH: 16
    },
    card: {
      padding: 16
    }
  };
};
