import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useAuthStore } from '../../store/auth';

// Pantalla de Registro
// - Usa el store de auth (Zustand) para register(email, password, name)
// - Muestra estado de carga y errores básicos desde el store
// - Validación mínima: password >= 6 y email presente
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
const ErrorText = styled.Text`
  color: #ef4444;
  margin-bottom: 8px;
`;

export default function RegisterScreen() {
  const theme = useTheme();
  // Acción de registro y estados de proceso/errores del store
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  // Estado local controlado para los campos del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Maneja el intento de registro con validación mínima
  const onRegister = async () => {
    if (!email || !password || password.length < 6) return;
    await register(email, password, name);
  };

  return (
    <Container>
      <Title>Crear cuenta</Title>
      {/* Mensaje de error controlado por el store de auth */}
      {error ? <ErrorText>{error}</ErrorText> : null}
      {/* Nombre opcional para el perfil (displayName) */}
      <Input value={name} onChangeText={setName} placeholder="Nombre" placeholderTextColor={theme.colors.textMuted} />
      {/* Email: teclado específico y sin auto-capitalización */}
      <Input value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={theme.colors.textMuted} autoCapitalize="none" keyboardType="email-address" />
      {/* Contraseña: entrada segura, con indicación de longitud mínima */}
      <Input value={password} onChangeText={setPassword} placeholder="Contraseña (mín. 6)" placeholderTextColor={theme.colors.textMuted} secureTextEntry />
      {/* Botón deshabilitado mientras carga o si la validación falla */}
      <Button onPress={onRegister} disabled={loading || !email || password.length < 6} accessibilityLabel="Registrarse">
        <ButtonText>{loading ? 'Creando…' : 'Registrarse'}</ButtonText>
      </Button>
    </Container>
  );
}
