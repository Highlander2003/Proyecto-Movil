import React from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';

const Wrap = styled.View`
  border-radius: ${({ theme }) => theme.radius}px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;
const Row = styled.View`
  flex-direction: row;
  justify-content: space-around;
  padding: 18px 8px;
`;
const Metric = styled.View`
  align-items: center;
`;
const Value = styled.Text`
  color: #e6fffb;
  font-weight: 800;
  font-size: 22px;
`;
const Label = styled.Text`
  color: #b2f5ea;
  font-size: 12px;
`;

export default function StatsBar({ completed = 24, streak = 5, success = 86 }) {
  return (
    <Wrap>
      <LinearGradient colors={["#0e3b35", "#0b2a26"]} start={{x:0, y:0}} end={{x:1, y:1}}>
        <Row>
          <Metric>
            <Value>{completed}</Value>
            <Label>Completados</Label>
          </Metric>
          <Metric>
            <Value>{streak}</Value>
            <Label>Racha</Label>
          </Metric>
          <Metric>
            <Value>{success}%</Value>
            <Label>Éxito</Label>
          </Metric>
        </Row>
      </LinearGradient>
    </Wrap>
  );
}
