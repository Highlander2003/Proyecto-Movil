# Función Adaptativa (IA ligera)

Este avance incorpora una lógica adaptativa en la app que ajusta automáticamente:

- Tema (oscuro/claro) según el esquema del sistema y la hora del día.
- Tamaño de tipografía según la configuración de accesibilidad del dispositivo.

La idea es mejorar la usabilidad con un comportamiento "inteligente" sin depender de un backend o API externa.

## Propósito

- Reducir fricción: si el sistema está en modo oscuro, la app se adapta. Si es de noche, se prioriza el tema oscuro.
- Mejor legibilidad: si el usuario incrementa el tamaño de fuente en el sistema, la app escala la tipografía para mantener la accesibilidad.

## Tecnología y módulos

- React Native `Appearance` para detectar el esquema del sistema.
- React Native `AccessibilityInfo` para obtener la escala de texto del sistema.
- Zustand + AsyncStorage para persistir preferencias.
- `src/services/adaptive.js` contiene:
  - `recommendTheme`: heurística de tema.
  - `normalizeTextScale`: normaliza la escala de tipografía.
- `src/services/recommendations.js`:
  - `getDailyChallenge`: recomienda un "Reto de hoy" según hora del día evitando duplicados.
- `src/theme/ThemeProvider.js`:
  - Flags `adaptiveTheme` y `adaptiveText`.
  - Suscripción a cambios del sistema y aplicación automática.
  - `textScale` propaga una tipografía escalada mediante `createTheme`.
- `src/theme/index.js` ahora acepta un segundo parámetro para escalar tipografías.

## Cómo usar

- Ir a Perfil > Configuración.
- Activar/desactivar:
  - "Tema adaptativo": el tema seguirá el sistema/hora.
  - "Texto adaptativo": la tipografía se escalará según accesibilidad.
- El switch de "Modo oscuro" mantiene control manual inmediato (si desactivas el adaptativo).

En Inicio (Home):
- Verás un saludo con tu nombre.
- Una tarjeta con el "Reto de hoy" recomendado y un botón para agregarlo a tus hábitos.
- La tarjeta indica explícitamente "Recomendación generada por IA" para dar transparencia.
- Un progreso semanal circular (demostrativo). 
- Lista de hábitos activos con barras de progreso.

## Pruebas (Android/iOS)

1. Cambia el modo del sistema (oscuro/claro) y vuelve a la app: el tema debe corresponder.
2. Cambia la hora del dispositivo a una nocturna (p. ej., 21:00) y fuerza cierre/abre la app (si tu SO no notifica cambios a apps en segundo plano): deberá mostrarse oscuro.
3. Ajusta el tamaño de fuente del sistema (accesibilidad) y vuelve a la app: los textos aumentarán/disminuirán de manera acotada.

## Capturas y video (añadir)

- [ ] Captura: Perfil > Configuración mostrando "Tema adaptativo" y "Texto adaptativo".
- [ ] Captura: Pantalla en modo claro.
- [ ] Captura: Pantalla en modo oscuro.
- [ ] Video corto (10–20s) alternando modo del sistema y mostrando el cambio en la app.

## Notas

- Límite de escala de tipografía: 0.9–1.2 para proteger el layout. Se puede ajustar.
- La suscripción al esquema del sistema se cancela al desmontar. No se requiere permiso.
- La StatusBar ahora también se adapta al tema.
