import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import HabitsScreen from '../screens/HabitsScreen';
import RemindersScreen from '../screens/RemindersScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      // Configuración global de la barra de pestañas inferior
      screenOptions={({ route }) => ({
        headerShown: false,
        // Estilo visual de la tab bar (colores desde el tema)
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 78,
          paddingTop: 6,
          paddingBottom: 10,
        },
        // Ensancha el área de toque por item
        tabBarItemStyle: {
          minWidth: 72,
        },
        // Label debajo del ícono para mejor legibilidad
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },
        // Colores activos/inactivos (tema)
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        // Mapeo de rutas a íconos de Ionicons
        tabBarIcon: ({ color, size, focused }) => {
          let name = 'home';
          if (route.name === 'Inicio') name = 'home';
          if (route.name === 'Hábitos') name = 'checkmark-done';
          if (route.name === 'Recordatorios') name = 'alarm';
          if (route.name === 'Progreso') name = 'stats-chart';
          if (route.name === 'Perfil') name = 'person';
          return <Ionicons name={name} color={color} size={focused ? 24 : 22} style={{ marginBottom: 2 }} />;
        },
      })}
    >
      {/* Pestañas principales de la app */}
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Hábitos" component={HabitsScreen} />
      <Tab.Screen name="Recordatorios" component={RemindersScreen} />
      <Tab.Screen name="Progreso" component={ProgressScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
