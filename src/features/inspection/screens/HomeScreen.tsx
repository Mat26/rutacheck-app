import { useCallback, useState } from "react";
import { Text, StyleSheet, View, Platform } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Screen from "@shared/components/Screen";
import Button from "@shared/components/Button";
import { todayLocalISO, ymdToLocalDate, localDateToYmd } from "@shared/utils/date";
import { getByDate } from "@features/inspection/services/inspectionStorage";

export default function HomeScreen() {
  const [hasToday, setHasToday] = useState(false);

    // UI estado para editar otro día
  const [showPicker, setShowPicker] = useState(false);
  const [editingDate, setEditingDate] = useState(todayLocalISO());

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

  const goToFormToday  = () => {
    const today = todayLocalISO();
    router.push({ pathname: "/form", params: { date: today } });
  };

  const openFormForEditingDate = () => {
    router.push({ pathname: "/form", params: { date: editingDate } });
    setShowPicker(false);
  };

  return (
    <Screen style={styles.center}>
      <Text style={styles.title}>RutaCheck</Text>

      <Button
        title={hasToday ? "Actualizar formulario de hoy" : "Llenar formulario de hoy"}
        onPress={goToFormToday}
        variant="primary"
      />

      <Button
        title="Editar otro día"
        onPress={() => setShowPicker((v) => !v)}
        variant="secondary"
      />

      {showPicker && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Selecciona fecha</Text>

          {Platform.OS === "web" ? (
            // Web: input nativo
            <input
              type="date"
              value={editingDate}
              onChange={(e) => setEditingDate(e.currentTarget.value)}
              style={{
                padding: 10,
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                background: "#fff",
                width: 220,
              }}
            />
          ) : (
            // Nativo: DateTimePicker
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            (() => {
              const DateTimePicker = require("@react-native-community/datetimepicker").default;
              return (
                <DateTimePicker
                  mode="date"
                  value={ymdToLocalDate(editingDate)}
                  onChange={(_, d?: Date) => {
                    if (d) setEditingDate(localDateToYmd(d));
                  }}
                />
              );
            })()
          )}

          <View style={styles.row}>
            <Button title="Abrir formulario" onPress={openFormForEditingDate} />
            <Button title="Cancelar" onPress={() => setShowPicker(false)} variant="ghost" />
          </View>
        </View>
      )}

      <Button
        title="Datos del vehículo y conductor"
        onPress={() => router.push("/profile")}
      />

      <Button
        title="Vista previa del PDF"
        onPress={() => router.push("/preview")}
      />
      <Button
        title="Recordatorio diario"
        onPress={() => router.push("/reminder")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: "center", alignItems: "center", gap: 16, padding: 16 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },

  card: {
    width: "100%",
    maxWidth: 420,
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  row: { flexDirection: "row", gap: 12, marginTop: 8, alignSelf: "flex-end" },
});
