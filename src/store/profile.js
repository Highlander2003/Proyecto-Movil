// Store de perfil de usuario (datos personales adicionales)
// - Persiste nombre preferido (opcional, además de displayName de Auth), edad, género, bio, ubicación
// - Puede ampliarse con medidas, objetivos, etc.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfile, updateUserProfile } from '../services/firebase';

export const useProfileStore = create(
  persist(
    (set, get) => ({
      // Datos personales
      preferredName: '', // opcional; si vacío, se usa displayName de Auth
      age: null, // número o null
      gender: '', // 'masculino' | 'femenino' | 'otro' | ''
      bio: '',
      location: '',
      // Actualización parcial
      setProfile: (partial) => set({ ...get(), ...partial }),
      // Carga datos desde backend/local para un uid
      loadRemoteProfile: async (uid) => {
        try {
          const data = await fetchUserProfile(uid);
          if (data) set({ ...get(), ...data });
          return { ok: true, data: data || null };
        } catch (e) {
          return { ok: false, error: e };
        }
      },
      // Actualiza datos remotos y refleja en el store
      saveRemoteProfile: async (uid, partial) => {
        try {
          const current = get();
          const merged = { ...current, ...partial };
          const saved = await updateUserProfile(uid, partial);
          set(merged);
          return { ok: true, data: saved };
        } catch (e) {
          return { ok: false, error: e };
        }
      },
      // Limpia datos
      clearProfile: () => set({ preferredName: '', age: null, gender: '', bio: '', location: '' })
    }),
    { name: 'smartsteps-profile', storage: createJSONStorage(() => AsyncStorage) }
  )
);
