import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initAuthListener, authSignIn, authRegister, authSignOut } from '../services/firebase';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      _hasHydrated: false,
      setHydrated: () => set({ _hasHydrated: true }),
      setUser: (user) => set({ user }),
      startAuthListener: () => {
        const unsub = initAuthListener((user) => set({ user }));
        set({ _unsubscribeAuth: unsub });
      },
      stopAuthListener: () => {
        const u = get()._unsubscribeAuth;
        if (u) u();
        set({ _unsubscribeAuth: null });
      },
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const user = await authSignIn(email, password);
          set({ user });
          return { ok: true };
        } catch (e) {
          set({ error: e?.message || 'Error al iniciar sesión' });
          return { ok: false, error: e };
        } finally {
          set({ loading: false });
        }
      },
      register: async (email, password, displayName) => {
        set({ loading: true, error: null });
        try {
          const user = await authRegister(email, password, displayName);
          set({ user });
          return { ok: true };
        } catch (e) {
          set({ error: e?.message || 'Error al registrarse' });
          return { ok: false, error: e };
        } finally {
          set({ loading: false });
        }
      },
      logout: async () => {
        try { await authSignOut(); } catch {}
        set({ user: null });
      }
    }),
    {
      name: 'smartsteps-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.();
        // Iniciar listener de Firebase al hidratar
        setTimeout(() => state?.startAuthListener?.(), 0);
      },
    }
  )
);
