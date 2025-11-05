import React, { useEffect, useMemo, useState } from 'react';
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
import { useProfileStore } from '../store/profile';
import { Ionicons } from '@expo/vector-icons';
import { Switch as RNSwitch } from 'react-native';
import ModalSheet from '../components/ModalSheet';

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
const FieldLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 6px;
`;
const TextInput = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 12px;
  border-radius: ${({ theme }) => theme.radius}px;
`;
const RowBetween = styled.View`
  flex-direction: row; align-items: center; justify-content: space-between; gap: 8px;
`;
const Pill = styled.TouchableOpacity`
  padding: 8px 12px; border-radius: 999px; border: 1px solid ${({ theme }) => theme.colors.border}; background-color: ${({ active, theme }) => active ? theme.colors.accent : theme.colors.surfaceAlt};
`;
const PillText = styled.Text`
  color: ${({ active }) => active ? '#00110d' : '#cbd5e1'}; font-weight: 700;
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
  const { toggleTheme, themeName, adaptiveTheme, setAdaptiveTheme, adaptiveText, setAdaptiveText } = useAppTheme();
  // Acciones/estado de autenticación
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const updateDisplayName = useAuthStore((s) => s.updateDisplayName);
  // Preferencias de notificaciones desde el store de settings
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotifications = useSettingsStore((s) => s.setNotifications);
  // Datos de perfil
  const preferredName = useProfileStore((s) => s.preferredName);
  const age = useProfileStore((s) => s.age);
  const gender = useProfileStore((s) => s.gender);
  const bio = useProfileStore((s) => s.bio);
  const location = useProfileStore((s) => s.location);
  const setProfile = useProfileStore((s) => s.setProfile);
  const loadRemoteProfile = useProfileStore((s) => s.loadRemoteProfile);
  const saveRemoteProfile = useProfileStore((s) => s.saveRemoteProfile);
  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  // Derivar nombre mostrable y fecha de alta
  const name = preferredName || user?.displayName || user?.email?.split('@')[0] || 'Usuario';
  const memberSince = useMemo(() => formatMemberSince(user), [user]);

  // Hidratar datos personales desde backend/local cuando hay usuario
  useEffect(() => {
    if (!user?.uid) return;
    loadRemoteProfile(user.uid);
  }, [user?.uid, loadRemoteProfile]);

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
          {/* Tema adaptativo: sigue el sistema/hora */}
          <ListItem
            icon={<Ionicons name="color-palette" color="#4ade80" size={18} />}
            title="Tema adaptativo"
            subtitle="Sistema / hora del día"
            right={
              <ThemeSwitch
                value={!!adaptiveTheme}
                onValueChange={setAdaptiveTheme}
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
          <Divider />
          {/* Texto adaptativo: escala según accesibilidad */}
          <ListItem
            icon={<Ionicons name="text" color="#a5b4fc" size={18} />}
            title="Texto adaptativo"
            subtitle="Escala según accesibilidad"
            right={
              <ThemeSwitch
                value={!!adaptiveText}
                onValueChange={setAdaptiveText}
              />
            }
          />
        </Card>

        <SectionHeader>Datos personales</SectionHeader>
        <Card>
          <ListItem
            icon={<Ionicons name="person" color="#93c5fd" size={18} />}
            title="Editar datos"
            subtitle="Nombre, edad y más"
            right={<Ionicons name="chevron-forward" color="#9aa4b2" size={18} />}
          />
          <Button title="Abrir editor" variant="ghost" onPress={() => setOpenEdit(true)} style={{ marginTop: 8 }} />
          <Divider />
          <ListItem
            icon={<Ionicons name="id-card" color="#86efac" size={18} />}
            title={`Nombre: ${name}`}
            subtitle={bio ? bio : 'Sin biografía'}
            right={null}
          />
          <Divider />
          <ListItem
            icon={<Ionicons name="calendar" color="#fcd34d" size={18} />}
            title={`Edad: ${age ?? '—'}`}
            subtitle={`Género: ${gender || '—'}`}
            right={null}
          />
          <Divider />
          <ListItem
            icon={<Ionicons name="location" color="#fca5a5" size={18} />}
            title={`Ubicación: ${location || '—'}`}
            right={null}
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
        {/* Editor modal */}
        <ProfileEditor
          visible={openEdit}
          onClose={() => setOpenEdit(false)}
          saving={saving}
          initial={{
            name: preferredName || user?.displayName || '',
            age,
            gender,
            bio,
            location,
          }}
          onSave={async ({ name, age, gender, bio, location }) => {
            setSaving(true);
            try {
              // Actualiza displayName (Auth) y datos locales (profile)
              if (name) await updateDisplayName(name);
              setProfile({ preferredName: name || '', age, gender, bio, location });
              if (user?.uid) {
                await saveRemoteProfile(user.uid, { preferredName: name || '', age, gender, bio, location });
              }
              setOpenEdit(false);
            } finally {
              setSaving(false);
            }
          }}
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

// Editor de datos personales en un bottom sheet
function ProfileEditor({ visible, onClose, initial, onSave, saving }) {
  const [fullName, setFullName] = useState(initial.name || '');
  const [age, setAge] = useState(initial.age ? String(initial.age) : '');
  const [gender, setGender] = useState(initial.gender || '');
  const [bio, setBio] = useState(initial.bio || '');
  const [location, setLocation] = useState(initial.location || '');

  const save = () => {
    const nAge = age ? Math.max(0, Math.min(120, parseInt(age, 10) || 0)) : null;
    onSave({ name: fullName.trim(), age: nAge, gender, bio: bio.trim(), location: location.trim() });
  };

  return (
    <ModalSheet visible={visible} onClose={onClose}>
      <FieldLabel>Nombre</FieldLabel>
      <TextInput placeholder="Tu nombre" value={fullName} onChangeText={setFullName} placeholderTextColor="#94a3b8" />
      <FieldLabel style={{ marginTop: 12 }}>Edad</FieldLabel>
      <TextInput placeholder="Ej: 25" keyboardType="number-pad" value={age} onChangeText={setAge} placeholderTextColor="#94a3b8" />
      <FieldLabel style={{ marginTop: 12 }}>Género</FieldLabel>
      <RowBetween>
        {['masculino', 'femenino', 'otro'].map((g) => (
          <Pill key={g} active={gender === g} onPress={() => setGender(g)}>
            <PillText active={gender === g}>{g.charAt(0).toUpperCase() + g.slice(1)}</PillText>
          </Pill>
        ))}
      </RowBetween>
      <FieldLabel style={{ marginTop: 12 }}>Biografía</FieldLabel>
      <TextInput placeholder="Cuéntanos algo de ti" value={bio} onChangeText={setBio} placeholderTextColor="#94a3b8" multiline style={{ height: 80, textAlignVertical: 'top' }} />
      <FieldLabel style={{ marginTop: 12 }}>Ubicación</FieldLabel>
      <TextInput placeholder="Ciudad, País" value={location} onChangeText={setLocation} placeholderTextColor="#94a3b8" />
      <Button title={saving ? 'Guardando...' : 'Guardar'} onPress={save} style={{ marginTop: 16 }} />
    </ModalSheet>
  );
}
