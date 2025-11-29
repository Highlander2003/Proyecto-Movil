import React, { useState } from 'react';
import styled from 'styled-components/native';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 20px;
`;

const Header = styled.Text`
  font-size: 24px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: 20px;
`;

const ChatBox = styled.ScrollView`
  flex: 1;
  margin-bottom: 10px;
`;

const Message = styled.View`
  background-color: ${({ isUser, theme }) =>
    isUser ? '#00bfa5' : '#d9faefff'};
  align-self: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  padding: 12px;
  border-radius: 12px;
  margin-vertical: 6px;
  max-width: 85%;
`;

const MessageText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  font-weight: 500;
`;

const InputContainer = styled.View`
  flex-direction: row;
  gap: 10px;
  align-items: center;
  margin-top: 5px;
`;

const Input = styled.TextInput`
  flex: 1;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 12px;
  border-radius: 10px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
`;

const SendButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 12px;
  border-radius: 10px;
`;

const SendButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.card};
  font-weight: bold;
`;

export default function MicrohabitScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const responses = [
  `🌱 *Microhábito recomendado:* Cada mañana escribe 1 sola tarea importante del día. Te dará claridad y enfoque 💡`,
  `⏳ *Pequeño hábito poderoso:* Dedica 5 minutos al día a ordenar tu espacio. Un entorno limpio ayuda a la mente.`,
  `📵 Si quieres mejorar tu concentración: pon el celular en otra habitación durante 20 minutos. Empieza corto y crece.`,
  `🧠 Nueva rutina: Antes de dormir, escribe 3 cosas que agradeces. Fortalece tu motivación y tu energía emocional ✨`,
  `🔥 Método rápido: 10 minutos diarios de lectura en lugar de redes sociales. Pequeño cambio, gran impacto 📚`,
  `💧 *Hábitos físicos influyen:* Toma 1 vaso de agua al despertar. Activa tu metabolismo y claridad mental.`,
  `🪫 Si estás sin energía: prueba micro descansos. Cada 45 min, respira profundo por 30 segundos.`,
  `📅 *Constancia real:* No busques hacer 10 hábitos al inicio. Enfócate en uno solo durante 7 días.`,

  // ⬇⬇⬇ NUEVOS 10 ⬇⬇⬇
  `🥗 Microhábito nutritivo: agrega una fruta al día a tu alimentación. No necesitas cambiarlo todo para empezar saludable.`,
  `🚶‍♂️ Movimiento mínimo: camina 5 minutos después de cada comida para mejorar digestión y energía.`,
  `🎯 Enfócate: antes de abrir redes, pregúntate “¿esto me acerca a lo que quiero hoy?” Esa pausa cambia decisiones.`,
  `🌙 Noche eficiente: deja lista tu ropa para mañana. Reduce estrés y toma de decisiones al despertar.`,
  `📖 Crecimiento personal: escucha 1 podcast inspirador por día mientras te arreglas o cocinas.`,
  `💬 Autoapoyo: reemplaza una frase negativa diaria por una frase de amor propio. Reprogramación suave y constante.`,
  `📚 1 página al día: si no tienes tiempo para leer, lee solo una página. Lo importante es la continuidad, no el tamaño.`,
  `😌 Micro desconexión: 2 minutos de respiración profunda cuando te sientas saturado. Tu sistema nervioso te lo agradecerá.`,
  `🛌 Dormir mejor: apaga pantallas 15 minutos antes de dormir. Ese pequeño hábito mejora tu descanso significativamente.`,
  `🔁 Sistema ganador: anota cada microhábito cumplido en un calendario. Visualizar tu progreso alimenta tu constancia 📆`,
];


  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { from: 'user', text: input }]);
    setInput('');

    setTimeout(() => {
      const reply =
        responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: 'Pensando 🤔...' },
      ]);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { from: 'bot', text: reply },
        ]);
      }, 1300);
    }, 500);
  };

  return (
    <Container>
      <Header>🤖 Coach de Microhábitos</Header>

      <ChatBox>
        {messages.map((msg, index) => (
          <Message key={index} isUser={msg.from === 'user'}>
            <MessageText>{msg.text}</MessageText>
          </Message>
        ))}
      </ChatBox>

      <InputContainer>
        <Input
          placeholder="Escribe tu pregunta..."
          value={input}
          onChangeText={setInput}
          placeholderTextColor="#999"
        />
        <SendButton onPress={sendMessage}>
          <SendButtonText>Enviar</SendButtonText>
        </SendButton>
      </InputContainer>
    </Container>
  );
}
