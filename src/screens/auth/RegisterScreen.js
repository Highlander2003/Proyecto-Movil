import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useAuthStore } from '../../store/auth';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 24px;
  justify-content: center;
`;
const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
`;
const Input = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
`;
const Button = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.accent};
  padding: 14px;
  border-radius: 12px;
  align-items: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;
const ButtonText = styled.Text`
  color: #00110d;
  font-weight: 700;
`;
const ErrorText = styled.Text`
  color: #ef4444;
  margin-bottom: 8px;
`;

export default function RegisterScreen() {
  const theme = useTheme();
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = async () => {
    if (!email || !password || password.length < 6) return;
    await register(email, password, name);
  };

  return (
    <Container>
      <Title>Crear cuenta</Title>
      {error ? <ErrorText>{error}</ErrorText> : null}
      <Input value={name} onChangeText={setName} placeholder="Nombre" placeholderTextColor={theme.colors.textMuted} />
      <Input value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={theme.colors.textMuted} autoCapitalize="none" keyboardType="email-address" />
      <Input value={password} onChangeText={setPassword} placeholder="Contraseña (mín. 6)" placeholderTextColor={theme.colors.textMuted} secureTextEntry />
      <Button onPress={onRegister} disabled={loading || !email || password.length < 6} accessibilityLabel="Registrarse">
        <ButtonText>{loading ? 'Creando…' : 'Registrarse'}</ButtonText>
      </Button>
    </Container>
  );
}
