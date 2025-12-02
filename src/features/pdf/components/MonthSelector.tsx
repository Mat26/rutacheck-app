import { Platform, View, Text, StyleSheet } from "react-native";
import { useMemo } from "react";
import { Picker } from "@react-native-picker/picker"; // nativo
// Para web, usaremos <select> nativo del navegador.

type Props = {
  value: string;                // "YYYY-MM"
  options: string[];            // lista de meses "YYYY-MM"
  onChange: (v: string) => void;
  label?: string;
};

export default function MonthSelector({ value, options, onChange, label = "Month" }: Props) {
  const items = useMemo(() => Array.from(new Set(options)), [options]);

  if (Platform.OS === "web") {
        const webSelectStyle: React.CSSProperties = {
        padding: 8,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        background: "#fff",
        };
    return (
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={webSelectStyle}
        >
          {items.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={value} onValueChange={(v) => onChange(String(v))}>
          {items.map((m) => <Picker.Item key={m} label={m} value={m} />)}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  label: { fontWeight: "600" },
  pickerBox: { flex: 1, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, overflow: "hidden" },
});
