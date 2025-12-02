import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform, Alert } from "react-native";
import Screen from "@shared/components/Screen";
import Button from "@shared/components/Button";
import MonthSelector from "@features/pdf/components/MonthSelector";
import { currentMonthLocalISO, lastNMonths } from "@shared/utils/month";
import { getAvailableMonths } from "@features/inspection/usecases/getAvailableMonths";
import { getEntriesOfMonth } from "@features/inspection/usecases/getMonthlyReport";
import { useLocalSearchParams, router } from "expo-router";
import { getProfile } from "@features/profile/services/profileStorage";
import { buildMonthlyHtml } from "@shared/services/pdf/templates";
import { generateMonthlyPdf } from "@shared/services/pdf/monthlyPdf";

export default function PreviewScreen() {
  const params = useLocalSearchParams<{ month?: string }>();
  const initial = params.month ? String(params.month) : currentMonthLocalISO();

  const [month, setMonth] = useState(initial);
  const [options, setOptions] = useState<string[]>([]);
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  // cargar opciones
  useEffect(() => {
    (async () => {
      const fromData = await getAvailableMonths();
      const baseline = lastNMonths(12);
      const merged = Array.from(new Set([...fromData, ...baseline])).sort().reverse();
      setOptions(merged);
    })();
  }, []);

  useEffect(() => {
    const urlMonth = params.month ? String(params.month) : "";
    if (urlMonth && urlMonth !== month) setMonth(urlMonth);
  }, [params.month]);

    // construir preview
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [rows, profile] = await Promise.all([getEntriesOfMonth(month), getProfile()]);
      const built = buildMonthlyHtml(month, rows, profile ?? null);
      if (alive) setHtml(built);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [month]);

useEffect(() => {
  if (Platform.OS !== "web") return;
  const currentInUrl = params.month ? String(params.month) : "";
  if (currentInUrl !== month) {
    router.replace({ pathname: "/preview", params: { month } });
  }
}, [month, params.month]);

  const onGenerate = async () => {
    try {
      await generateMonthlyPdf(month);
    } catch (e: any) {
      Alert.alert("PDF", e?.message || "No se pudo generar el PDF.");
    }
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>PDF Preview</Text>

      <MonthSelector value={month} options={options.length ? options : [month]} onChange={setMonth} label="Month" />

      <View style={styles.previewBox}>
        {loading || !html ? <ActivityIndicator /> : <HtmlPreview html={html} />}
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
    // En web usamos un iframe con srcDoc
    return (
      <iframe
        title="preview"
        srcDoc={html}
        style={{ width: "100%", height: "100%", border: "0" }}
      />
    );
  }

  // En nativo, cargamos la WebView dinámicamente
  const WebView: React.ComponentType<any> =
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("react-native-webview").WebView;

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      style={{ flex: 1 }}
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
