import React from 'react';
import styled from 'styled-components/native';
import Card from '../components/Card';
import AchievementCard from '../components/AchievementCard';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { VictoryChart, VictoryAxis, VictoryLine, VictoryTheme } from 'victory-native';
import { Dimensions } from 'react-native';

const Screen = styled.ScrollView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;
const Content = styled.View`
  padding: 16px;
  gap: 12px;
`;
const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  font-size: 24px;
`;
const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
`;
const Row = styled.View`
  flex-direction: row;
  gap: 12px;
  align-items: stretch;
`;
const Col = styled.View`
  flex: 1;
`;
const StreakValue = styled.Text`
  color: #fff7ed;
  font-weight: 800;
  font-size: 28px;
`;
const StreakLabel = styled.Text`
  color: #ffe4d6;
`;
const MetricValue = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  font-size: 22px;
`;
const MetricLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;
const FooterTip = styled.View`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius}px;
  padding: 10px 12px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;
const TipText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const days = ['L','M','X','J','V','S','D'];
const width = Math.min(Dimensions.get('window').width - 48, 480);

export default function ProgressScreen() {
  // Datos de ejemplo
  const streak = 5;
  const completed = 24;
  const success = 86;
  const week = [0,0,0,0,0,0,0];

  return (
    <Screen contentContainerStyle={{ paddingBottom: 40 }}>
      <Content>
        <Title>Tu progreso</Title>
        <Subtitle>Celebra cada logro en tu camino</Subtitle>

        {/* Racha actual */}
        <Card>
          <LinearGradient colors={["#3a0f2e", "#1b0f1b"]} start={{x:0, y:0}} end={{x:1, y:1}} style={{ borderRadius: 12, overflow: 'hidden' }}>
            <Row style={{ padding: 14, alignItems: 'center' }}>
              <Col>
                <Subtitle style={{ color: '#ffd7d7' }}>Racha actual</Subtitle>
                <StreakValue>{streak}</StreakValue>
                <StreakLabel>días</StreakLabel>
              </Col>
              <Ionicons name="flame" size={28} color="#ff7a18" />
            </Row>
          </LinearGradient>
        </Card>

        {/* Esta semana - gráfico */}
        <Card>
          <Row style={{ alignItems: 'center' }}>
            <Subtitle>Esta semana</Subtitle>
          </Row>
          <VictoryChart
            theme={VictoryTheme.material}
            width={width}
            height={180}
            padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
          >
            <VictoryAxis
              tickValues={[1,2,3,4,5,6,7]}
              tickFormat={days}
              style={{
                axis: { stroke: 'transparent' },
                ticks: { stroke: 'transparent' },
                tickLabels: { fill: '#9aa4b2', fontSize: 10 }
              }}
            />
            <VictoryAxis
              dependentAxis
              tickCount={3}
              style={{ axis: { stroke: 'transparent' }, grid: { stroke: '#2a313f' }, tickLabels: { fill: 'transparent' } }}
            />
            <VictoryLine
              interpolation="monotoneX"
              style={{ data: { stroke: '#22e6c5' } }}
              data={week.map((v, i) => ({ x: i + 1, y: v }))}
            />
          </VictoryChart>
        </Card>

        {/* Métricas */}
        <Row>
          <Col>
            <Card>
              <Subtitle>Total completados</Subtitle>
              <MetricValue style={{ marginTop: 6 }}>{completed}</MetricValue>
              <MetricLabel>hábitos</MetricLabel>
            </Card>
          </Col>
          <Col>
            <Card>
              <Subtitle>Tasa de éxito</Subtitle>
              <MetricValue style={{ marginTop: 6 }}>{success}%</MetricValue>
              <MetricLabel>esta semana</MetricLabel>
            </Card>
          </Col>
        </Row>

        {/* Logros */}
        <Subtitle style={{ marginTop: 6 }}>Logros</Subtitle>
        <Row>
          <AchievementCard icon="🏅" title="7 días seguidos" subtitle="Bebiendo agua" colors={["#1b2838","#10222b"]} />
          <AchievementCard icon="⭐" title="Primera semana" subtitle="Completada con éxito" colors={["#1b2a2b","#0f1f22"]} />
        </Row>
        <Row>
          <AchievementCard icon="🎯" title="Racha perfecta" subtitle="14 días sin fallar" colors={["#141826","#111421"]} />
          <AchievementCard icon="💎" title="Maestro de hábitos" subtitle="30 días de constancia" colors={["#151a23","#10141b"]} />
        </Row>

        <FooterTip>
          <Ionicons name="sparkles" size={16} color="#ffd166" />
          <TipText>¡Sigue así! Los pequeños pasos hacen grandes cambios.</TipText>
        </FooterTip>
      </Content>
    </Screen>
  );
}
