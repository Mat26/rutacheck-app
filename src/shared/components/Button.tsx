import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "success" | "danger";
  style?: ViewStyle;
};

const colors: Record<NonNullable<Props["variant"]>, string> = {
  primary: "#2563eb",
  secondary: "#111827",
  success: "#059669",
  danger: "#ef4444",
};

export default function Button({ title, onPress, variant = "primary", style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.base, { backgroundColor: colors[variant] }, pressed && { opacity: 0.9 }, style]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  text: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
