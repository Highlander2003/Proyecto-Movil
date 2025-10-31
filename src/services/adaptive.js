// Utilidades de adaptación de UI (tema y tipografía)
// - recommendTheme: decide oscuro/claro según esquema del sistema y hora local
// - clamp: limita un valor a un rango

import { Appearance } from 'react-native';

/**
 * Recomienda un modo de tema ("dark" | "light") usando:
 * - Esquema del sistema (si está disponible) como señal principal
 * - Hora local como respaldo (noche => oscuro, día => claro)
 * @param {{ deviceScheme?: 'dark' | 'light' | null, hour?: number }} params
 * @returns {'dark' | 'light'}
 */
export function recommendTheme(params = {}) {
  const deviceScheme = params.deviceScheme ?? Appearance?.getColorScheme?.();
  const now = new Date();
  const hour = typeof params.hour === 'number' ? params.hour : now.getHours();

  if (deviceScheme === 'dark') return 'dark';
  if (deviceScheme === 'light') return 'light';

  // Respaldo simple por hora local: 19:00–06:59 => oscuro; 07:00–18:59 => claro
  const isNight = hour >= 19 || hour < 7;
  return isNight ? 'dark' : 'light';
}

/**
 * Limita un número entre min y max
 */
export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Normaliza la escala de texto del sistema a un rango acotado para la app.
 * @param {number} systemScale p.ej. 0.85, 1, 1.15 dependiendo de accesibilidad
 * @returns {number} escala acotada (0.9–1.2)
 */
export function normalizeTextScale(systemScale = 1) {
  // Acotar a un rango razonable para no romper el layout
  return clamp(systemScale, 0.9, 1.2);
}
