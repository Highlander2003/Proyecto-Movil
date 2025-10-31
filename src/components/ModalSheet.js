import React from 'react';
import { Modal } from 'react-native';
import styled from 'styled-components/native';

// Modal tipo "bottom sheet" simple
// Props:
// - visible: controla la visibilidad
// - onClose: callback al cerrar
// - children: contenido del sheet
// Notas:
// - Usa Modal nativo (iOS/Android)
// - El backdrop cierra el modal al presionarlo
const Root = styled.View`
  flex: 1;
  background-color: rgba(0,0,0,0.5);
  justify-content: flex-end;
`;
const BackdropTouch = styled.TouchableOpacity`
  flex: 1;
`;
const Sheet = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-top-left-radius: ${({ theme }) => theme.radius}px;
  border-top-right-radius: ${({ theme }) => theme.radius}px;
  padding: 16px;
  border-top-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;
const Handle = styled.View`
  width: 44px; height: 4px; border-radius: 2px; align-self: center; background-color: ${({ theme }) => theme.colors.border}; margin-bottom: 8px;
`;

export default function ModalSheet({ visible, onClose, children }) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Root>
        {/* Zona del backdrop: tocando fuera del sheet cierra el modal */}
        <BackdropTouch onPress={onClose} />
        {/* Sheet: las interacciones aquí NO deben cerrar el modal */}
        <Sheet>
          <Handle />
          {children}
        </Sheet>
      </Root>
    </Modal>
  );
}
