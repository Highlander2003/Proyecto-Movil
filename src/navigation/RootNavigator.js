import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';
import { useAuthStore } from '../store/auth';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s._hasHydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Espera la hidratación de persistencia de Zustand para evitar parpadeos
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, [hydrate]);

  // Hasta que el store esté listo, no renderizar la navegación
  if (!ready) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Si hay usuario autenticado, mostrar tabs de la app; si no, flujo de auth */}
      {user ? (
        <Stack.Screen name="AppTabs" component={AppTabs} />
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
