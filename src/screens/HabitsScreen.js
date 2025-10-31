import React, { useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Button from '../components/Button';
import ModalSheet from '../components/ModalSheet';
import { useHabitsStore } from '../store/habits';

// Pantalla de Hábitos sugeridos
// - Permite buscar en la lista de hábitos sugeridos (store)
// - Botón "Nuevo" abre un modal para crear un microhábito personalizado
// - Al añadir, muestra un pequeño toast de confirmación
// - Usa Zustand: addSuggested, addHabit, searchSuggested
// - Estilos y colores provienen del tema (theme.colors.*)
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
`;
const Row = styled.View`
  flex-direction: row;
  gap: 10px;
  align-items: center;
`;
const Search = styled.TextInput`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius}px;
  padding: 12px 14px;
`;
const HabitRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const Left = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;
const IconWrap = styled.View`
  width: 40px; height: 40px; border-radius: 20px; align-items: center; justify-content: center;
  background-color: ${({ theme }) => theme.colors.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;
const HTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;
const HDesc = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;
const Texts = styled.View``;

const ToastWrap = styled.View`
  position: absolute; left: 0; right:0; top: 8px; align-items: center;
`;
const ToastBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 24px; padding: 8px 12px;
`;
const ToastText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
`;

// Nuevos estilos para chips, etiquetas y grilla de iconos
const FieldLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 8px;
  margin-bottom: 6px;
`;
const Chips = styled.View`
  flex-direction: row; flex-wrap: wrap; gap: 8px;
`;
const Chip = styled.TouchableOpacity`
  padding: 8px 12px; border-radius: 999px; border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ active, theme }) => active ? theme.colors.accent : theme.colors.surfaceAlt};
`;
const ChipText = styled.Text`
  color: ${({ active }) => active ? '#00110d' : '#cbd5e1'}; font-weight: 700;
`;
const IconGrid = styled.View`
  flex-direction: row; flex-wrap: wrap; gap: 8px;
