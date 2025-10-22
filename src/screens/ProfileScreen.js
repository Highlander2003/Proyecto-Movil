import React, { useMemo } from 'react';
import styled from 'styled-components/native';
import Card from '../components/Card';
import Button from '../components/Button';
import ListItem from '../components/ListItem';
import Avatar from '../components/Avatar';
import SectionHeader from '../components/SectionHeader';
import StatsBar from '../components/StatsBar';
import { useAppTheme } from '../theme/ThemeProvider';
import { useAuthStore } from '../store/auth';
import { useSettingsStore } from '../store/settings';
import { Ionicons } from '@expo/vector-icons';
import { Switch as RNSwitch } from 'react-native';

// Pantalla de Perfil
// - Muestra avatar/nombre del usuario, fecha "Miembro desde"
// - Configuraciones: Modo oscuro y Notificaciones (switches funcionales)
// - Sección general con items informativos (privacidad, acerca de)
// - Barra de estadísticas (StatsBar) con métricas destacadas
// - Acción para Cerrar sesión
const Screen = styled.ScrollView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;
const Content = styled.View`
  padding: 16px;
  gap: 12px;
`;
const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  font-size: 24px;
`;
const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 8px;
`;
const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;
const Name = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  font-size: 18px;
`;
const Meta = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
`;
const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;

function formatMemberSince(user) {
  // Firebase: user?.metadata?.creationTime; Local: guardar luego; fallback: ahora
  let date = null;
  const ct = user?.metadata?.creationTime;
  if (ct) {
    const d = new Date(ct);
    if (!isNaN(d.getTime())) date = d;
  }
  if (!date) date = new Date();
  const locale = 'es-ES';
  const month = date.toLocaleString(locale, { month: 'short' });
  const year = date.getFullYear();
  const capMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${capMonth} ${year}`;
}

export default function ProfileScreen() {
  // Toggle de tema (ThemeProvider) y nombre del tema actual
  const { toggleTheme, themeName } = useAppTheme();
  // Acciones/estado de autenticación
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  // Preferencias de notificaciones desde el store de settings
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotifications = useSettingsStore((s) => s.setNotifications);

  // Derivar nombre mostrable y fecha de alta
  const name = user?.displayName || user?.email?.split('@')[0] || 'Usuario';
  const memberSince = useMemo(() => formatMemberSince(user), [user]);

  return (
    <Screen contentContainerStyle={{ paddingBottom: 40 }}>
      <Content>
        <Title>Perfil</Title>
        <Subtitle>Personaliza tu experiencia</Subtitle>

        {/* Cabecera de perfil con avatar y nombre */}
        <Card>
          <Row>
            <Avatar name={name} />
            <Row style={{ flex: 1, justifyContent: 'space-between' }}>
              <Row style={{ flex: 1 }}>
                <Name>{name.charAt(0).toUpperCase() + name.slice(1)}</Name>
              </Row>
            </Row>
          </Row>
          <Meta style={{ marginTop: 6 }}>Miembro desde {memberSince}</Meta>
        </Card>

        <SectionHeader>Configuración</SectionHeader>
        <Card>
          {/* Modo oscuro: alterna themeName con toggleTheme */}
          <ListItem
            icon={<Ionicons name="moon" color="#7dd3fc" size={18} />}
            title="Modo oscuro"
            subtitle="Apariencia del tema"
            right={
              <ThemeSwitch
                value={themeName === 'dark'}
                onValueChange={() => toggleTheme()}
              />
            }
          />
          <Divider />
          {/* Notificaciones push: preferencia global del usuario */}
          <ListItem
            icon={<Ionicons name="notifications" color="#86efac" size={18} />}
            title="Notificaciones"
            subtitle="Recordatorios push"
            right={
              <ThemeSwitch
                value={notificationsEnabled}
                onValueChange={setNotifications}
              />
            }
          />
        </Card>

        <SectionHeader>General</SectionHeader>
        <Card>
          {/* Ítems informativos: navegación futura a pantallas de detalle */}
          <ListItem
            icon={<Ionicons name="shield-checkmark" color="#a5b4fc" size={18} />}
            title="Privacidad"
            subtitle="Gestiona tus datos"
            right={<Ionicons name="chevron-forward" color="#9aa4b2" size={18} />}
          />
          <Divider />
          <ListItem
            icon={<Ionicons name="information-circle" color="#fca5a5" size={18} />}
            title="Acerca de"
            subtitle="Versión 1.0.0"
            right={<Ionicons name="chevron-forward" color="#9aa4b2" size={18} />}
          />
        </Card>

        {/* Resumen de estadísticas clave del perfil */}
        <StatsBar completed={24} streak={5} success={86} />

        {/* Cierre de sesión */}
        <Button
          variant="danger"
          title="Cerrar sesión"
          onPress={logout}
          left={<Ionicons name="log-out" size={18} color="#00110d" />}
          style={{ marginTop: 12 }}
        />
      </Content>
    </Screen>
  );
}

// Switch con colores temáticos
function ThemeSwitch({ value, onValueChange }) {
  // Nota: trackColor y thumbColor se alinean con la paleta del tema oscuro
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#3a3f4b', true: '#0e6e64' }}
      thumbColor={value ? '#22e6c5' : '#cbd5e1'}
    />
  );
}
