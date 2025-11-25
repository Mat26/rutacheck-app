import { useEffect, useState } from "react";
import { Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import Screen from "@shared/components/Screen";
import Button from "@shared/components/Button";
import BoolField from "../components/BoolField";
import KmInput from "../components/KmInput";
import { getByDate } from "../services/inspectionStorage";
import { upsertInspection } from "../usecases/upsertEntry";
import { todayLocalISO } from "@shared/utils/date";

export default function FormScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const date = params.date ?? todayLocalISO();

  const [loading, setLoading] = useState(true);
  const [pitoReversa, setPitoReversa] = useState(false);
  const [timon, setTimon] = useState(false);
  const [cinturon, setCinturon] = useState(false);
  const [martillos, setMartillos] = useState(false);
  const [kilometraje, setKilometraje] = useState("");

  useEffect(() => {
    (async () => {
      const existing = await getByDate(date);
      if (existing) {
        setPitoReversa(existing.pitoReversa);
        setTimon(existing.timon);
        setCinturon(existing.cinturones);
        setMartillos(existing.martillos);
        setKilometraje(String(existing.kilometraje));
      }
      setLoading(false);
    })();
  }, [date]);

  const handleGuardar = async () => {
    const kmNum = Number(kilometraje);
    if (!kilometraje || Number.isNaN(kmNum) || kmNum < 0) {
      alert("Ingresa un kilometraje válido.");
      return;
    }
    await upsertInspection(date, {
      pitoReversa, timon, cinturones: cinturon, martillos, kilometraje: kmNum,
    });
    router.replace("/"); // volver a inicio
  };

  if (loading) return <Screen />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Formulario del día</Text>
      <Text style={styles.subtitle}>{date}</Text>

      <Pressable style={styles.card}>
        <Text style={styles.sectionTitle}>Interior Vehiculo</Text>

        <BoolField label="Pito reversa" value={pitoReversa} onChange={setPitoReversa} />
        <BoolField label="Timón" value={timon} onChange={setTimon} />
        <BoolField label="Cinturón en cada puesto" value={cinturon} onChange={setCinturon} />
        <BoolField label="Presencia de martillos" value={martillos} onChange={setMartillos} />

        <KmInput value={kilometraje} onChange={setKilometraje} />

        <Button title="Guardar" onPress={handleGuardar} />
      </Pressable>

      <Button title="← Regresar" onPress={() => router.back()} variant="secondary" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 16, color: "#4b5563" },
  card: { marginTop: 12, padding: 16, backgroundColor: "#f3f4f6", borderRadius: 12, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
});