`;
const IconBtn = styled.TouchableOpacity`
  width: 40px; height: 40px; border-radius: 20px; align-items: center; justify-content: center;
  background-color: ${({ theme, active }) => active ? theme.colors.accent : theme.colors.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;
const IconTxt = styled.Text`
  color: ${({ active }) => active ? '#00110d' : '#e6e8eb'}; font-size: 18px;
`;
const ErrorTxt = styled.Text`
  color: ${({ theme }) => theme.colors.danger}; font-size: 12px; margin-top: 4px;
`;

export default function HabitsScreen() {
  const theme = useTheme();
  // Acciones del store de hábitos
  const addSuggested = useHabitsStore((s) => s.addSuggested);
  const addHabit = useHabitsStore((s) => s.addHabit);
  const searchSuggested = useHabitsStore((s) => s.searchSuggested);

  // Estado de UI: query de búsqueda, modal y nuevo hábito
  const [q, setQ] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('✅');
  const [newFrequency, setNewFrequency] = useState('Diario');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [toast, setToast] = useState('');

  const freqOptions = ['Diario', 'Semanal', 'Días alternos'];
  const quickIcons = ['✅','💧','📘','🧘','🚶','🥗','😴','📝','🎨','🏃','🧠','🎯','🧹','🧴','🦷','📖','☀️','🌙'];

  const isTimeValid = useMemo(() => validateTime12h(newTime), [newTime]);
  const isNameValid = newName.trim().length > 0;

  // Lista filtrada según la búsqueda
  const list = useMemo(() => searchSuggested(q), [q, searchSuggested]);

  // Añade hábito sugerido por id y muestra confirmación
  const handleAddSuggested = (id, title) => {
    addSuggested(id);
    showToast(`Añadido: ${title}`);
  };

  // Utilidad para mostrar un toast temporal
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
  };

  // Crea un nuevo hábito personalizado a partir del modal
  const saveNewHabit = () => {
    if (!isNameValid || !isTimeValid) return;
    const timeNormalized = normalizeTime12h(newTime);
    addHabit({ title: newName.trim(), icon: newIcon || '✅', frequency: newFrequency, time: timeNormalized });
    setShowNew(false);
    setNewName('');
    setNewIcon('✅');
    setNewFrequency('Diario');
    setNewTime('08:00 AM');
    showToast(`Hábito creado: ${newName.trim()}`);
  };

  return (
    <>
      <Screen contentContainerStyle={{ paddingBottom: 40 }}>
        <Content>
          <Title>Hábitos sugeridos</Title>
          <Subtitle>Elige los microhábitos que quieres desarrollar</Subtitle>

          <Row>
            <Search
              placeholder="Buscar hábitos..."
              placeholderTextColor={theme.colors.textMuted}
              value={q}
              onChangeText={setQ}
            />
            <Button
              title="Nuevo"
              variant="ghost"
              onPress={() => setShowNew(true)}
              left={<Ionicons name="add" size={18} color={theme.colors.text} />}
            />
          </Row>

          {/* Lista de sugeridos con botón para añadir al plan */}
          {list.map((h) => (
            <Card key={h.id} style={{ marginTop: 6 }}>
              <HabitRow>
                <Left>
                  <IconWrap><Text style={{ fontSize: 18 }}>{h.icon}</Text></IconWrap>
                  <Texts>
                    <HTitle>{h.title}</HTitle>
                    <HDesc>{h.desc}</HDesc>
                  </Texts>
                </Left>
                <Button
                  title="Añadir"
                  onPress={() => handleAddSuggested(h.id, h.title)}
                  left={<Ionicons name="add" size={16} color={'#00110d'} />}
                />
              </HabitRow>
            </Card>
          ))}
        </Content>
      </Screen>

      {/* Modal para crear un nuevo microhábito */}
      <ModalSheet visible={showNew} onClose={() => setShowNew(false)}>
        <Title style={{ marginBottom: 8 }}>Nuevo hábito</Title>
        <Subtitle>Define los detalles de tu microhábito</Subtitle>

        <FieldLabel>Nombre e icono</FieldLabel>
        <Row>
          <Search style={{ flex: 0.4 }} value={newIcon} onChangeText={setNewIcon} maxLength={2} />
          <Search style={{ flex: 1 }} placeholder="Nombre" placeholderTextColor={theme.colors.textMuted} value={newName} onChangeText={setNewName} />
        </Row>

        <FieldLabel>Iconos rápidos</FieldLabel>
        <IconGrid>
          {quickIcons.map(ic => (
            <IconBtn key={ic} active={newIcon === ic} onPress={() => setNewIcon(ic)}>
              <IconTxt active={newIcon === ic}>{ic}</IconTxt>
            </IconBtn>
          ))}
        </IconGrid>

        <FieldLabel style={{ marginTop: 10 }}>Frecuencia</FieldLabel>
        <Chips>
          {freqOptions.map(opt => (
            <Chip key={opt} active={newFrequency === opt} onPress={() => setNewFrequency(opt)}>
              <ChipText active={newFrequency === opt}>{opt}</ChipText>
            </Chip>
          ))}
        </Chips>

  <FieldLabel style={{ marginTop: 10 }}>Horario (12h)</FieldLabel>
  <Search style={{ flex: 1 }} placeholder="hh:mm AM/PM" placeholderTextColor={theme.colors.textMuted} value={newTime} onChangeText={setNewTime} />
  {!isTimeValid ? <ErrorTxt>Formato inválido. Usa hh:mm AM/PM (ej. 8:30 PM).</ErrorTxt> : null}

        <Row style={{ marginTop: 12, justifyContent: 'flex-end' }}>
          <Button title="Cancelar" variant="ghost" onPress={() => setShowNew(false)} />
          <Button title="Guardar" onPress={saveNewHabit} style={{ opacity: isNameValid && isTimeValid ? 1 : 0.6 }} />
        </Row>
      </ModalSheet>

      {/* Toast temporal de confirmación */}
      {toast ? (
        <ToastWrap pointerEvents="none">
          <ToastBadge>
            <ToastText>{toast}</ToastText>
          </ToastBadge>
        </ToastWrap>
      ) : null}
    </>
  );
}

const Text = styled.Text`
  color: ${({ theme }) => theme.colors.text};
`;

// Validación simple de hora en formato HH:MM 24h
function validateTime12h(str) {
  if (typeof str !== 'string') return false;
  const m = str.trim().match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*([AaPp][Mm])$/);
  return !!m;
}

function normalizeTime12h(str) {
  if (!validateTime12h(str)) return '08:00 AM';
  const m = str.trim().match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*([AaPp][Mm])$/);
  const hour = m[1].padStart(2, '0');
  const minute = m[2];
  const meridian = m[3].toUpperCase();
  return `${hour}:${minute} ${meridian}`;
}
