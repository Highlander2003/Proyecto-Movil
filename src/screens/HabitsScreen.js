import React, { useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
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
const IconButton = styled.TouchableOpacity`
  width: 36px; height: 36px; border-radius: 18px;
  align-items: center; justify-content: center;
  background-color: ${({ theme }) => theme.colors.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export default function HabitsScreen() {
  const theme = useTheme();
  // Acciones del store de hábitos
  const addSuggested = useHabitsStore((s) => s.addSuggested);
  const addHabit = useHabitsStore((s) => s.addHabit);
  const updateHabit = useHabitsStore((s) => s.updateHabit);
  const removeHabit = useHabitsStore((s) => s.removeHabit);
  const searchSuggested = useHabitsStore((s) => s.searchSuggested);
  const active = useHabitsStore((s) => s.active);

  // Estado de UI: query de búsqueda, modal y nuevo hábito
  const [q, setQ] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('✅');
  const [newFrequency, setNewFrequency] = useState('Diario');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newRepeats, setNewRepeats] = useState('1');
  const [startDate, setStartDate] = useState(dateToKey(new Date()));
  const [noEndDate, setNoEndDate] = useState(true);
  const [endDate, setEndDate] = useState('');
  const [scheduleType, setScheduleType] = useState('exact'); // 'exact' | 'offset'
  const [offsetMinutes, setOffsetMinutes] = useState('60');
  const [toast, setToast] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteHabit, setConfirmDeleteHabit] = useState(null); // objeto hábito a eliminar

  const freqOptions = ['Diario', 'Semanal', 'Días alternos'];
  const quickIcons = ['✅','💧','📘','🧘','🚶','🥗','😴','📝','🎨','🏃','🧠','🎯','🧹','🧴','🦷','📖','☀️','🌙'];

  const isTimeValid = useMemo(() => scheduleType === 'exact' ? validateTime12h(newTime) : true, [newTime, scheduleType]);
  const isNameValid = newName.trim().length > 0;
  const repeatsNum = Math.max(1, Math.min(20, parseInt(newRepeats || '1', 10) || 1));
  const isStartValid = useMemo(() => validateDate(startDate), [startDate]);
  const isEndValid = useMemo(() => noEndDate || !endDate ? true : validateDate(endDate), [noEndDate, endDate]);
  const isEndAfterStart = useMemo(() => {
    if (noEndDate || !endDate) return true;
    return compareDates(endDate, startDate) >= 0;
  }, [noEndDate, endDate, startDate]);

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
    if (!isNameValid || !isTimeValid || !isStartValid || !isEndValid || !isEndAfterStart) return;
    const timeNormalized = scheduleType === 'exact' ? normalizeTime12h(newTime) : undefined;
    const payload = {
      title: newName.trim(),
      icon: newIcon || '✅',
      frequency: newFrequency,
      dailyRepeats: repeatsNum,
      startDate,
      endDate: noEndDate ? null : endDate,
      scheduleType,
      exactTime: timeNormalized,
      offsetMinutes: scheduleType === 'offset' ? Math.max(1, Math.min(24*60, parseInt(offsetMinutes || '60', 10) || 60)) : undefined,
    };
    if (editingId) {
      updateHabit(editingId, payload);
      showToast(`Hábito actualizado: ${newName.trim()}`);
    } else {
      addHabit(payload);
      showToast(`Hábito creado: ${newName.trim()}`);
    }
    setShowNew(false);
    setEditingId(null);
    setNewName('');
    setNewIcon('✅');
    setNewFrequency('Diario');
    setNewTime('08:00 AM');
    setNewRepeats('1');
    setStartDate(dateToKey(new Date()));
    setNoEndDate(true);
    setEndDate('');
    setScheduleType('exact');
    setOffsetMinutes('60');
  };

  const openEdit = (h) => {
    setEditingId(h.id);
    setNewName(h.title || '');
    setNewIcon(h.icon || '✅');
    setNewFrequency(h.frequency || 'Diario');
    setScheduleType(h.scheduleType || 'exact');
    if ((h.scheduleType || 'exact') === 'exact') {
      setNewTime(h.exactTime || '08:00 AM');
    } else {
      setOffsetMinutes(String(h.offsetMinutes || 60));
    }
    setNewRepeats(String(h.dailyRepeats || 1));
    setStartDate(h.startDate || dateToKey(new Date()));
    if (typeof h.endDate === 'string' && h.endDate) {
      setNoEndDate(false);
      setEndDate(h.endDate);
    } else {
      setNoEndDate(true);
      setEndDate('');
    }
    setShowNew(true);
  };

  const confirmDelete = (h) => {
    // En web, algunos entornos no soportan múltiples botones en Alert; usamos modal propio
    if (Platform.OS === 'web') {
      setConfirmDeleteHabit(h);
      return;
    }
    Alert.alert(
      'Eliminar hábito',
      `¿Seguro que quieres eliminar "${h.title}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => { removeHabit(h.id); showToast('Hábito eliminado'); } },
      ]
    );
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

          {/* Mis hábitos activos (CRUD: editar/eliminar) */}
          {active && active.length > 0 ? (
            <>
              <Title style={{ marginTop: 16 }}>Mis hábitos</Title>
              <Subtitle>Administra tus hábitos activos</Subtitle>
              {active.map((h) => (
                <Card key={h.id} style={{ marginTop: 6 }}>
                  <HabitRow>
                    <Left>
                      <IconWrap><Text style={{ fontSize: 18 }}>{h.icon}</Text></IconWrap>
                      <Texts>
                        <HTitle>{h.title}</HTitle>
                        <HDesc>{renderHabitSubtitle(h)}</HDesc>
                      </Texts>
                    </Left>
                    <Row>
                      <IconButton onPress={() => openEdit(h)} accessibilityLabel={`Editar ${h.title}`}>
                        <Ionicons name="create" size={18} color={theme.colors.text} />
                      </IconButton>
                      <IconButton onPress={() => confirmDelete(h)} style={{ marginLeft: 8 }} accessibilityLabel={`Eliminar ${h.title}`}>
                        <Ionicons name="trash" size={18} color={theme.colors.danger} />
                      </IconButton>
                    </Row>
                  </HabitRow>
                </Card>
              ))}
            </>
          ) : null}
        </Content>
      </Screen>

      {/* Modal para crear un nuevo microhábito */}
      <ModalSheet visible={showNew} onClose={() => { setShowNew(false); setEditingId(null); }}>
        <Title style={{ marginBottom: 8 }}>{editingId ? 'Editar hábito' : 'Nuevo hábito'}</Title>
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

        <FieldLabel style={{ marginTop: 10 }}>Programación</FieldLabel>
        <Chips>
          {['Hora exacta','Min después 1ª vez'].map(opt => (
            <Chip key={opt} active={(scheduleType === 'exact' && opt==='Hora exacta') || (scheduleType === 'offset' && opt!=='Hora exacta')} onPress={() => setScheduleType(opt==='Hora exacta' ? 'exact' : 'offset')}>
              <ChipText active={(scheduleType === 'exact' && opt==='Hora exacta') || (scheduleType === 'offset' && opt!=='Hora exacta')}>{opt}</ChipText>
            </Chip>
          ))}
        </Chips>
        {scheduleType === 'exact' ? (
          <>
            <FieldLabel style={{ marginTop: 8 }}>Horario (12h)</FieldLabel>
            <Search style={{ flex: 1 }} placeholder="hh:mm AM/PM" placeholderTextColor={theme.colors.textMuted} value={newTime} onChangeText={setNewTime} />
            {!isTimeValid ? <ErrorTxt>Formato inválido. Usa hh:mm AM/PM (ej. 8:30 PM).</ErrorTxt> : null}
          </>
        ) : (
          <>
            <FieldLabel style={{ marginTop: 8 }}>Minutos después de la 1ª repetición</FieldLabel>
            <Row>
              <Search
                style={{ flex: 0.5 }}
                placeholder="60"
                placeholderTextColor={theme.colors.textMuted}
                value={offsetMinutes}
                onChangeText={setOffsetMinutes}
                keyboardType="number-pad"
                maxLength={4}
              />
              <Subtitle style={{ marginLeft: 8 }}>Ej: 90 = 1h 30m después de completar la 1ª repetición.</Subtitle>
            </Row>
          </>
        )}

        <FieldLabel style={{ marginTop: 10 }}>Veces por día</FieldLabel>
        <Row>
          <Search
            style={{ flex: 0.5 }}
            placeholder="1"
            placeholderTextColor={theme.colors.textMuted}
            value={newRepeats}
            onChangeText={setNewRepeats}
            keyboardType="number-pad"
            maxLength={2}
          />
          <Subtitle style={{ marginLeft: 8 }}>
            La barra se divide en {repeatsNum} parte{repeatsNum > 1 ? 's' : ''} diarias.
          </Subtitle>
        </Row>

        <FieldLabel style={{ marginTop: 10 }}>Inicio y fin</FieldLabel>
        <Row>
          <Search style={{ flex: 1 }} placeholder="YYYY-MM-DD" placeholderTextColor={theme.colors.textMuted} value={startDate} onChangeText={setStartDate} />
        </Row>
        {!isStartValid ? <ErrorTxt>Fecha de inicio inválida (usa YYYY-MM-DD).</ErrorTxt> : null}
        <Row style={{ marginTop: 8, alignItems: 'center' }}>
          <Chip active={noEndDate} onPress={() => setNoEndDate(!noEndDate)}>
            <ChipText active={noEndDate}>{noEndDate ? 'Sin fecha de fin' : 'Con fecha de fin'}</ChipText>
          </Chip>
          {!noEndDate && (
            <Search style={{ flex: 1 }} placeholder="YYYY-MM-DD" placeholderTextColor={theme.colors.textMuted} value={endDate} onChangeText={setEndDate} />
          )}
        </Row>
        {!isEndValid ? <ErrorTxt>Fecha de fin inválida (usa YYYY-MM-DD).</ErrorTxt> : null}
        {!isEndAfterStart ? <ErrorTxt>La fecha de fin debe ser igual o posterior al inicio.</ErrorTxt> : null}

        <Row style={{ marginTop: 12, justifyContent: 'flex-end' }}>
          <Button title="Cancelar" variant="ghost" onPress={() => { setShowNew(false); setEditingId(null); }} />
          <Button title="Guardar" onPress={saveNewHabit} style={{ opacity: (isNameValid && isTimeValid && isStartValid && isEndValid && isEndAfterStart) ? 1 : 0.6 }} />
        </Row>
      </ModalSheet>

      {/* Confirmación de eliminación (compatible web) */}
      <ModalSheet visible={!!confirmDeleteHabit} onClose={() => setConfirmDeleteHabit(null)}>
        <Title style={{ marginBottom: 8 }}>Eliminar hábito</Title>
        <Subtitle>¿Seguro que quieres eliminar "{confirmDeleteHabit?.title}"? Esta acción no se puede deshacer.</Subtitle>
        <Row style={{ marginTop: 12, justifyContent: 'flex-end' }}>
          <Button title="Cancelar" variant="ghost" onPress={() => setConfirmDeleteHabit(null)} />
          <Button
            title="Eliminar"
            variant="danger"
            onPress={() => {
              if (confirmDeleteHabit) {
                removeHabit(confirmDeleteHabit.id);
                showToast('Hábito eliminado');
              }
              setConfirmDeleteHabit(null);
            }}
            style={{ marginLeft: 8 }}
          />
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

function renderHabitSubtitle(h) {
  const freq = h.frequency || 'Diario';
  const rep = Math.max(1, parseInt(h.dailyRepeats || 1, 10));
  const sched = h.scheduleType === 'offset'
    ? `+${h.offsetMinutes || 60} min tras 1ª`
    : `A las ${h.exactTime || '08:00 AM'}`;
  return `${freq} • ${rep}x/día • ${sched}`;
}

// Helpers de fecha
function dateToKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function validateDate(str) {
  if (typeof str !== 'string') return false;
  const m = str.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!m) return false;
  const [y, mo, d] = str.split('-').map((v) => parseInt(v, 10));
  if (mo < 1 || mo > 12) return false;
  if (d < 1 || d > 31) return false;
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
}

function compareDates(a, b) {
  // a, b formato 'YYYY-MM-DD'
  if (!validateDate(a) || !validateDate(b)) return 0;
  if (a === b) return 0;
  return a > b ? 1 : -1;
}
