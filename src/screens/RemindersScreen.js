import React, { useMemo, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import Card from '../components/Card';
import Button from '../components/Button';
import ListItem from '../components/ListItem';
import ProgressBar from '../components/ProgressBar';
import ModalSheet from '../components/ModalSheet';
import { useHabitsStore } from '../store/habits';
import { useSettingsStore } from '../store/settings';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Estilos base
const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;
const Container = styled.ScrollView`
  flex: 1;
  padding: 16px;
`;
const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  font-size: 22px;
`;
const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
`;
const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;
const Wrap = styled.View`
  gap: 10px;
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
const Search = styled.TextInput`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius}px;
  padding: 12px 14px;
`;
const Divider = styled.View`
  height: 1px; background-color: ${({ theme }) => theme.colors.border};
`;
const Pill = styled.View`
  padding: 4px 8px; border-radius: 999px; background-color: ${({ theme }) => theme.colors.surfaceAlt}; border: 1px solid ${({ theme }) => theme.colors.border};
`;
const PillText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px;
`;
const Timeline = styled.View`
  margin-left: 10px; borderLeftWidth: 2px; border-left-color: ${({ theme }) => theme.colors.border}; padding-left: 12px;
`;
const NowDot = styled.View`
  width: 8px; height: 8px; border-radius: 4px; background-color: ${({ theme }) => theme.colors.accent}; position: absolute; left: -5px; top: -4px;
`;

// Helpers de hora 12h
function parseExactToMinutes(exact) {
  if (!exact || typeof exact !== 'string') return null;
  const m = exact.trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (!m) return null;
  let hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (hh === 12) hh = 0;
  if (ampm === 'PM') hh += 12;
  return hh * 60 + mm;
}
function minutesToExact(mins) {
  let total = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  let hh24 = Math.floor(total / 60);
  const mm = total % 60;
  const ampm = hh24 >= 12 ? 'PM' : 'AM';
  let hh = hh24 % 12;
  if (hh === 0) hh = 12;
  const mmStr = String(mm).padStart(2, '0');
  return `${hh}:${mmStr} ${ampm}`;
}
function validateTime12h(str) {
  if (typeof str !== 'string') return false;
  return /^(0?[1-9]|1[0-2]):([0-5]\d)\s*([AaPp][Mm])$/.test(str.trim());
}
function normalizeTime12h(str) {
  if (!validateTime12h(str)) return '08:00 AM';
  const m = str.trim().match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*([AaPp][Mm])$/);
  const hour = m[1].padStart(2, '0');
  const minute = m[2];
  const meridian = m[3].toUpperCase();
  return `${hour}:${minute} ${meridian}`;
}

