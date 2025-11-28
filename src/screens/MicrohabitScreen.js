import React from 'react';
import styled from 'styled-components/native';

const Screen = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Text = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 20px;
  font-weight: 700;
`;

export default function MicrohabitScreen() {
  return (
    <Screen>
      <Text>Hola Mundo</Text>
    </Screen>
  );
}
