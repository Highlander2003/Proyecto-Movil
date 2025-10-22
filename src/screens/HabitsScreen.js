import React, { useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Button from '../components/Button';
import ModalSheet from '../components/ModalSheet';
import { useHabitsStore } from '../store/habits';

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

export default function HabitsScreen() {
  const theme = useTheme();
  const addSuggested = useHabitsStore((s) => s.addSuggested);
  const addHabit = useHabitsStore((s) => s.addHabit);
  const searchSuggested = useHabitsStore((s) => s.searchSuggested);

  const [q, setQ] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('✅');
  const [newFrequency, setNewFrequency] = useState('Diario');
  const [newTime, setNewTime] = useState('08:00');
  const [toast, setToast] = useState('');

  const list = useMemo(() => searchSuggested(q), [q, searchSuggested]);

  const handleAddSuggested = (id, title) => {
    addSuggested(id);
    showToast(`Añadido: ${title}`);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
  };

  const saveNewHabit = () => {
    if (!newName.trim()) return;
    addHabit({ title: newName.trim(), icon: newIcon || '✅', frequency: newFrequency, time: newTime });
    setShowNew(false);
    setNewName('');
    setNewIcon('✅');
    setNewFrequency('Diario');
    setNewTime('08:00');
    showToast('Hábito creado');
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

      <ModalSheet visible={showNew} onClose={() => setShowNew(false)}>
        <Title style={{ marginBottom: 8 }}>Nuevo hábito</Title>
        <Subtitle>Define los detalles de tu microhábito</Subtitle>
        <Row style={{ marginTop: 12 }}>
          <Search style={{ flex: 0.4 }} value={newIcon} onChangeText={setNewIcon} maxLength={2} />
          <Search style={{ flex: 1 }} placeholder="Nombre" placeholderTextColor={theme.colors.textMuted} value={newName} onChangeText={setNewName} />
        </Row>
        <Row style={{ marginTop: 10 }}>
          <Search style={{ flex: 1 }} placeholder="Frecuencia (Diario/Semanal)" placeholderTextColor={theme.colors.textMuted} value={newFrequency} onChangeText={setNewFrequency} />
          <Search style={{ flex: 0.6 }} placeholder="Horario (HH:MM)" placeholderTextColor={theme.colors.textMuted} value={newTime} onChangeText={setNewTime} />
        </Row>
        <Row style={{ marginTop: 12, justifyContent: 'flex-end' }}>
          <Button title="Cancelar" variant="ghost" onPress={() => setShowNew(false)} />
          <Button title="Guardar" onPress={saveNewHabit} />
        </Row>
      </ModalSheet>

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
