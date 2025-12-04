import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch, Platform, Alert } from "react-native";
import Button from "@shared/components/Button";
import Screen from "@shared/components/Screen";
import {
  getReminderSettings,
  saveReminderSettings,
  ReminderSettings,
} from "@features/reminder/services/reminderStorage";
import {
  requestPermissionsIfNeeded,
  scheduleDailyReminder,
  cancelReminder,
} from "@shared/notifications/reminderService";
import { todayLocalISO } from "@shared/utils/date";

/* ========= Helpers de hora ========= */
function nowDefault(): { hour: number; minute: number } {
  const d = new Date();
  return { hour: Math.min(23, d.getHours()), minute: 0 };
}
function pad(n: number) {
  return String(n).padStart(2, "0");
}
function formatTime(h: number, m: number) {
  return `${pad(h)}:${pad(m)}`;
}

/* ========= Pantalla ========= */
export default function ReminderScreen() {
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(nowDefault().hour);
  const [minute, setMinute] = useState(0);
  const [notificationId, setNotificationId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  // Control del diálogo nativo de hora
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Cargar settings guardados
  useEffect(() => {
    (async () => {
      const s = await getReminderSettings();
      if (s) {
        setEnabled(s.enabled);
        setHour(s.hour);
        setMinute(s.minute);
        setNotificationId(s.notificationId);
      }
      setLoading(false);
    })();
  }, []);

  /* ===== TimePicker cross-platform (controlado) ===== */
  const TimePicker = () => {
    if (Platform.OS === "web") {
      return (
        <input
          type="time"
          value={`${pad(hour)}:${pad(minute)}`}
          onChange={(e) => {
            const [h, m] = e.currentTarget.value.split(":").map(Number);
            setHour(h || 0);
            setMinute(m || 0);
          }}
          style={{
            padding: 10,
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            background: "#fff",
            width: 160,
          }}
        />
      );
    }

    // Nativo: mostramos un botón que abre el diálogo
    return (
      <>
        <Button
          title={formatTime(hour, minute)}
          onPress={() => setShowTimePicker(true)}
          variant="secondary"
        />
        {showTimePicker &&
          (() => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const RNDateTimePicker = require("@react-native-community/datetimepicker").default;
            const value = new Date();
            value.setHours(hour, minute, 0, 0);
            return (
              <RNDateTimePicker
                mode="time"
                value={value}
                is24Hour
                onChange={(event: any, d?: Date) => {
                  // Cerrar siempre el diálogo en Android (en iOS se maneja distinto)
                  if (Platform.OS === "android") setShowTimePicker(false);

                  // Solo aplicar cambios si el usuario confirma (OK)
                  if ((event?.type === "set" || Platform.OS === "ios") && d) {
                    setHour(d.getHours());
                    setMinute(d.getMinutes());
                  }
                }}
              />
            );
          })()}
      </>
    );
  };

  /* ===== Guardar programación ===== */
  const onSave = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Recordatorio",
        "Los recordatorios programados funcionan en la app móvil. En Web no se garantizan notificaciones a una hora exacta."
      );
    }

    // Si el diálogo está abierto, ciérralo antes de continuar
    if (showTimePicker) setShowTimePicker(false);

    // Snapshot de la hora seleccionada para asegurar consistencia
    const h = hour;
    const m = minute;

    if (!enabled) {
      await cancelReminder(notificationId);
      const s: ReminderSettings = {
        enabled: false,
        hour: h,
        minute: m,
        notificationId: undefined,
        updatedAt: Date.now(),
      };
      await saveReminderSettings(s);
      setNotificationId(undefined);
      Alert.alert("Recordatorio", "Recordatorio desactivado.");
      return;
    }

    const ok = await requestPermissionsIfNeeded();
    if (!ok) {
      Alert.alert("Permisos", "No se concedieron permisos para notificaciones.");
      return;
    }

    // Reprogramar limpiamente
    await cancelReminder(notificationId);
    const id = await scheduleDailyReminder(h, m);
    const s: ReminderSettings = {
      enabled: true,
      hour: h,
      minute: m,
      notificationId: id,
      updatedAt: Date.now(),
    };
    await saveReminderSettings(s);
    setNotificationId(id);

    Alert.alert("Recordatorio", `Programado diario a las ${formatTime(h, m)}.`);
  };

  /* ===== Enviar prueba inmediata (solo móvil) ===== */
  const onTest = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Prueba", "La prueba de notificación solo está disponible en la app móvil.");
      return;
    }
    await ensureImmediateTest();
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Recordatorio diario</Text>

      {loading ? null : (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Activar</Text>
            <View style={styles.rowRight}>
              {enabled && <Text style={styles.timeChip}>{formatTime(hour, minute)}</Text>}
              <Switch value={enabled} onValueChange={setEnabled} />
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Hora</Text>
            <TimePicker />
          </View>

          {/* Vista previa clara de la hora seleccionada */}
          <View style={styles.rowPreview}>
            <Text style={styles.previewLabel}>Seleccionada:</Text>
            <Text style={styles.timeNow}>{formatTime(hour, minute)}</Text>
          </View>

          <View style={styles.rowHint}>
            <Text style={styles.hint}>
              La notificación abrirá el formulario del día ({todayLocalISO()}).
            </Text>
          </View>

          <View style={styles.actions}>
            <Button title="Guardar" onPress={onSave} />
            <Button title="Enviar prueba" onPress={onTest} variant="secondary" />
          </View>
        </View>
      )}
    </Screen>
  );
}

/* ========= helper de prueba inmediata ========= */
async function ensureImmediateTest() {
  if (Platform.OS === "web") return;
  const Notifications = await import("expo-notifications");
  const { ensureAndroidChannel } = await import("@shared/notifications/reminderService");
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "RutaCheck (prueba)",
      body: "Esto es una notificación de prueba.",
      data: { route: "/form" },
    },
    trigger: null, // inmediata
  });
}

/* ========= estilos ========= */
const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  card: {
    marginTop: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#fff",
    gap: 14,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowHint: { marginTop: -4 },
  rowPreview: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontWeight: "600" },
  hint: { color: "#6b7280" },
  timeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#eef2ff",
    color: "#1f2937",
    fontWeight: "600",
  },
  previewLabel: { color: "#6b7280" },
  timeNow: { fontWeight: "700" },
  actions: { flexDirection: "row", gap: 12, justifyContent: "flex-end" },
});
