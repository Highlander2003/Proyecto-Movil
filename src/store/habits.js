import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      suggested: defaultSuggested,
      active: [], // {id, title, icon, frequency, time}
      addHabit: (habit) => set({ active: [...get().active, { ...habit, id: habit.id || String(Date.now()) }] }),
      addSuggested: (id) => {
        const s = get().suggested.find((h) => h.id === id);
        if (!s) return;
        const exists = get().active.some((a) => a.title === s.title);
        if (exists) return;
        set({ active: [...get().active, { ...s, frequency: 'Diario', time: '08:00' }] });
      },
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
      partialize: (s) => ({ active: s.active, suggested: s.suggested })
    }
  )
);
