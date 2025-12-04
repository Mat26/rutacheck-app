import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useEffect } from "react";
import { initNotificationResponseListener, disposeNotificationResponseListener } from "@shared/notifications/setup";
import { configureNotifications } from "@/src/shared/notifications/reminderService";

export default function RootLayout() {
  const isWeb = Platform.OS === "web";

useEffect(() => {
  if (Platform.OS !== "web") {
    configureNotifications();
    initNotificationResponseListener();
  }
  return () => disposeNotificationResponseListener();
}, []);

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleAlign: "center",
        headerShown: true,               
        headerBackVisible: !isWeb,         
      }}
    >
      {/* El grupo de tabs (Inicio) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Rutas fuera de tabs */}
      <Stack.Screen name="form/index"  options={{ title: "Formulario" }} />
      <Stack.Screen name="saved/index" options={{ title: "Info guardada" }} />
      <Stack.Screen name="profile/index" options={{ title: "Datos del vehículo" }} />
      <Stack.Screen name="preview/index" options={{ title: "Vista previa del PDF" }} />
      <Stack.Screen name="reminder/index" options={{ title: "Recordatorio diario" }} />
    </Stack>
  );
}
