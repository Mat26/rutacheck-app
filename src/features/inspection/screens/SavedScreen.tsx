import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import Screen from "@shared/components/Screen";
import Button from "@shared/components/Button";
import { getAll, clearAll } from "../services/inspectionStorage";
import { InspectionEntry } from "../types/InspectionEntry";
import { router } from "expo-router";

export default function SavedScreen() {
  const [items, setItems] = useState<InspectionEntry[]>([]);

  const load = async () => setItems(await getAll());
  useEffect(() => { load(); }, []);

  return (
    <Screen>
      <Text style={styles.title}>Información guardada</Text>

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Row k="Fecha" v={item.date} />
            <Row k="Pito reversa" v={item.pitoReversa ? "Sí" : "No"} />
            <Row k="Timón" v={item.timon ? "Sí" : "No"} />
            <Row k="Cinturones" v={item.cinturones ? "Sí" : "No"} />
            <Row k="Martillos" v={item.martillos ? "Sí" : "No"} />
            <Row k="Kilometraje" v={String(item.kilometraje)} />
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: "#6b7280" }}>No hay data guardada hasta el momento.</Text>}
      />

      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
        <Button title="← Volver" onPress={() => router.back()} variant="secondary" />
        <Button title="Borrar todo" onPress={async () => { await clearAll(); await load(); }} variant="danger" />
      </View>
    </Screen>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <Text style={styles.row}><Text style={styles.k}>{k}:</Text> {v}</Text>;
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  card: { padding: 12, backgroundColor: "#f3f4f6", borderRadius: 12 },
  row: { marginBottom: 4, fontSize: 16 },
  k: { fontWeight: "700" },
});
