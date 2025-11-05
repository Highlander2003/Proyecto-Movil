import React from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';

// Tarjeta de logro
// Props:
// - icon: emoji o ícono a mostrar
// - title: título del logro
// - subtitle: texto secundario opcional
// - colors: arreglo de 2 colores para el gradiente de fondo
// Notas:
// - Usa LinearGradient para un estilo destacado
// - Respeta el radius y colores del tema para borde
const Wrap = styled.View`
  flex: 1;
  border-radius: ${({ theme }) => theme.radius}px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  min-width: 150px;
`;
const Inner = styled.View`
  padding: 14px;
`;
const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
`;
const Sub = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;

export default function AchievementCard({ icon, title, subtitle, colors = ['#0b2731','#0b1f27'] }) {
  return (
    <Wrap>
      {/* Gradiente decorativo del fondo de la tarjeta */}
      <LinearGradient colors={colors} start={{x:0, y:0}} end={{x:1, y:1}}>
        <Inner>
          {/* Título: combina el icono con el texto */}
          <Title style={{ marginBottom: 8 }}>{icon}  {title}</Title>
          {subtitle ? <Sub>{subtitle}</Sub> : null}
        </Inner>
      </LinearGradient>
    </Wrap>
  );
}
