// Punto de entrada de la app SmartSteps (Expo + React Native, JavaScript puro)
// Aquí montamos:
// - Proveedor de gestos (GestureHandlerRootView) para que funcionen los gestos nativos
// - Proveedor de tema (AppThemeProvider) con modo oscuro/claro
// - Proveedor de áreas seguras (SafeAreaProvider) para respetar notch/bordes
// - Contenedor de navegación (NavigationContainer) con tema dinámico
// - Configuración global de notificaciones locales

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import AppThemeProvider, { useAppTheme } from './src/theme/ThemeProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { configureNotifications } from './src/services/notifications';
import TutorialProvider from './src/components/TutorialProvider';

// Oculta avisos ruidosos no críticos en desarrollo
LogBox.ignoreLogs(['AsyncStorage has been extracted']);

// Componente separado para que NavigationContainer reaccione a cambios de tema
function Navigation() {
  const { themeName } = useAppTheme(); // viene de ThemeProvider (zustand + styled-components)
  const isDark = themeName === 'dark';
  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      {/* RootNavigator decide si mostrar AuthStack o AppTabs según el usuario en sesión */}
      <RootNavigator />
    </NavigationContainer>
  );
}

function ThemedStatusBar() {
  const { themeName } = useAppTheme();
  const isDark = themeName === 'dark';
  return <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />;
}

export default function App() {
  // Configura el canal/permisos de notificaciones al iniciar la app (Android/iOS). En web puede no aplicar.
  useEffect(() => {
    configureNotifications();
  }, []);

  return (
    // Necesario para que funcionen correctamente los gestos (navegación, deslizamientos, etc.)
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Proveedor de tema con tokens de color y persistencia del modo (oscuro/claro) */}
      <AppThemeProvider>
        {/* Maneja padding automático para barra de estado/notch en iOS/Android */}
        <SafeAreaProvider>
          {/* Tutorial provider para guías interactivas */}
          <TutorialProvider>
            {/* Barra de estado adaptativa al tema */}
            <ThemedStatusBar />
            {/* Árbol de navegación de la app */}
            <Navigation />
          </TutorialProvider>
        </SafeAreaProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}
