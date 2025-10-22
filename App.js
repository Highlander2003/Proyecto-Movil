import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import AppThemeProvider, { useAppTheme } from './src/theme/ThemeProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { configureNotifications } from './src/services/notifications';

LogBox.ignoreLogs(['AsyncStorage has been extracted']);

function Navigation() {
  const { themeName } = useAppTheme();
  const isDark = themeName === 'dark';
  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    configureNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" />
          <Navigation />
        </SafeAreaProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}
