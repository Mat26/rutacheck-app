import { useCallback, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Screen from "@shared/components/Screen";
import Button from "@shared/components/Button";
import { todayLocalISO } from "@shared/utils/date";
import { getByDate } from "@features/inspection/services/inspectionStorage";

export default function HomeScreen() {
  const [hasToday, setHasToday] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        const entry = await getByDate(todayLocalISO());
        if (mounted) setHasToday(!!entry);
      })();
      return () => { mounted = false; };
    }, [])
  );

  const goToForm = () => {
    const today = todayLocalISO();
    router.push({ pathname: "/form", params: { date: today } });
  };

  return (
    <Screen style={styles.center}>
      <Text style={styles.title}>RutaCheck</Text>

      <Button title="Datos del vehículo y conductor" onPress={() => router.push("/profile")} variant="success"/>
      <Button
        title={hasToday ? "Actualizar formulario de hoy" : "Llenar formulario de hoy"}
        onPress={goToForm}
        variant="primary"
      />
      <Button title="Vista previa del PDF" onPress={() => router.push("/preview")} variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: "center", alignItems: "center", gap: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
});
