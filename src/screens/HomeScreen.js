import React, { useMemo, useCallback } from 'react';
import styled from 'styled-components/native';
import Card from '../components/Card';
import Button from '../components/Button';
import ListItem from '../components/ListItem';
import CircularProgress from '../components/CircularProgress';
import ProgressBar from '../components/ProgressBar';
import { useAuthStore } from '../store/auth';
import { useHabitsStore } from '../store/habits';
import { useProfileStore } from '../store/profile';
import { getDailyChallenge } from '../services/recommendations';
import { clamp } from '../services/adaptive';
import { Ionicons } from '@expo/vector-icons';

// Pantalla de Inicio (Home)
// - Actualmente es un stub (plantilla vacía) para el dashboard principal.
// - Próximos elementos a implementar según el diseño:
//   1) Saludo personalizado (por ejemplo: "Hola, Luis")
//   2) Tarjeta "Reto de hoy" con botón "Completar"
//   3) Progreso semanal con un gráfico circular (ej. 57%)
//   4) Lista de hábitos activos con barra de progreso lineal
// - Recomendación: reutilizar componentes (Card, ProgressBarCircular/Linear)
//   y obtener datos desde el store de hábitos (Zustand) o Firestore si está configurado.
const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;
const Container = styled.ScrollView`
  flex: 1;
  padding: 16px;
`;
const Heading = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  font-weight: 700;
`;
const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  font-size: 18px;
`;
const Sub = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
`;
const Gap = styled.View`
  height: 12px;
`;

const CompleteButton = styled.TouchableOpacity`
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ done, theme }) => (done ? theme.colors.success : theme.colors.surfaceAlt)};
  flex-direction: row; align-items: center;
`;
const CompleteText = styled.Text`
  color: ${({ done }) => (done ? '#00110d' : '#cbd5e1')};
  font-weight: 700;
  margin-left: 6px;
