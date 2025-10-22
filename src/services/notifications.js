import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function configureNotifications() {
  // Basic handler to show notifications when app is foregrounded
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function scheduleLocalNotification({ title, body, hour = 8, minute = 0 }) {
  // Schedule at next occurrence of hour:minute
  const now = new Date();
  const date = new Date(now);
  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);
  if (date <= now) {
    date.setDate(date.getDate() + 1);
  }
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { date },
  });
}
