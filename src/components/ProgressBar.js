import React from 'react';
import styled from 'styled-components/native';

const Wrap = styled.View`
  height: 8px;
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.surfaceAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const Fill = styled.View`
  height: 100%;
  background-color: ${({ theme }) => theme.colors.accent};
`;

export default function ProgressBar({ value = 0 }) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <Wrap>
      <Fill style={{ width: `${clamped * 100}%` }} />
    </Wrap>
  );
}
