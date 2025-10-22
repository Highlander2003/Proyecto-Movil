import React from 'react';
import styled from 'styled-components/native';

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 14px 12px;
`;
const Left = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;
const IconWrap = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;
const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;
const Sub = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;
const Texts = styled.View``;

export default function ListItem({ icon, title, subtitle, right }) {
  return (
    <Row>
      <Left>
        <IconWrap>{icon}</IconWrap>
        <Texts>
          <Title>{title}</Title>
          {subtitle ? <Sub>{subtitle}</Sub> : null}
        </Texts>
      </Left>
      {right}
    </Row>
  );
}
