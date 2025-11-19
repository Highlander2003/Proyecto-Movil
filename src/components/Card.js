import React, { forwardRef } from 'react';
import styled from 'styled-components/native';

// Contenedor base tipo tarjeta
// - Aplica fondo, borde, radio y padding desde el tema
// - Usar para agrupar contenido con aspecto elevado
const Wrapper = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius}px;
  padding: ${({ theme }) => theme.card.padding}px;
`;

const Card = forwardRef(({ children, style }, ref) => {
  return <Wrapper ref={ref} style={style}>{children}</Wrapper>;
});

export default Card;
