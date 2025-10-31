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

export default function HomeScreen() {
  // Datos de usuario y hábitos
  const user = useAuthStore((s) => s.user);
  const active = useHabitsStore((s) => s.active);
  const suggested = useHabitsStore((s) => s.suggested);
  const addSuggested = useHabitsStore((s) => s.addSuggested);

  const name = useMemo(() => {
    const base = user?.displayName || user?.email?.split('@')[0] || 'Usuario';
    return base.charAt(0).toUpperCase() + base.slice(1);
  }, [user]);

  const daily = useMemo(() => getDailyChallenge({ active, suggested }), [active, suggested]);
  const weeklyProgress = useMemo(() => clamp(active.length * 0.12, 0, 1), [active.length]);

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
            <Button title="Agregar" onPress={() => addSuggested(daily.id)} />
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
                subtitle={h.frequency || 'Diario'}
                right={<ProgressWrap><ProgressBar value={((idx + 1) % 4) * 0.25} /></ProgressWrap>}
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
