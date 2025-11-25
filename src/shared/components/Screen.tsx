import { View, StyleSheet, ViewProps } from "react-native";

export default function Screen({ style, ...rest }: ViewProps) {
  return <View style={[styles.root, style]} {...rest} />;
}
const styles = StyleSheet.create({
  root: { flex: 1, padding: 24 },
});
