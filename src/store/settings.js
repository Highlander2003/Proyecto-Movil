import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureNotifications } from '../services/notifications';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      notificationsEnabled: true,
      setNotifications: async (val) => {
        set({ notificationsEnabled: val });
        if (val) await configureNotifications();
      },
    }),
    { name: 'smartsteps-settings', storage: createJSONStorage(() => AsyncStorage) }
  )
);
