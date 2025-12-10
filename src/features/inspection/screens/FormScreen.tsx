import { useEffect, useState } from "react";
import { Text, StyleSheet, ScrollView, Pressable, TextInput, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import Screen from "@shared/components/Screen";
import Button from "@shared/components/Button";
import BoolField from "@features/inspection/components/BoolField";
import { getByDate } from "@features/inspection/services/inspectionStorage";
import { upsertInspection } from "@features/inspection/usecases/upsertEntry";
import { todayLocalISO, monthFromYmd } from "@shared/utils/date";
import { isWeb } from "@shared/utils/platform";
import type { InspectionEntry } from "@features/inspection/types/InspectionEntry";

// ---------------- Nuevas secciones (definición de campos booleanos) ----------------
type BoolKey = {
  [K in keyof InspectionEntry]: InspectionEntry[K] extends boolean | undefined ? K : never
}[keyof InspectionEntry];
type BoolCfg = { key: BoolKey; label: string };

// Funcionamiento Indicadores y luces
const CFG_INDICADORES_LUCES: BoolCfg[] = [
  { key: "indPresionAceite", label: "Presión de aceite" },
  { key: "indCargaAlternador", label: "Carga alternador" },
  { key: "indTempMotor", label: "Temperatura del motor" },
  { key: "indPresionAireFrenos", label: "Presión de aire frenos" },
  { key: "indIndicadorRevoluciones", label: "Indicador de revoluciones" },
  { key: "indLucesPrincipales", label: "Luces principales" },
  { key: "indLuzFreno", label: "Luz de freno" },
  { key: "indDireccionales", label: "Luces direccionales" },
  { key: "indLuzYPitoReversa", label: "Luz y pito de reversa" },
  { key: "indLimpiabrisas", label: "Funcionamiento del limpiabrisas" },
  { key: "indPito", label: "Pito" },
  { key: "indControlVelocidad", label: "Dispositivo de conT de velocidad" },
];

// Revisión de documentación y elementos de seguridad
const CFG_DOC_SEGURIDAD: BoolCfg[] = [
  { key: "docFechasVigenciaOk", label: "Rev., porte y verificación de fechas (doc.)" },
  { key: "docBotiquinOk", label: "Rev., porte y estado del botiquín" },
  { key: "docExtintorOk", label: "Rev., porte y fecha de vencimiento extintor" },
];

// Durante la Operación
const CFG_DURANTE: BoolCfg[] = [
  { key: "opRuidosExtranos", label: "Ruidos extraños" },
  { key: "opNovedadesIndicadores", label: "Novedades en los indicadores" },
  { key: "opOtros", label: "Otros" },
];

// Después de la operación
const CFG_DESPUES: BoolCfg[] = [
  { key: "postLlantas", label: "Llantas" },
  { key: "postLuces", label: "Luces" },
  { key: "postFugas", label: "Fugas" },
  { key: "postCorreas", label: "Correas" },
  { key: "postEstadoGeneral", label: "Estado general del vehículo" },
  { key: "postKilometrajeOk", label: "Kilometraje" },
];

// -----------------------------------------------------------------------------------

export default function FormScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const date = params.date ? String(params.date) : todayLocalISO();
  const month = monthFromYmd(date);

  const [loading, setLoading] = useState(true);

  // --- (Tu estado existente) Antes de la operación ---
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

  // --- (Nuevo) Estado compacto para las secciones adicionales ---
  const [extraBools, setExtraBools] = useState<Partial<Record<BoolKey, boolean>>>({});

  const setExtra = (key: BoolKey, val: boolean) =>
    setExtraBools((prev) => ({ ...prev, [key]: val }));

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

        // Nuevas secciones (carga masiva por config)
        const next: Partial<Record<BoolKey, boolean>> = {};
        for (const cfg of [
          ...CFG_INDICADORES_LUCES,
          ...CFG_DOC_SEGURIDAD,
          ...CFG_DURANTE,
          ...CFG_DESPUES,
        ]) {
          next[cfg.key] = !!(existing as any)[cfg.key];
        }
        setExtraBools(next);
      }
      setLoading(false);
    })();
  }, [date]);

  const handleGuardar = async () => {
    await upsertInspection(date, {
      month, // YYYY-MM local
      // (existentes)
      llantasPresion, llantasObjetos, llantasTuercas,
      fugasMotor, fugasCaja, fugasDiferencial, fugasCombustible,
      nivelMotor, nivelRefrigerante, nivelHidraulico, nivelFrenosEmbrague,
      filtrosEstado, filtrosFugas,
      bateriasBornes, bateriasEstado,
      correasEstado, correasTension,
      revAseo, revLucesAltas, revLucesBajas, revCocuyos, revLuzBlanca,
      // (nuevos) mezcla compacta
      ...extraBools,
    });

    router.replace("/"); // volver a inicio
  };

  if (loading) return <Screen />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Formulario del día</Text>
      <Text style={styles.subtitle}>{date}</Text>

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

      {/* Funcionamiento Indicadores y luces */}
      <Pressable style={styles.card}>
        <Text style={styles.sectionTitle}>Funcionamiento Indicadores y luces</Text>
        {CFG_INDICADORES_LUCES.map(({ key, label }) => (
          <BoolField
            key={String(key)}
            label={label}
            value={!!extraBools[key]}
            onChange={(v) => setExtra(key, v)}
          />
        ))}
      </Pressable>

      {/* Revisión de documentación y elementos de seguridad */}
      <Pressable style={styles.card}>
        <Text style={styles.sectionTitle}>Revisión de documentación y elementos de seguridad</Text>
        {CFG_DOC_SEGURIDAD.map(({ key, label }) => (
          <BoolField
            key={String(key)}
            label={label}
            value={!!extraBools[key]}
            onChange={(v) => setExtra(key, v)}
          />
        ))}
      </Pressable>

      {/* Durante la Operación (título centrado) */}
      <Pressable style={styles.card}>
        <Text style={[styles.sectionTitle, styles.center]}>Durante la Operación</Text>
        {CFG_DURANTE.map(({ key, label }) => (
          <BoolField
            key={String(key)}
            label={label}
            value={!!extraBools[key]}
            onChange={(v) => setExtra(key, v)}
          />
        ))}
      </Pressable>

      {/* Después de la operación (título centrado) */}
      <Pressable style={styles.card}>
        <Text style={[styles.sectionTitle, styles.center]}>Después de la operación</Text>
        {CFG_DESPUES.map(({ key, label }) => (
          <BoolField
            key={String(key)}
            label={label}
            value={!!extraBools[key]}
            onChange={(v) => setExtra(key, v)}
          />
        ))}
      </Pressable>

      <Button title="Guardar" onPress={handleGuardar} />
      {isWeb && (
        <Button
          title="← Regresar"
          onPress={() => {
            if (router.canGoBack?.()) router.back();
            else router.replace("/");
          }}
          variant="secondary"
        />
      )}
    </ScrollView>
  );
}

/** Input simple con etiqueta (mantengo tu helper) */
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
  center: { textAlign: "center" },

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
