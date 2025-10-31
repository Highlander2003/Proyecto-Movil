import React, { useMemo } from 'react';
import styled from 'styled-components/native';
import Card from '../components/Card';
import Button from '../components/Button';
import ListItem from '../components/ListItem';
import CircularProgress from '../components/CircularProgress';
import ProgressBar from '../components/ProgressBar';
import { useAuthStore } from '../store/auth';
import { useHabitsStore } from '../store/habits';
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
const Container = styled.ScrollView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
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
  const isCompletedToday = useHabitsStore((s) => s.isCompletedToday);
  const toggleCompleteToday = useHabitsStore((s) => s.toggleCompleteToday);
  const completions = useHabitsStore((s) => s.completions);

  const name = useMemo(() => {
    const base = user?.displayName || user?.email?.split('@')[0] || 'Usuario';
    return base.charAt(0).toUpperCase() + base.slice(1);
  }, [user]);

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
        if (dayMap[h.id]) count += 1;
      }
    }
    return clamp(count / totalSlots, 0, 1);
  }, [completions, active]);

  return (
    <Container contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Saludo */}
      <Heading>Hola, {name}</Heading>

      <Gap />
      {/* Reto de hoy */}
      {daily ? (
        <Card>
          <Row>
            <Title>{daily.icon}  {daily.title}</Title>
            {active.some(a => a.title === daily.title) ? (
              (() => {
                const h = active.find(a => a.title === daily.title);
                const done = h ? isCompletedToday(h.id) : false;
                return (
                  <CompleteButton done={done} onPress={() => h && toggleCompleteToday(h.id)}>
                    <Ionicons name={done ? 'checkmark-circle' : 'radio-button-off'} size={16} color={done ? '#00110d' : '#cbd5e1'} />
                    <CompleteText done={done}>{done ? 'Hecho' : 'Completar'}</CompleteText>
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
      {/* Hábitos activos */}
      <Title>Mis hábitos</Title>
      <Card style={{ marginTop: 8 }}>
        {active.length === 0 ? (
          <Sub>No tienes hábitos activos aún. Agrega el reto de hoy para comenzar.</Sub>
        ) : (
          active.map((h, idx) => (
            <React.Fragment key={h.id}>
              {idx > 0 ? <Divider /> : null}
              <ListItem
                icon={<TextEmoji>{h.icon || '✅'}</TextEmoji>}
                title={h.title}
                subtitle={`${h.frequency || 'Diario'}${h.time ? ` • ${h.time}` : ''}`}
                right={
                  <Row>
                    <ProgressWrap>
                      <ProgressBar value={((idx + 1) % 4) * 0.25} />
                    </ProgressWrap>
                    <CompleteButton done={isCompletedToday(h.id)} onPress={() => toggleCompleteToday(h.id)} style={{ marginLeft: 8 }}>
                      <Ionicons name={isCompletedToday(h.id) ? 'checkmark-circle' : 'radio-button-off'} size={16} color={isCompletedToday(h.id) ? '#00110d' : '#cbd5e1'} />
                      <CompleteText done={isCompletedToday(h.id)}>{isCompletedToday(h.id) ? 'Hecho' : 'Completar'}</CompleteText>
                    </CompleteButton>
                  </Row>
                }
              />
            </React.Fragment>
          ))
        )}
      </Card>
    </Container>
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
  width: 120px;
`;
