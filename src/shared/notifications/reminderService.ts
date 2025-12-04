import { Platform } from "react-native";
import type * as NotificationsTypes from "expo-notifications";

// Llama esto SOLO en móvil desde un useEffect del root
export async function configureNotifications() {
  if (Platform.OS === "web") return;
  const Notifications = await import("expo-notifications");
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// Pedir permisos si hace falta (exportado)
export async function requestPermissionsIfNeeded(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const Notifications = await import("expo-notifications");

  const settings = await Notifications.getPermissionsAsync();
  const granted =
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

  if (granted) return true;

  const req = await Notifications.requestPermissionsAsync();
  return (
    !!req.granted ||
    req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  const Notifications = await import("expo-notifications");
  await Notifications.setNotificationChannelAsync("daily-reminder", {
    name: "Daily Reminder",
    importance: (await import("expo-notifications")).AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: (await import("expo-notifications")).AndroidNotificationVisibility.PUBLIC,
  });
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<string> {
  if (Platform.OS === "web") throw new Error("Notificaciones programadas solo en móvil.");
  await ensureAndroidChannel();
  const Notifications = await import("expo-notifications");
  const trigger: NotificationsTypes.DailyTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
  };
  return Notifications.scheduleNotificationAsync({
    content: { title: "RutaCheck", body: "Completa el formulario de hoy.", data: { route: "/form" } },
    trigger,
  });
}

export async function cancelReminder(id?: string) {
  if (!id || Platform.OS === "web") return;
  const Notifications = await import("expo-notifications");
  try { await Notifications.cancelScheduledNotificationAsync(id); } catch {}
}

export async function getAllScheduled() {
  if (Platform.OS === "web") return [];
  const Notifications = await import("expo-notifications");
  return Notifications.getAllScheduledNotificationsAsync();
}
