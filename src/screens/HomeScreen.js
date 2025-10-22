import React from 'react';
import styled from 'styled-components/native';

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
    <Container contentContainerStyle={{ paddingBottom: 40 }}>
      <Heading>Inicio (stub)</Heading>
    </Container>
  );
}
