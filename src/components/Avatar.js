import React from 'react';
import styled from 'styled-components/native';

// Avatar con inicial del usuario
// Props:
// - name: nombre completo o identificador del usuario
// Comportamiento:
// - Muestra la primera letra del nombre en mayúscula
// Accesibilidad:
// - Usa accessibilityLabel para lectores de pantalla
const Wrap = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${({ theme }) => theme.colors.accent};
  align-items: center;
  justify-content: center;
`;
const Label = styled.Text`
  color: #00110d;
  font-weight: 800;
  font-size: 18px;
`;

export default function Avatar({ name = 'Usuario' }) {
  const initial = (name || 'U').trim().charAt(0).toUpperCase();
  return (
    <Wrap accessibilityLabel={`Avatar ${name}`}>
      <Label>{initial}</Label>
    </Wrap>
  );
}
