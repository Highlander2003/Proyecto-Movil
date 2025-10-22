import React from 'react';
import styled from 'styled-components/native';

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

export default function HomeScreen() {
  return (
    // contentContainerStyle agrega padding inferior para evitar que el contenido
    // quede pegado al borde, especialmente con la barra de pestañas inferior.
    <Container contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Título temporal mientras se construye el dashboard */}
      <Heading>Inicio (stub)</Heading>
      {/**
       * Próximas secciones sugeridas:
       * - <Greeting />: Componente con el nombre del usuario desde el store de auth
       * - <TodayChallengeCard />: Tarjeta con CTA "Completar"
       * - <WeeklyCircularProgress value={0.57} />
       * - <ActiveHabitsList />: Lista con ProgressBar lineal por hábito
       */}
    </Container>
  );
}
