import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";

type Variant = "primary" | "secondary" | "success" | "danger" | "ghost"; // ⬅️ agrega ghost

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  style?: ViewStyle;
  disabled?: boolean;
};

export default function Button({ title, onPress, variant = "primary", style, disabled }: Props) {
  const vs = variantStyles[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        vs.button,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, vs.text]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
  },
  text: { fontWeight: "700" },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
});

const variantStyles = {
  primary: {
    button: { backgroundColor: "#2563eb" },
    text: { color: "#fff" },
  },
  secondary: {
    button: { backgroundColor: "#e5e7eb" },
    text: { color: "#111827" },
  },
  success: {
    button: { backgroundColor: "#16a34a" },
    text: { color: "#fff" },
  },
  danger: {
    button: { backgroundColor: "#dc2626" },
    text: { color: "#fff" },
  },
  ghost: { // ⬅️ nuevo estilo
    button: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: "#e5e7eb",
    },
    text: { color: "#374151" },
  },
} as const;
