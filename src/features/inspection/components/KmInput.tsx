import { TextInput, StyleSheet, View, Text } from "react-native";

type Props = {
  label?: string;
  value: string;
  onChange: (t: string) => void;
};

export default function KmInput({ label = "Kilometraje", value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^\d]/g, ""))}
        keyboardType="number-pad"
        inputMode="numeric"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  label: { fontSize: 16, flex: 1 },
  input: {
    width: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    textAlign: "right",
    fontSize: 16,
  },
});
