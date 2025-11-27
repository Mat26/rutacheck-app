import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform, Alert } from "react-native";
import { getEntriesOfMonth } from "@features/inspection/usecases/getMonthlyReport";
import { getProfile } from "@features/profile/services/profileStorage";
import { buildMonthlyHtml } from "./templates";

export async function generateMonthlyPdf(month: string) {
  const rows = await getEntriesOfMonth(month);
  if (rows.length === 0) throw new Error("No hay datos guardados para este mes.");
  const profile = await getProfile();
  
  const html = buildMonthlyHtml(month, rows, profile);

  if (Platform.OS === "web") {
    const w = window.open("", "_blank");
    if (!w) { Alert.alert("Generar PDF", "El navegador bloqueó la ventana emergente."); return null; }
    w.document.open(); w.document.write(html); w.document.close();
    setTimeout(() => { w.focus(); w.print(); w.close(); }, 100);
    return null;
  }

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  } else {
    Alert.alert("PDF generado", `Archivo en: ${uri}`);
  }
  return uri;
}
