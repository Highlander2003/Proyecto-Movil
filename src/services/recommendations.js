// Recomendador simple para "Reto de hoy"
// Heurística basada en hora del día y hábitos activos/añadidos
// Preferimos sugerencias que aún no estén en activos.

/**
 * Obtiene un reto sugerido para hoy en base a la hora y evitando duplicados.
 * @param {{ active: Array, suggested: Array, now?: Date }} params
 * @returns {object|null} hábito sugerido o null si no hay opciones
 */
export function getDailyChallenge({ active = [], suggested = [], now = new Date() } = {}) {
  const hour = now.getHours();
  const isMorning = hour >= 5 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 19;
  const isNight = hour >= 19 || hour < 5;

  // Mapear candidatos por franja
  const pickIds = [];
  if (isMorning) pickIds.push('water', 'walk15', 'read10');
  if (isAfternoon) pickIds.push('walk15', 'create', 'read10');
  if (isNight) pickIds.push('meditate5', 'sleep8', 'journal');
  // Asegurar un respaldo general
  pickIds.push('eatHealthy');

  const activeTitles = new Set(active.map((a) => a.title));

  // Buscar en orden el primer sugerido que no esté activo
  for (const id of pickIds) {
    const s = suggested.find((x) => x.id === id);
    if (s && !activeTitles.has(s.title)) return s;
  }

  // Si todos los candidatos están activos, devolver el primero no activo
  const fallback = suggested.find((x) => !activeTitles.has(x.title));
  return fallback || null;
}
