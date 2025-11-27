import { useCallback, useState } from "react";
import { Text, StyleSheet, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Screen from "@shared/components/Screen";
import Button from "@shared/components/Button";
import { todayLocalISO, monthLocalISO } from "@shared/utils/date";
import { getByDate } from "@features/inspection/services/inspectionStorage";
import { generateMonthlyPdf } from "@shared/services/pdf/monthlyPdf";

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

  const handleGeneratePdf = async () => {
    const month = monthLocalISO(); // ⬅️ local YYYY-MM
    try {
      await generateMonthlyPdf(month);
    } catch (e: any) {
      Alert.alert("Generar PDF", e?.message || "No se pudo generar el PDF.");
    }
  };

  return (
    <Screen style={styles.center}>
      <Text style={styles.title}>RutaCheck</Text>

      <Button
        title={hasToday ? "Actualizar formulario de hoy" : "Llenar formulario de hoy"}
        onPress={goToForm}
        variant="primary"
      />
      <Button title="Datos del vehículo y conductor" onPress={() => router.push("/profile")} />
      <Button title="Ver info guardada" onPress={() => router.push("/saved")} variant="secondary" />
      <Button title="Generar PDF (mes actual)" onPress={handleGeneratePdf} variant="success" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: "center", alignItems: "center", gap: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
});
