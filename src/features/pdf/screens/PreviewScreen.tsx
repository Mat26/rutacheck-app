import { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform, Alert } from "react-native";
import Screen from "@shared/components/Screen";
import Button from "@shared/components/Button";
import { monthLocalISO } from "@shared/utils/date";
import { getEntriesOfMonth } from "@features/inspection/usecases/getMonthlyReport"; // o tu helper actual
import { getProfile } from "@features/profile/services/profileStorage";
import { buildMonthlyHtml } from "@shared/services/pdf/templates";
import { generateMonthlyPdf } from "@shared/services/pdf/monthlyPdf";

export default function PreviewScreen() {
  const [month, setMonth] = useState(monthLocalISO());
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Si luego agregas un selector de mes, solo actualiza `month` y se recalcula.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [rows, profile] = await Promise.all([
          getEntriesOfMonth(month),
          getProfile(),
        ]);
        const built = buildMonthlyHtml(month, rows, profile ?? null);
        if (alive) setHtml(built);
      } catch (e: any) {
        Alert.alert("Vista previa", e?.message || "No fue posible construir la vista previa.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [month]);

  const onGenerate = async () => {
    try {
      await generateMonthlyPdf(month);
    } catch (e: any) {
      Alert.alert("PDF", e?.message || "No se pudo generar el PDF.");
    }
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Vista previa del PDF — {month}</Text>

      {/* Si más adelante quieres selector, ponlo aquí (picker/DatePicker para mes) */}

      <View style={styles.previewBox}>
        {loading || !html ? (
          <ActivityIndicator />
        ) : (
          <HtmlPreview html={html} />
        )}
      </View>

      <View style={styles.actions}>
        <Button title="Generar PDF" onPress={onGenerate} variant="success" />
      </View>
    </Screen>
  );
}

/** Renderiza HTML tanto en nativo (WebView) como en web (iframe con srcDoc) */
function HtmlPreview({ html }: { html: string }) {
  if (Platform.OS === "web") {
    return (
      <iframe
        title="preview"
        srcDoc={html}
        style={{ width: "100%", height: "100%", borderWidth: 0 }}
      />
    );
  }
  const { WebView } = require("react-native-webview");
  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      style={{ flex: 1 }}
      // mejora nitidez/scroll
      scalesPageToFit
      startInLoadingState
      mixedContentMode="always"
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 18, fontWeight: "700" },
  previewBox: {
    flex: 1,
    minHeight: 360,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  actions: { marginTop: 12, gap: 8 },
});
