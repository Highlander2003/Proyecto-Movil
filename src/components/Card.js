import React from 'react';
import styled from 'styled-components/native';

const Wrapper = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius}px;
  padding: ${({ theme }) => theme.card.padding}px;
`;

export default function Card({ children, style }) {
  return <Wrapper style={style}>{children}</Wrapper>;
}
