// Store de ajustes de la app (Zustand + persistencia)
// - notificationsEnabled: controla si el usuario activó los recordatorios push
// - setNotifications(val): guarda el valor y, si se activa, solicita permisos y configura el canal
// Nota: en Web, las notificaciones locales pueden no estar disponibles; el método es no bloqueante.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureNotifications } from '../services/notifications';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Preferencia de notificaciones (persistida)
      notificationsEnabled: true,
      // Cambia la preferencia y, si se activa, intenta configurar permisos/canales
      setNotifications: async (val) => {
        set({ notificationsEnabled: val });
        if (val) await configureNotifications();
      },
    }),
    { name: 'smartsteps-settings', storage: createJSONStorage(() => AsyncStorage) }
  )
);
