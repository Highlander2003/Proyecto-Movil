import React from 'react';
import styled from 'styled-components/native';

const Base = styled.TouchableOpacity`
  height: ${({ theme }) => theme.button.height}px;
  border-radius: ${({ theme }) => theme.radius}px;
  padding: 0 ${({ theme }) => theme.button.paddingH}px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

const Primary = styled(Base)`
  background-color: ${({ theme }) => theme.colors.accent};
`;

const Ghost = styled(Base)`
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Danger = styled(Base)`
  background-color: ${({ theme }) => theme.colors.danger};
`;

const Label = styled.Text`
  color: ${({ theme, variant }) => (variant === 'ghost' ? theme.colors.text : '#00110d')};
  font-weight: 700;
`;

export default function Button({ title, onPress, style, variant = 'primary', left }) {
  const Comp = variant === 'ghost' ? Ghost : variant === 'danger' ? Danger : Primary;
  return (
    <Comp onPress={onPress} style={style} accessibilityRole="button">
      {left ? <>{left}</> : null}
      <Label variant={variant} style={{ marginLeft: left ? 8 : 0 }}>{title}</Label>
    </Comp>
  );
}
