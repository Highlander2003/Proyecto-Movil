import React from 'react';
import styled from 'styled-components/native';

// Pantalla de Recordatorios (stub)
// - Pendiente implementar:
//   1) Tarjetas para Mañana (08:00), Tarde (14:00), Noche (20:00) con switches
//   2) Botón para añadir horario personalizado
//   3) Al activar, programar notificaciones locales (services/notifications)
//   4) Persistir preferencias en un store (Zustand) p.ej. reminders
// - Consideraciones:
//   - Pedir permisos la primera vez (configureNotifications)
//   - Manejar zonas horarias y repetición diaria
const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 16px;
`;
const Text = styled.Text`
  color: ${({ theme }) => theme.colors.text};
`;

export default function RemindersScreen() {
  return (
    <Container>
      <Text>Recordatorios (stub)</Text>
    </Container>
  );
}
