import { View, Text, StyleSheet, Switch } from "react-native";

type Props = {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
};

export default function BoolField({ label, value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.switchWrap}>
        <Text style={[styles.badge, value ? styles.ok : styles.nok]}>
          {value ? "Si cumple" : "No cumple"}
        </Text>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: "#ef4444", true: "#22c55e" }}
          thumbColor={"#ffffff"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  label: { fontSize: 16, flex: 1 },
  switchWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, fontSize: 12, fontWeight: "700", color: "#fff" },
  ok: { backgroundColor: "#22c55e" },
  nok: { backgroundColor: "#ef4444" },
});
