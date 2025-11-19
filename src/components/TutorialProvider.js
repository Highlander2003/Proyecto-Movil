import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import styled from 'styled-components/native';

const TutorialContext = createContext(null);

// Ejemplo de pasos por defecto (se pueden sobreescribir al iniciar)
const defaultSteps = [
  { id: 'welcome', title: 'Bienvenido a SmartSteps', text: 'Te mostraremos las funciones principales: progreso, recordatorios y perfil.' },
  { id: 'progress', title: 'Tu progreso', text: 'Aquí verás tu racha y el gráfico semanal.' },
  { id: 'reminders_filters', title: 'Filtros', text: 'Abre los filtros para ver y ajustar recordatorios.' },
  { id: 'profile_header', title: 'Perfil', text: 'Personaliza tu nombre y ajustes desde aquí.' },
];

const Overlay = styled.View`
  position: absolute; left: 0; right: 0; top: 0; bottom: 0; background-color: rgba(0,0,0,0.45); justify-content: center; align-items: center;
`;
const Bubble = styled.View`
  max-width: 340px; background-color: ${({ theme }) => theme.colors.surface}; padding: 14px; border-radius: 12px; border: 1px solid ${({ theme }) => theme.colors.border};
`;
const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text}; font-weight: 800; margin-bottom: 6px; font-size: 16px;
`;
const Body = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted}; font-size: 14px; margin-bottom: 8px;
`;

export function TutorialProvider({ children }) {
  const targets = useRef({}); // id -> ref
  const [visible, setVisible] = useState(false);
  const [steps, setSteps] = useState(defaultSteps);
  const [index, setIndex] = useState(0);
  const [measure, setMeasure] = useState(null);

  const register = useCallback((id, ref) => {
    if (!id) return;
    targets.current[id] = ref;
  }, []);
  const unregister = useCallback((id) => {
    delete targets.current[id];
  }, []);

  const start = useCallback((customSteps) => {
    setSteps(customSteps || defaultSteps);
    setIndex(0);
    setVisible(true);
  }, []);

  const end = useCallback(() => {
    setVisible(false);
  }, []);

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);
  const prev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    // intentar medir el target del step actual
    const step = steps[index];
    if (!step) return setMeasure(null);
    const t = targets.current[step.id];
    if (t && t.current && typeof t.current.measureInWindow === 'function') {
      try {
        t.current.measureInWindow((x, y, w, h) => {
          setMeasure({ x, y, w, h });
        });
      } catch (e) {
        setMeasure(null);
      }
    } else {
      setMeasure(null);
    }
  }, [index, steps]);

  return (
    <TutorialContext.Provider value={{ register, unregister, start, end, next, prev, visible, steps, index }}>
      {children}

      <Modal transparent visible={visible} animationType="fade" onRequestClose={end}>
        <Overlay>
          {/* Si existe measure, posicionar el bubble encima, si no centrar */}
          {measure ? (
            <View style={{ position: 'absolute', left: Math.max(8, measure.x), top: Math.max(8, measure.y - 120), width: Math.min(Dimensions.get('window').width - 16, 340) }}>
              <Bubble>
                <Title>{steps[index]?.title}</Title>
                <Body>{steps[index]?.text}</Body>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                  <TouchableOpacity onPress={prev} style={{ marginRight: 8 }}>
                    <Text style={{ color: '#9aa4b2' }}>Atrás</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={next} style={{ marginRight: 8 }}>
                    <Text style={{ fontWeight: '700' }}>{index === steps.length - 1 ? 'Finalizar' : 'Siguiente'}</Text>
                  </TouchableOpacity>
                </View>
              </Bubble>
            </View>
          ) : (
            <Bubble>
              <Title>{steps[index]?.title}</Title>
              <Body>{steps[index]?.text}</Body>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                <TouchableOpacity onPress={prev} style={{ marginRight: 8 }}>
                  <Text style={{ color: '#9aa4b2' }}>Atrás</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { if (index === steps.length - 1) end(); else next(); }}>
                  <Text style={{ fontWeight: '700' }}>{index === steps.length - 1 ? 'Finalizar' : 'Siguiente'}</Text>
                </TouchableOpacity>
              </View>
            </Bubble>
          )}
        </Overlay>
      </Modal>
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorial must be used within TutorialProvider');
  return ctx;
}

// Hook para registrar un target fácilmente
export function useTutorialTarget(id) {
  const ref = useRef(null);
  const { register, unregister } = useTutorial();
  useEffect(() => {
    register(id, ref);
    return () => unregister(id);
  }, [id, register, unregister]);
  return ref;
}

export default TutorialProvider;