export default function RemindersScreen() {
  const theme = useTheme();
  const nav = useNavigation();

  // Store hábitos
  const active = useHabitsStore((s) => s.active);
  const getTodayCount = useHabitsStore((s) => s.getTodayCount);
  const incrementCompleteToday = useHabitsStore((s) => s.incrementCompleteToday);
  const updateHabit = useHabitsStore((s) => s.updateHabit);

  // Store ajustes
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotifications = useSettingsStore((s) => s.setNotifications);

  // Filtros
  const [tab, setTab] = useState('Hoy'); // 'Hoy' | 'Semana' | 'Todos'
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all | exact | offset
  const [freqFilter, setFreqFilter] = useState('all'); // all | Diario | Semanal | Días alternos
  const [stateFilter, setStateFilter] = useState('all'); // all | pending | done

  // Edit modal
  const [editing, setEditing] = useState(null); // habit
  const [editTime, setEditTime] = useState('08:00 AM');
  const [editRepeats, setEditRepeats] = useState('1');

  const nowMinutes = useMemo(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }, []);

  // Lista base filtrada
  const filtered = useMemo(() => {
    let list = active || [];
    if (q.trim()) {
      const lq = q.trim().toLowerCase();
      list = list.filter((h) => (h.title || '').toLowerCase().includes(lq));
    }
    if (typeFilter !== 'all') {
      list = list.filter((h) => (typeFilter === 'exact' ? h.scheduleType === 'exact' : h.scheduleType === 'offset'));
    }
    if (freqFilter !== 'all') {
      list = list.filter((h) => (h.frequency || 'Diario') === freqFilter);
    }
    if (stateFilter !== 'all') {
      list = list.filter((h) => {
        const repeats = Math.max(1, parseInt(h.dailyRepeats || 1, 10));
        const cnt = getTodayCount(h.id);
        const done = cnt >= repeats;
        return stateFilter === 'done' ? done : !done;
      });
    }
    return list;
  }, [active, q, typeFilter, freqFilter, stateFilter, getTodayCount]);

  // Agrupar por franjas (solo exact)
  const groups = useMemo(() => {
    const morning = [];
    const afternoon = [];
    const night = [];
    filtered.forEach((h) => {
      if (h.scheduleType !== 'exact') return; // ignorar offset en franjas
      const m = parseExactToMinutes(h.exactTime || '08:00 AM');
      if (m == null) return;
      const item = { habit: h, minutes: m };
      if (m >= 5 * 60 && m < 12 * 60) morning.push(item);
      else if (m >= 12 * 60 && m < 19 * 60) afternoon.push(item);
      else night.push(item);
    });
    const sortByProximity = (arr) => {
      return arr
        .map((it) => ({ ...it, delta: it.minutes - nowMinutes, past: it.minutes - nowMinutes < 0 }))
        .sort((a, b) => {
          if (a.past !== b.past) return a.past ? 1 : -1; // futuros primero
          const da = Math.abs(a.delta);
          const db = Math.abs(b.delta);
          return da - db;
        });
    };
    return {
      morning: sortByProximity(morning),
      afternoon: sortByProximity(afternoon),
      night: sortByProximity(night),
    };
  }, [filtered, nowMinutes]);

  const nextItem = useMemo(() => {
    const all = [...groups.morning, ...groups.afternoon, ...groups.night];
    return all.find((it) => !it.past) || null;
  }, [groups]);

  // Acciones
  const complete = useCallback((h) => {
    incrementCompleteToday(h.id);
  }, [incrementCompleteToday]);

  const snooze = useCallback((h, minutes) => {
    if (!h || h.scheduleType !== 'exact') return;
    const m = parseExactToMinutes(h.exactTime);
    if (m == null) return;
    updateHabit(h.id, { exactTime: minutesToExact(m + minutes) });
  }, [updateHabit]);

  const openEdit = useCallback((h) => {
    setEditing(h);
    setEditTime(h.exactTime || '08:00 AM');
    setEditRepeats(String(h.dailyRepeats || 1));
  }, []);

  const saveEdit = useCallback(() => {
    if (!editing) return;
    const payload = { dailyRepeats: Math.max(1, parseInt(editRepeats || '1', 10)) };
    if (editing.scheduleType === 'exact') payload.exactTime = normalizeTime12h(editTime);
    updateHabit(editing.id, payload);
    setEditing(null);
  }, [editing, editTime, editRepeats, updateHabit]);

  // UI helpers
  const renderItemRight = (h) => {
    const repeats = Math.max(1, parseInt(h.dailyRepeats || 1, 10));
    const cnt = getTodayCount(h.id);
    const done = cnt >= repeats;
    return (
      <Row>
        <Pill><PillText>{Math.min(cnt, repeats)}/{repeats}</PillText></Pill>
        <Button title={done ? 'Hecho' : 'Completar'} onPress={() => complete(h)} style={{ marginLeft: 8 }} />
      </Row>
    );
  };

  const renderSnoozeButtons = (h) => (
    <Row style={{ gap: 6, marginTop: 6 }}>
      <Button title="+10" variant="ghost" onPress={() => snooze(h, 10)} />
      <Button title="+30" variant="ghost" onPress={() => snooze(h, 30)} />
      <Button title="+60" variant="ghost" onPress={() => snooze(h, 60)} />
      <Button title="Editar" variant="ghost" onPress={() => openEdit(h)} />
    </Row>
  );

  const EmptyCard = () => (
    <Card>
      <Title>No hay recordatorios exactos para hoy</Title>
      <Subtitle style={{ marginTop: 6 }}>Agrega horarios a tus hábitos para verlos aquí.</Subtitle>
      <Row style={{ marginTop: 10 }}>
        <Button title="Ir a Hábitos" onPress={() => nav.navigate('Hábitos')} />
      </Row>
    </Card>
  );

  // Cabecera
  const Header = () => (
    <Card>
      <Wrap>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row style={{ gap: 8 }}>
            {['Hoy','Semana','Todos'].map((t) => (
              <Chip key={t} active={tab === t} onPress={() => setTab(t)}>
                <ChipText active={tab === t}>{t}</ChipText>
              </Chip>
            ))}
          </Row>
          <Row>
            <Button
              variant={notificationsEnabled ? 'ghost' : 'primary'}
              title={notificationsEnabled ? 'Pausar notificaciones' : 'Activar notificaciones'}
              onPress={() => setNotifications(!notificationsEnabled)}
            />
          </Row>
        </Row>

        <Row style={{ gap: 8 }}>
          <Search
            placeholder="Buscar hábito..."
            placeholderTextColor={theme.colors.textMuted}
            value={q}
            onChangeText={setQ}
          />
        </Row>
        <Row style={{ gap: 8, flexWrap: 'wrap' }}>
          {/* Tipo */}
          {['all','exact','offset'].map((t) => (
            <Chip key={t} active={typeFilter === t} onPress={() => setTypeFilter(t)}>
              <ChipText active={typeFilter === t}>Tipo: {t}</ChipText>
            </Chip>
          ))}
          {/* Frecuencia */}
          {['all','Diario','Semanal','Días alternos'].map((f) => (
            <Chip key={f} active={freqFilter === f} onPress={() => setFreqFilter(f)}>
              <ChipText active={freqFilter === f}>Freq: {f}</ChipText>
            </Chip>
          ))}
          {/* Estado */}
          {['all','pending','done'].map((s) => (
            <Chip key={s} active={stateFilter === s} onPress={() => setStateFilter(s)}>
              <ChipText active={stateFilter === s}>Estado: {s}</ChipText>
            </Chip>
          ))}
        </Row>
      </Wrap>
    </Card>
  );

  // Timeline Hoy
  const TodayTimeline = () => {
    const all = [...groups.morning, ...groups.afternoon, ...groups.night];
    if (all.length === 0) return null;
    const next = nextItem?.habit?.id;
    return (
      <Card>
        <Title>Hoy</Title>
        <Subtitle>Tu línea de tiempo</Subtitle>
        <Timeline>
          <NowDot />
          {all.map((it, idx) => {
            const h = it.habit;
            const past = it.past;
            const isNext = h.id === next;
            const color = past ? theme.colors.textMuted : isNext ? theme.colors.accent : theme.colors.text;
            return (
              <ListItem
                key={h.id + '-' + idx}
                icon={<TextEmoji>{h.icon || '⏰'}</TextEmoji>}
                title={h.title}
                subtitle={`${h.exactTime || ''}`}
                right={renderItemRight(h)}
                style={{ opacity: past ? 0.6 : 1, borderLeftColor: isNext ? theme.colors.accent : 'transparent' }}
              />
            );
          })}
        </Timeline>
      </Card>
    );
  };

  return (
    <Screen>
      <Container contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Cabecera con filtros y toggle notificaciones */}
        <Header />

        {/* Siguiente */}
        {nextItem ? (
          <Card style={{ marginTop: 12 }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Title>Próximo: {nextItem.habit.title}</Title>
              <Row>
                <Button title="Completar" onPress={() => complete(nextItem.habit)} />
              </Row>
            </Row>
            <Subtitle style={{ marginTop: 6 }}>{nextItem.habit.exactTime} • {nextItem.habit.frequency || 'Diario'}</Subtitle>
            {renderSnoozeButtons(nextItem.habit)}
          </Card>
        ) : null}

        {/* Franjas */}
        <Title style={{ marginTop: 16 }}>Mañana</Title>
        <Card style={{ marginTop: 6 }}>
          {groups.morning.length === 0 ? <Subtitle>Sin recordatorios en esta franja.</Subtitle> : groups.morning.map((it, idx) => (
            <React.Fragment key={it.habit.id + '-' + idx}>
              {idx > 0 ? <Divider /> : null}
              <ListItem
                icon={<TextEmoji>{it.habit.icon || '⏰'}</TextEmoji>}
                title={it.habit.title}
                subtitle={`${it.habit.exactTime || ''}`}
                right={renderItemRight(it.habit)}
              />
              {renderSnoozeButtons(it.habit)}
            </React.Fragment>
          ))}
        </Card>

        <Title style={{ marginTop: 16 }}>Tarde</Title>
        <Card style={{ marginTop: 6 }}>
          {groups.afternoon.length === 0 ? <Subtitle>Sin recordatorios en esta franja.</Subtitle> : groups.afternoon.map((it, idx) => (
            <React.Fragment key={it.habit.id + '-' + idx}>
              {idx > 0 ? <Divider /> : null}
              <ListItem
                icon={<TextEmoji>{it.habit.icon || '⏰'}</TextEmoji>}
                title={it.habit.title}
                subtitle={`${it.habit.exactTime || ''}`}
                right={renderItemRight(it.habit)}
              />
              {renderSnoozeButtons(it.habit)}
            </React.Fragment>
          ))}
        </Card>

        <Title style={{ marginTop: 16 }}>Noche</Title>
        <Card style={{ marginTop: 6 }}>
          {groups.night.length === 0 ? <Subtitle>Sin recordatorios en esta franja.</Subtitle> : groups.night.map((it, idx) => (
            <React.Fragment key={it.habit.id + '-' + idx}>
              {idx > 0 ? <Divider /> : null}
              <ListItem
                icon={<TextEmoji>{it.habit.icon || '⏰'}</TextEmoji>}
                title={it.habit.title}
                subtitle={`${it.habit.exactTime || ''}`}
                right={renderItemRight(it.habit)}
              />
              {renderSnoozeButtons(it.habit)}
            </React.Fragment>
          ))}
        </Card>

        {/* Timeline de hoy */}
        <TodayTimeline />

        {/* Vacíos */}
        {groups.morning.length + groups.afternoon.length + groups.night.length === 0 ? (
          <EmptyCard />
        ) : null}
      </Container>

      {/* Modal edición */}
      <ModalSheet visible={!!editing} onClose={() => setEditing(null)}>
        <Title style={{ marginBottom: 8 }}>Editar recordatorio</Title>
        {editing?.scheduleType === 'exact' ? (
          <Wrap>
            <Subtitle>Hora (12h)</Subtitle>
            <Search
              placeholder="hh:mm AM/PM"
              placeholderTextColor={theme.colors.textMuted}
              value={editTime}
              onChangeText={setEditTime}
            />
          </Wrap>
        ) : null}
        <Wrap style={{ marginTop: 10 }}>
          <Subtitle>Veces por día</Subtitle>
          <Search
            placeholder="1"
            placeholderTextColor={theme.colors.textMuted}
            value={editRepeats}
            onChangeText={setEditRepeats}
            keyboardType="number-pad"
            maxLength={2}
          />
        </Wrap>
        <Row style={{ marginTop: 12, justifyContent: 'flex-end' }}>
          <Button title="Cancelar" variant="ghost" onPress={() => setEditing(null)} />
          <Button title="Guardar" onPress={saveEdit} style={{ marginLeft: 8, opacity: editing?.scheduleType !== 'exact' || validateTime12h(editTime) ? 1 : 0.6 }} />
        </Row>
      </ModalSheet>
    </Screen>
  );
}

const TextEmoji = styled.Text`
  font-size: 16px;
`;
