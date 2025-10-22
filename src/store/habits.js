// Store de hábitos (Zustand + persistencia AsyncStorage)
// Responsabilidades:
// - Mantener catálogo de hábitos sugeridos (defaultSuggested)
// - Gestionar hábitos activos del usuario (active)
// - Acciones para añadir desde sugeridos o crear uno nuevo
// - Búsqueda local sobre sugeridos
// Estructuras:
//   suggested: Array<{ id, title, desc, icon }>
//   active:    Array<{ id, title, icon, frequency, time }>
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
      active: [], // cada item: {id, title, icon, frequency, time}

      /**
       * Crea un hábito personalizado y lo agrega a activos.
       * @param {{id?: string, title: string, icon?: string, frequency?: string, time?: string}} habit
       */
      addHabit: (habit) => set({
        active: [
          ...get().active,
          { ...habit, id: habit.id || String(Date.now()) }
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
        set({ active: [...get().active, { ...s, frequency: 'Diario', time: '08:00' }] });
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
    }),
    {
      name: 'smartsteps-habits',
      storage: createJSONStorage(() => AsyncStorage),
      // Persistimos activos y sugeridos (por si se extiende el catálogo localmente)
      partialize: (s) => ({ active: s.active, suggested: s.suggested })
    }
  )
);
