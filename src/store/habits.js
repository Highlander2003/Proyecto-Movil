// Store de hábitos (Zustand + persistencia AsyncStorage)
// Responsabilidades:
// - Mantener catálogo de hábitos sugeridos (defaultSuggested)
// - Gestionar hábitos activos del usuario (active)
// - Acciones para añadir desde sugeridos o crear uno nuevo
// - Búsqueda local sobre sugeridos
// Estructuras:
//   suggested: Array<{ id, title, desc, icon }>
//   active:    Array<{
//     id, title, icon,
//     frequency,                // 'Diario' | 'Semanal' | 'Días alternos' | otro
//     dailyRepeats,             // número de repeticiones requeridas por día (>=1)
//     startDate,                // 'YYYY-MM-DD'
//     endDate: string|null,     // 'YYYY-MM-DD' o null para sin fecha fin
//     scheduleType,             // 'exact' | 'offset'
//     exactTime?: string,       // 'hh:mm AM/PM' cuando scheduleType='exact'
//     offsetMinutes?: number    // minutos después de completar la repetición 1 (scheduleType='offset')
//   }>
// Persistencia:
//   Se guarda en la clave 'smartsteps-habits' usando AsyncStorage.
// Notas:
// - Se evita duplicar un sugerido en activos comparando por título.
// - Los hábitos creados manualmente reciben id basado en Date.now().
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Catálogo base de sugeridos para arrancar la app sin backend
const defaultSuggested = [
  { id: 'water', title: 'Beber agua', desc: 'Mantén tu cuerpo hidratado', icon: '💧' },
  { id: 'read10', title: 'Leer 10 minutos', desc: 'Expande tu conocimiento', icon: '📘' },
  { id: 'meditate5', title: 'Meditar 5 minutos', desc: 'Calma tu mente', icon: '🧘' },
  { id: 'walk15', title: 'Caminar 15 minutos', desc: 'Mueve tu cuerpo', icon: '🚶' },
  { id: 'eatHealthy', title: 'Comer saludable', desc: 'Nutre tu cuerpo', icon: '🥗' },
  { id: 'sleep8', title: 'Dormir 8 horas', desc: 'Descansa bien', icon: '😴' },
  { id: 'journal', title: 'Escribir diario', desc: 'Reflexiona sobre tu día', icon: '📝' },
  { id: 'create', title: 'Crear algo', desc: 'Expresa tu creatividad', icon: '🎨' },
];

