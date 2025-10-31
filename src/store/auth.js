// Store de autenticación (Zustand + persistencia)
// Responsabilidades:
// - Mantener el usuario autenticado (Firebase Auth o modo local de fallback)
// - Exponer acciones: login, register, logout
// - Escuchar cambios de sesión con initAuthListener (auto-login y mantener sesión)
// Persistencia:
// - Solo se guarda `user` en AsyncStorage bajo la clave 'smartsteps-auth'.
// - Al hidratar, se levanta el listener de Firebase para sincronizar el estado real.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initAuthListener, authSignIn, authRegister, authSignOut, authUpdateDisplayName } from '../services/firebase';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado del usuario actual (null si no hay sesión)
      user: null,
      // Banderas para UI
      loading: false,
      error: null,
      // Marca de hidratación del store persistido
      _hasHydrated: false,
      // Interno: setter para marcar hidratación completa
      setHydrated: () => set({ _hasHydrated: true }),
      // Permite establecer el usuario manualmente (útil en modo local o tests)
      setUser: (user) => set({ user }),
      /**
       * Inicia el listener de autenticación para reflejar cambios de sesión (login/logout)
       * provenientes de Firebase Auth. En modo local, retorna un no-op.
       */
      startAuthListener: () => {
        const unsub = initAuthListener((user) => set({ user }));
        set({ _unsubscribeAuth: unsub });
      },
      /**
       * Detiene el listener de autenticación si existe.
       */
      stopAuthListener: () => {
        const u = get()._unsubscribeAuth;
        if (u) u();
        set({ _unsubscribeAuth: null });
      },
      /**
       * Inicia sesión con email/contraseña.
       * Maneja estados de carga y error para la UI.
       */
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
      /**
       * Registra una nueva cuenta con email/contraseña y (opcional) displayName.
       */
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
      /**
       * Cierra la sesión actual.
       */
      logout: async () => {
        try { await authSignOut(); } catch {}
        set({ user: null });
      },
      /**
       * Actualiza el nombre visible del usuario (displayName) tanto en Firebase como en modo local.
       */
      updateDisplayName: async (displayName) => {
        set({ loading: true, error: null });
        try {
          const updated = await authUpdateDisplayName(displayName);
          if (updated) set({ user: updated });
          return { ok: true, user: updated };
        } catch (e) {
          set({ error: e?.message || 'No se pudo actualizar el nombre' });
          return { ok: false, error: e };
        } finally {
          set({ loading: false });
        }
      }
    }),
    {
      name: 'smartsteps-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Solo persistimos el usuario para evitar guardar banderas volátiles
      partialize: (state) => ({ user: state.user }),
      /**
       * Al rehidratar desde AsyncStorage:
       * - marca el store como hidratado
       * - levanta el listener de Firebase para mantener el estado sincronizado
       */
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.();
        // Iniciar listener de Firebase al hidratar
        setTimeout(() => state?.startAuthListener?.(), 0);
      },
    }
  )
);
