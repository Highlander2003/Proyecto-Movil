import React from 'react';
import styled from 'styled-components/native';

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
