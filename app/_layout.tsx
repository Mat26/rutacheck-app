import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleAlign: "center",
      }}
    >
      {/* El grupo de tabs (Inicio) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Rutas fuera de tabs */}
      <Stack.Screen name="form/index"  options={{ title: "Formulario" }} />
      <Stack.Screen name="saved/index" options={{ title: "Info guardada" }} />
    </Stack>
  );
}
