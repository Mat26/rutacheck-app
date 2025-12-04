import { router } from "expo-router";
import { todayLocalISO } from "@shared/utils/date";
import { Platform } from "react-native";

// Mantén una referencia para poder desuscribir en hot reload
let sub: { remove: () => void } | null = null;

export async function initNotificationResponseListener() {
  if (Platform.OS === "web" || sub) return;
  const Notifications = await import("expo-notifications");
  sub = Notifications.addNotificationResponseReceivedListener((response) => {
    try {
      const data = response.notification.request.content.data as any;
      if (data?.route === "/form") {
        const today = todayLocalISO();
        router.push({ pathname: "/form", params: { date: today } });
      }
    } catch {
      // noop
    }
  });
}

export function disposeNotificationResponseListener() {
  if (sub) {
    sub.remove();
    sub = null;
  }
}
