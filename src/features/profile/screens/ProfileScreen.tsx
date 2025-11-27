import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert } from "react-native";
import Screen from "@shared/components/Screen";
import Button from "@shared/components/Button";
import { getProfile, saveProfile } from "@features/profile/services/profileStorage";

export default function ProfileScreen() {
  const [movil, setMovil] = useState("");
  const [placas, setPlacas] = useState("");
  const [conductorNombre, setConductorNombre] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      if (p) {
        setMovil(p.movil ?? "");
        setPlacas(p.placas ?? "");
        setConductorNombre(p.conductorNombre ?? "");
      }
      setLoading(false);
    })();
  }, []);

  const onSave = async () => {
    if (!movil.trim() || !placas.trim() || !conductorNombre.trim()) {
      Alert.alert("Datos requeridos", "Completa todos los campos.");
      return;
    }
    await saveProfile({ movil: movil.trim(), placas: placas.trim(), conductorNombre: conductorNombre.trim() });
    Alert.alert("Guardado", "Datos actualizados correctamente.");
  };

  if (loading) return <Screen />;

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Datos del vehículo y conductor</Text>

      <Field label="Móvil">
        <TextInput style={styles.input} value={movil} onChangeText={setMovil} />
      </Field>

      <Field label="Placas">
        <TextInput style={styles.input} value={placas} onChangeText={setPlacas} autoCapitalize="characters" />
      </Field>

      <Field label="Nombre del conductor">
        <TextInput style={styles.input} value={conductorNombre} onChangeText={setConductorNombre} />
      </Field>

      <Button title="Guardar" onPress={onSave} />
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  field: { gap: 6 },
  label: { fontWeight: "600" },
  input: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff",
  },
});
