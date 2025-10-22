import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Configura el sistema de notificaciones locales de la app.
 * - Define el handler para mostrar alertas mientras la app está en foreground.
 * - En Android crea el canal por defecto (requisito del sistema).
 * - Solicita permisos si aún no fueron concedidos.
 *
 * Retorna true si la app tiene permisos para enviar notificaciones.
 * Nota: En Web el soporte es limitado y puede devolver concedido pero no mostrar notificaciones.
 */
export async function configureNotifications() {
  // Handler básico: permite alertas y sonido cuando la app está abierta
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Android requiere declarar un canal antes de mostrar notificaciones
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  // Estado de permisos actual
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  // Solicita permisos si no están concedidos
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

/**
 * Programa una notificación local para la siguiente ocurrencia de `hour:minute`.
 * Ejemplo: si ahora son 19:30 y defines hour=8, minute=0, se programa para mañana a las 08:00.
 *
 * @param {{ title: string, body: string, hour?: number, minute?: number }} params
 * @returns {Promise<string>} id de la notificación programada
 */
export async function scheduleLocalNotification({ title, body, hour = 8, minute = 0 }) {
  // Calcula la próxima fecha a la hora/minuto indicados
  const now = new Date();
  const date = new Date(now);
  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);
  // Si ya pasó la hora de hoy, programar para mañana
  if (date <= now) {
    date.setDate(date.getDate() + 1);
  }
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { date },
  });
}

