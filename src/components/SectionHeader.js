import React from 'react';
import styled from 'styled-components/native';

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  margin: 16px 8px 8px;
`;

export default function SectionHeader({ children }) {
  return <Title>{children}</Title>;
}