`;

export default function HomeScreen() {
  // Datos de usuario y hábitos
  const user = useAuthStore((s) => s.user);
  const active = useHabitsStore((s) => s.active);
  const suggested = useHabitsStore((s) => s.suggested);
  const addSuggested = useHabitsStore((s) => s.addSuggested);
  const getTodayCount = useHabitsStore((s) => s.getTodayCount);
  const incrementCompleteToday = useHabitsStore((s) => s.incrementCompleteToday);
  const completions = useHabitsStore((s) => s.completions);
  const updateHabit = useHabitsStore((s) => s.updateHabit);

  const preferredName = useProfileStore((s) => s.preferredName);
  const name = useMemo(() => {
    // Preferir nombre preferido del perfil, luego displayName, luego fallback al email sin mostrar sólo la parte local
    const base = preferredName || user?.displayName || null;
    if (base) return base.charAt(0).toUpperCase() + base.slice(1);
    // Si no hay nombre ni displayName, mostrar 'Usuario' en vez de la parte del email
    return 'Usuario';
  }, [user, preferredName]);

  const daily = useMemo(() => getDailyChallenge({ active, suggested }), [active, suggested]);
  const weeklyProgress = useMemo(() => {
    const totalSlots = active.length * 7;
    if (totalSlots === 0) return 0;
    // Últimos 7 días desde hoy
    const keys = [];
    const d = new Date();
    for (let i = 0; i < 7; i++) {
      const di = new Date(d);
      di.setDate(d.getDate() - i);
      const y = di.getFullYear();
      const m = String(di.getMonth() + 1).padStart(2, '0');
      const day = String(di.getDate()).padStart(2, '0');
      keys.push(`${y}-${m}-${day}`);
    }
    let count = 0;
    for (const k of keys) {
      const dayMap = completions[k] || {};
      for (const h of active) {
        const raw = dayMap[h.id];
        const val = typeof raw === 'boolean' ? (raw ? 1 : 0) : parseInt(raw || 0, 10);
        const max = Math.max(1, parseInt(h.dailyRepeats || 1, 10));
        if (val >= max) count += 1;
      }
    }
    return clamp(count / totalSlots, 0, 1);
  }, [completions, active]);

  // Progreso por hábito (hoy): repeticiones completadas hoy / repeticiones requeridas
  const perHabitProgress = useMemo(() => {
    const res = {};
    if (!active.length) return res;
    for (const h of active) {
      const max = Math.max(1, parseInt(h.dailyRepeats || 1, 10));
      const cnt = getTodayCount(h.id);
      res[h.id] = clamp(cnt / max, 0, 1);
    }
    return res;
  }, [completions, active, getTodayCount]);

  // Helpers para horarios exactos (formato "HH:MM AM/PM")
  const parseExactToMinutes = useCallback((exact) => {
    if (!exact || typeof exact !== 'string') return null;
    const m = exact.trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
    if (!m) return null;
    let hh = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const ampm = m[3].toUpperCase();
    if (hh === 12) hh = 0;
    if (ampm === 'PM') hh += 12;
    return hh * 60 + mm;
  }, []);

  const minutesToExact = useCallback((mins) => {
    let total = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
    let hh24 = Math.floor(total / 60);
    const mm = total % 60;
    const ampm = hh24 >= 12 ? 'PM' : 'AM';
    let hh = hh24 % 12;
    if (hh === 0) hh = 12;
    const mmStr = String(mm).padStart(2, '0');
    return `${hh}:${mmStr} ${ampm}`;
  }, []);

  // Próximo recordatorio (solo hábitos con horario exacto)
  const nowMinutes = useMemo(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }, []);

  const upcoming = useMemo(() => {
    const items = [];
    for (const h of active) {
      if (h.scheduleType !== 'exact' || !h.exactTime) continue;
      const m = parseExactToMinutes(h.exactTime);
      if (m == null) continue;
      let delta = m - nowMinutes;
      let dayOffset = 0;
      if (delta < 0) { // ya pasó hoy, considerar mañana
        delta += 24 * 60;
        dayOffset = 1;
      }
      items.push({ habit: h, minutes: m, delta, dayOffset });
    }
    items.sort((a, b) => a.delta - b.delta);
    return items;
  }, [active, nowMinutes, parseExactToMinutes]);

  const nextItem = upcoming[0] || null;

  const snooze30 = useCallback((h) => {
    if (!h || h.scheduleType !== 'exact') return;
    const m = parseExactToMinutes(h.exactTime);
    if (m == null) return;
    const next = minutesToExact(m + 30);
    updateHabit(h.id, { exactTime: next });
  }, [parseExactToMinutes, minutesToExact, updateHabit]);

  return (
    <Screen>
      <Container contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Saludo */}
      <Heading>Hola, {name}</Heading>

      <Gap />
      {/* Reto de hoy */}
      {daily ? (
        <Card>
          <AIBadge>
            <BadgeEmoji>🤖</BadgeEmoji>
            <BadgeText>Recomendación generada por IA</BadgeText>
          </AIBadge>
          <Row>
            <Title>{daily.icon}  {daily.title}</Title>
            {active.some(a => a.title === daily.title) ? (
              (() => {
                const h = active.find(a => a.title === daily.title);
                const repeats = h ? Math.max(1, parseInt(h.dailyRepeats || 1, 10)) : 1;
                const cnt = h ? getTodayCount(h.id) : 0;
                const done = cnt >= repeats;
                return (
                  <CompleteButton done={done} onPress={() => h && incrementCompleteToday(h.id)}>
                    <Ionicons name={done ? 'checkmark-circle' : 'radio-button-off'} size={16} color={done ? '#00110d' : '#cbd5e1'} />
                    <CompleteText done={done}>{done ? 'Hecho' : `Completar (${Math.min(cnt, repeats)}/${repeats})`}</CompleteText>
                  </CompleteButton>
                );
              })()
            ) : (
              <Button title="Agregar" onPress={() => addSuggested(daily.id)} />
            )}
          </Row>
          <Sub style={{ marginTop: 6 }}>{daily.desc}</Sub>
        </Card>
      ) : null}

      <Gap />
      {/* Próximo recordatorio */}
      {nextItem ? (
        <Card>
          <Row>
            <Title>Próximo: {nextItem.habit.title}</Title>
            <Row>
              {(() => {
                const h = nextItem.habit;
                const repeats = Math.max(1, parseInt(h.dailyRepeats || 1, 10));
                const cnt = getTodayCount(h.id);
                const done = cnt >= repeats;
                return (
                  <CompleteButton done={done} onPress={() => incrementCompleteToday(h.id)} style={{ marginRight: 8 }}>
                    <Ionicons name={done ? 'checkmark-circle' : 'radio-button-off'} size={16} color={done ? '#00110d' : '#cbd5e1'} />
                    <CompleteText done={done}>{done ? 'Hecho' : `Completar (${Math.min(cnt, repeats)}/${repeats})`}</CompleteText>
                  </CompleteButton>
                );
              })()}
              {nextItem.habit.scheduleType === 'exact' ? (
                <Button title="Posponer 30 min" onPress={() => snooze30(nextItem.habit)} />
              ) : null}
            </Row>
          </Row>
          <Sub style={{ marginTop: 6 }}>
            {nextItem.dayOffset === 0 ? 'Hoy' : 'Mañana'} a las {nextItem.habit.exactTime}
          </Sub>
        </Card>
      ) : null}

      <Gap />
      {/* Progreso semanal */}
      <Card>
        <Row style={{ alignItems: 'center' }}>
          <CircularProgress value={weeklyProgress}>
            <Title>{Math.round(weeklyProgress * 100)}%</Title>
            <Sub>Semana</Sub>
          </CircularProgress>
          <Sub style={{ flex: 1, marginLeft: 16 }}>
            Tu constancia esta semana. Añade o completa hábitos para subir el porcentaje.
          </Sub>
        </Row>
      </Card>

      <Gap />
      {/* Próximos recordatorios (lista) */}
      {upcoming.length > 1 ? (
        <>
          <Title>Próximos recordatorios</Title>
          <Card style={{ marginTop: 8 }}>
            {upcoming.slice(0, 3).map((it, idx) => (
              <React.Fragment key={it.habit.id + '-' + idx}>
                {idx > 0 ? <Divider /> : null}
                <ListItem
                  icon={<TextEmoji>{it.habit.icon || '⏰'}</TextEmoji>}
                  title={it.habit.title}
                  subtitle={`${it.dayOffset === 0 ? 'Hoy' : 'Mañana'} • ${it.habit.exactTime || ''}`}
                />
              </React.Fragment>
            ))}
          </Card>
          <Gap />
        </>
      ) : null}

      {/* Hábitos activos */}
      <Title>Mis hábitos</Title>
      <Card style={{ marginTop: 8 }}>
        {active.length === 0 ? (
          <Sub>No tienes hábitos activos aún. Agrega el reto de hoy para comenzar.</Sub>
        ) : (
          active.map((h, idx) => {
            const repeats = Math.max(1, parseInt(h.dailyRepeats || 1, 10));
            const cnt = getTodayCount(h.id);
            const done = cnt >= repeats;
            return (
              <React.Fragment key={h.id}>
                {idx > 0 ? <Divider /> : null}
                <HabitRow>
                  <HabitTop>
                    <HabitInfo>
                      <HabitTitle>
                        <TextEmoji style={{ marginRight: 8 }}>{h.icon || '✅'}</TextEmoji>
                        {h.title}
                      </HabitTitle>
                      <HabitSub>{h.frequency || 'Diario'}{h.time ? ` • ${h.time}` : ''}</HabitSub>
                    </HabitInfo>
                    <CompleteButton done={done} onPress={() => incrementCompleteToday(h.id)}>
                      <Ionicons name={done ? 'checkmark-circle' : 'radio-button-off'} size={16} color={done ? '#00110d' : '#cbd5e1'} />
                      <CompleteText done={done}>{done ? 'Hecho' : `Completar (${Math.min(cnt, repeats)}/${repeats})`}</CompleteText>
                    </CompleteButton>
                  </HabitTop>
                  <ProgressWrap>
                    <ProgressBar value={perHabitProgress[h.id] || 0} />
                  </ProgressWrap>
                </HabitRow>
              </React.Fragment>
            );
          })
        )}
      </Card>
      </Container>
    </Screen>
  );
}

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const TextEmoji = styled.Text`
  font-size: 16px;
`;

const ProgressWrap = styled.View`
  width: 100%;
`;

const HabitRow = styled.View`
  padding: 14px 12px;
  gap: 10px;
`;

const HabitTop = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const HabitInfo = styled.View`
  flex: 1;
`;

const HabitTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 16px;
  flex-direction: row;
  align-items: center;
`;

const HabitSub = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  margin-top: 2px;
`;

const AIBadge = styled.View`
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.surfaceAlt};
  margin-bottom: 8px;
`;

const BadgeEmoji = styled.Text`
  margin-right: 6px;
`;

const BadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  font-weight: 600;
`;
