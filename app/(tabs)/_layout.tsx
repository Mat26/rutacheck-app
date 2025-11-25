import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarAccessibilityLabel: "tab-home",
        }}
      />
      {/* Ejemplo para futuro:
      <Tabs.Screen name="explore" options={{ title: "Explorar" }} />
      */}
    </Tabs>
  );
}
