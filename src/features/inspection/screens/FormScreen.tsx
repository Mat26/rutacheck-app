import { useEffect, useState } from "react";
import { Text, StyleSheet, ScrollView, Pressable, TextInput, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import Screen from "@shared/components/Screen";
import Button from "@shared/components/Button";
import BoolField from "@features/inspection/components/BoolField";
import KmInput from "@features/inspection/components/KmInput";
import { getByDate } from "@features/inspection/services/inspectionStorage";
import { upsertInspection } from "@features/inspection/usecases/upsertEntry";
import { monthLocalISO, toLocalISO } from "@shared/utils/date";

export default function FormScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const date = params.date ? String(params.date) : toLocalISO(new Date());
  const month = monthLocalISO(new Date(date as string)); // YYYY-MM local

  const [loading, setLoading] = useState(true);

  // --- (lo que ya tenías) Interior Vehículo ---
  const [pitoReversa, setPitoReversa] = useState(false);
  const [timon, setTimon] = useState(false);
  const [cinturon, setCinturon] = useState(false);
  const [martillos, setMartillos] = useState(false);
  const [kilometraje, setKilometraje] = useState("");

  // --- Antes de la operación ---
  // Llantas
  const [llantasPresion, setLlantasPresion] = useState(false);
  const [llantasObjetos, setLlantasObjetos] = useState(false);
  const [llantasTuercas, setLlantasTuercas] = useState(false);
  // Fugas
  const [fugasMotor, setFugasMotor] = useState(false);
  const [fugasCaja, setFugasCaja] = useState(false);
  const [fugasDiferencial, setFugasDiferencial] = useState(false);
  const [fugasCombustible, setFugasCombustible] = useState(false);
  // Niveles y tapas
  const [nivelMotor, setNivelMotor] = useState(false);
  const [nivelRefrigerante, setNivelRefrigerante] = useState(false);
  const [nivelHidraulico, setNivelHidraulico] = useState(false);
  const [nivelFrenosEmbrague, setNivelFrenosEmbrague] = useState(false);
  // Filtros
  const [filtrosEstado, setFiltrosEstado] = useState(false);
  const [filtrosFugas, setFiltrosFugas] = useState(false);
  // Baterías
  const [bateriasBornes, setBateriasBornes] = useState(false);
  const [bateriasEstado, setBateriasEstado] = useState(false);
  // Correas
  const [correasEstado, setCorreasEstado] = useState(false);
  const [correasTension, setCorreasTension] = useState(false);
  // Revisión interna
  const [revAseo, setRevAseo] = useState(false);
  const [revLucesAltas, setRevLucesAltas] = useState(false);
  const [revLucesBajas, setRevLucesBajas] = useState(false);
  const [revCocuyos, setRevCocuyos] = useState(false);
  const [revLuzBlanca, setRevLuzBlanca] = useState(false);

  useEffect(() => {
    (async () => {
      const existing = await getByDate(date);
      if (existing) {
        // Llantas
        setLlantasPresion(!!existing.llantasPresion);
        setLlantasObjetos(!!existing.llantasObjetos);
        setLlantasTuercas(!!existing.llantasTuercas);
        // Fugas
        setFugasMotor(!!existing.fugasMotor);
        setFugasCaja(!!existing.fugasCaja);
        setFugasDiferencial(!!existing.fugasDiferencial);
        setFugasCombustible(!!existing.fugasCombustible);
        // Niveles
        setNivelMotor(!!existing.nivelMotor);
        setNivelRefrigerante(!!existing.nivelRefrigerante);
        setNivelHidraulico(!!existing.nivelHidraulico);
        setNivelFrenosEmbrague(!!existing.nivelFrenosEmbrague);
        // Filtros
        setFiltrosEstado(!!existing.filtrosEstado);
        setFiltrosFugas(!!existing.filtrosFugas);
        // Baterías
        setBateriasBornes(!!existing.bateriasBornes);
        setBateriasEstado(!!existing.bateriasEstado);
        // Correas
        setCorreasEstado(!!existing.correasEstado);
        setCorreasTension(!!existing.correasTension);
        // Revisión interna
        setRevAseo(!!existing.revAseo);
        setRevLucesAltas(!!existing.revLucesAltas);
        setRevLucesBajas(!!existing.revLucesBajas);
        setRevCocuyos(!!existing.revCocuyos);
        setRevLuzBlanca(!!existing.revLuzBlanca);
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
      month, // <- se guarda mes local YYYY-MM

      // Llantas
      llantasPresion, llantasObjetos, llantasTuercas,
      // Fugas
      fugasMotor, fugasCaja, fugasDiferencial, fugasCombustible,
      // Niveles
      nivelMotor, nivelRefrigerante, nivelHidraulico, nivelFrenosEmbrague,
      // Filtros
      filtrosEstado, filtrosFugas,
      // Baterías
      bateriasBornes, bateriasEstado,
      // Correas
      correasEstado, correasTension,
      // Revisión interna
      revAseo, revLucesAltas, revLucesBajas, revCocuyos, revLuzBlanca,
    });

    router.replace("/"); // volver a inicio
  };

  if (loading) return <Screen />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Formulario del día</Text>
      <Text style={styles.subtitle}>{toLocalISO(new Date(date))}</Text>

      {/* Antes de la operación */}
      <Pressable style={styles.card}>
        <Text style={styles.sectionTitle}>Antes de la operación</Text>

        <Text style={styles.groupTitle}>Llantas</Text>
        <BoolField label="Presión de aire" value={llantasPresion} onChange={setLlantasPresion} />
        <BoolField label="Objetos incrustados" value={llantasObjetos} onChange={setLlantasObjetos} />
        <BoolField label="Estado de tuercas (completas y ajustadas)" value={llantasTuercas} onChange={setLlantasTuercas} />

        <Text style={styles.groupTitle}>Fugas</Text>
        <BoolField label="Motor" value={fugasMotor} onChange={setFugasMotor} />
        <BoolField label="Caja" value={fugasCaja} onChange={setFugasCaja} />
        <BoolField label="Diferencial" value={fugasDiferencial} onChange={setFugasDiferencial} />
        <BoolField label="Combustible" value={fugasCombustible} onChange={setFugasCombustible} />

        <Text style={styles.groupTitle}>Niveles y tapas</Text>
        <BoolField label="Motor" value={nivelMotor} onChange={setNivelMotor} />
        <BoolField label="Agua o refrigerante" value={nivelRefrigerante} onChange={setNivelRefrigerante} />
        <BoolField label="Hidráulico" value={nivelHidraulico} onChange={setNivelHidraulico} />
        <BoolField label="Líquido de frenos o embrague" value={nivelFrenosEmbrague} onChange={setNivelFrenosEmbrague} />

        <Text style={styles.groupTitle}>Filtros</Text>
        <BoolField label="Estado" value={filtrosEstado} onChange={setFiltrosEstado} />
        <BoolField label="Fugas" value={filtrosFugas} onChange={setFiltrosFugas} />

        <Text style={styles.groupTitle}>Baterías</Text>
        <BoolField label="Bornes" value={bateriasBornes} onChange={setBateriasBornes} />
        <BoolField label="Estado general" value={bateriasEstado} onChange={setBateriasEstado} />

        <Text style={styles.groupTitle}>Correas</Text>
        <BoolField label="Estado" value={correasEstado} onChange={setCorreasEstado} />
        <BoolField label="Tensión" value={correasTension} onChange={setCorreasTension} />

        <Text style={styles.groupTitle}>Revisión interna</Text>
        <BoolField label="Aseo" value={revAseo} onChange={setRevAseo} />
        <BoolField label="Luces altas" value={revLucesAltas} onChange={setRevLucesAltas} />
        <BoolField label="Luces bajas" value={revLucesBajas} onChange={setRevLucesBajas} />
        <BoolField label="Cocuyos" value={revCocuyos} onChange={setRevCocuyos} />
        <BoolField label="Luz blanca" value={revLuzBlanca} onChange={setRevLuzBlanca} />
      </Pressable>

      <Button title="Guardar" onPress={handleGuardar} />
      <Button title="← Regresar" onPress={() => router.back()} variant="secondary" />
    </ScrollView>
  );
}

/** Input simple con etiqueta (evita crear archivo nuevo por ahora) */
function LabeledInput({
  label,
  value,
  onChangeText,
  editable = true,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  editable?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && { backgroundColor: "#f3f4f6", color: "#6b7280" }]}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 16, color: "#4b5563" },

  card: { marginTop: 12, padding: 16, backgroundColor: "#f3f4f6", borderRadius: 12, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  groupTitle: { fontSize: 16, fontWeight: "700", marginTop: 8 },

  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  label: { fontSize: 16, flex: 1 },
  input: {
    flexBasis: 180,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    fontSize: 16,
  },
});
