import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { useAuthStore } from '../../store/auth';

// Pantalla de Inicio de sesión:
// - Usa el store de auth (Zustand) para login(email, password)
// - Muestra estado de carga y errores del store
// - Validación mínima (password >= 6)
// - Estilos basados en el tema (theme.colors.*)
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
const Link = styled.TouchableOpacity``;

const LinkText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 16px;
  text-align: center;
`;
const ErrorText = styled.Text`
  color: #ef4444;
  margin-bottom: 8px;
`;

export default function LoginScreen({ navigation }) {
  const theme = useTheme();
  // Acciones/estados del store de autenticación
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  // Estado local controlado para los inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Intento de login con validación mínima
  const onLogin = async () => {
    if (!email || !password || password.length < 6) return;
    await login(email, password);
  };

  return (
    <Container>
      <Title>Iniciar sesión</Title>
      {/* Mensaje de error desde el store de auth */}
      {error ? <ErrorText>{error}</ErrorText> : null}
      {/* Email: teclado de email y sin auto-capitalización */}
      <Input value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={theme.colors.textMuted} autoCapitalize="none" keyboardType="email-address" />
      {/* Contraseña: entrada segura */}
      <Input value={password} onChangeText={setPassword} placeholder="Contraseña" placeholderTextColor={theme.colors.textMuted} secureTextEntry />
      {/* Botón de envío: deshabilitado si está cargando o datos inválidos */}
      <Button onPress={onLogin} disabled={loading || !email || password.length < 6} accessibilityLabel="Entrar">
        <ButtonText>{loading ? 'Entrando…' : 'Entrar'}</ButtonText>
      </Button>
      {/* Navegación a pantalla de registro */}
      <Link onPress={() => navigation.navigate('Register')}>
        <LinkText>¿No tienes cuenta? Regístrate</LinkText>
      </Link>
    </Container>
  );
}