export const useHabitsStore = create(
  persist(
    (set, get) => ({
      // Lista de sugeridos y hábitos activos del usuario
      suggested: defaultSuggested,
  active: [], // cada item: {id, title, icon, frequency, time, dailyRepeats}
  // Registro de completados por día: { 'YYYY-MM-DD': { [habitId]: number } }
      completions: {},

      /**
       * Crea un hábito personalizado y lo agrega a activos.
       * @param {{id?: string, title: string, icon?: string, frequency?: string, time?: string}} habit
       */
      addHabit: (habit) => set({
        active: [
          ...get().active,
          normalizeHabit({
            ...habit,
            id: habit.id || String(Date.now())
          })
        ]
      }),

      /**
       * Agrega un hábito desde la lista de sugeridos, si no existe ya en activos.
       * Usa el título como llave simple para evitar duplicados.
       */
      addSuggested: (id) => {
        const s = get().suggested.find((h) => h.id === id);
        if (!s) return;
        const exists = get().active.some((a) => a.title === s.title);
        if (exists) return;
        set({ active: [...get().active, normalizeHabit({ ...s, frequency: 'Diario', exactTime: '08:00 AM', scheduleType: 'exact', dailyRepeats: 1 })] });
      },

      /**
       * Busca dentro de sugeridos por título o descripción.
       * @param {string} q consulta a buscar (case-insensitive)
       * @returns array filtrado de sugeridos
       */
      searchSuggested: (q) => {
        const list = get().suggested;
        if (!q) return list;
        const lq = q.toLowerCase();
        return list.filter((h) => h.title.toLowerCase().includes(lq) || h.desc.toLowerCase().includes(lq));
      },

      /** Convierte un valor de completion a número (soporta legado boolean) */
      _toCount: (v) => {
        if (typeof v === 'boolean') return v ? 1 : 0;
        const n = parseInt(v || 0, 10);
        return isNaN(n) ? 0 : Math.max(0, n);
      },

      /** Devuelve la clave de hoy en formato YYYY-MM-DD (local) */
      _todayKey: () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      },
      /** Marca/desmarca un hábito como completado hoy */
      /** Incrementa el conteo de completado hoy hasta el máximo permitido (dailyRepeats) */
      incrementCompleteToday: (habitId) => {
        const key = get()._todayKey();
        const prevMap = get().completions[key] || {};
        const prev = get()._toCount(prevMap[habitId]);
        const h = get().active.find((a) => a.id === habitId);
        const max = Math.max(1, parseInt(h?.dailyRepeats || 1, 10));
        const nextCount = Math.min(max, prev + 1);
        const nextMap = { ...prevMap, [habitId]: nextCount };
        set({ completions: { ...get().completions, [key]: nextMap } });
      },
      /** Obtiene el conteo de completado hoy */
      getTodayCount: (habitId) => {
        const key = get()._todayKey();
        return get()._toCount(get().completions[key]?.[habitId]);
      },
      /** Indica si el hábito tiene al menos 1 completado hoy (compatibilidad) */
      isCompletedToday: (habitId) => {
        const key = get()._todayKey();
        return get()._toCount(get().completions[key]?.[habitId]) > 0;
      },
      /** Obtiene claves de los últimos N días (incluye hoy) */
      _lastNDaysKeys: (n = 7) => {
        const keys = [];
        const d = new Date();
        for (let i = 0; i < n; i++) {
          const di = new Date(d);
          di.setDate(d.getDate() - i);
          const y = di.getFullYear();
          const m = String(di.getMonth() + 1).padStart(2, '0');
          const day = String(di.getDate()).padStart(2, '0');
          keys.push(`${y}-${m}-${day}`);
        }
        return keys;
      },

      /** Actualiza un hábito existente por id con los campos proporcionados */
      updateHabit: (id, patch) => set({
        active: get().active.map((h) => h.id === id ? normalizeHabit({ ...h, ...patch, id }) : h)
      }),

      /** Elimina un hábito por id y limpia sus completions registrados */
      removeHabit: (id) => {
        const nextActive = get().active.filter((h) => h.id !== id);
        const prevComps = get().completions || {};
        const nextComps = {};
        Object.keys(prevComps).forEach((dayKey) => {
          const map = { ...(prevComps[dayKey] || {}) };
          if (Object.prototype.hasOwnProperty.call(map, id)) {
            delete map[id];
          }
          nextComps[dayKey] = map;
        });
        set({ active: nextActive, completions: nextComps });
      },
    }),
    {
      name: 'smartsteps-habits',
      storage: createJSONStorage(() => AsyncStorage),
      // Persistimos activos, sugeridos y completions
      partialize: (s) => ({ active: s.active, suggested: s.suggested, completions: s.completions }),
      version: 2,
      migrate: (state, version) => {
        if (!state) return state;
        if (version < 2) {
          const a = Array.isArray(state.active) ? state.active.map((h) => normalizeHabit(h)) : [];
          // completions puede contener booleanos: mantener
          return { ...state, active: a };
        }
        return state;
      }
    }
  )
);

// Helpers
function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function normalizeHabit(h) {
  // Defaults
  const dailyRepeats = Math.max(1, parseInt(h.dailyRepeats || 1, 10));
  const startDate = h.startDate || todayKey();
  const endDate = typeof h.endDate === 'string' ? h.endDate : null;
  let scheduleType = h.scheduleType;
  let exactTime = h.exactTime;
  let offsetMinutes = typeof h.offsetMinutes === 'number' ? h.offsetMinutes : undefined;

  // Compatibilidad con 'time' previo
  if (!scheduleType) {
    if (typeof h.time === 'string' && h.time.trim()) {
      scheduleType = 'exact';
      exactTime = h.time;
    } else {
      scheduleType = 'exact';
      exactTime = '08:00 AM';
    }
  }

  if (scheduleType === 'offset') {
    if (!Number.isFinite(offsetMinutes)) offsetMinutes = 60; // por defecto 60 min
    exactTime = undefined;
  } else {
    // exact
    if (!exactTime) exactTime = '08:00 AM';
    offsetMinutes = undefined;
  }

  return {
    id: h.id,
    title: h.title,
    icon: h.icon || '✅',
    frequency: h.frequency || 'Diario',
    dailyRepeats,
    startDate,
    endDate,
    scheduleType,
    exactTime,
    offsetMinutes,
  };
}
