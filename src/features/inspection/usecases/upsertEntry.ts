import { InspectionEntry } from "../types/InspectionEntry";
import { getByDate, upsertByDate } from "../services/inspectionStorage";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export type InspectionDataInput = Omit<
  InspectionEntry,
  "id" | "date" | "month" | "createdAt" | "updatedAt"
> & { month: string }; // exigimos month (lo calculas desde la fecha local)

export async function upsertInspection(date: string, data: InspectionDataInput) {
  const prev = await getByDate(date);

  const entry: InspectionEntry = {
    id: prev?.id ?? uid(),
    date,
    month: data.month,

    // info general
    movil: data.movil,
    placas: data.placas,
    conductorNombre: data.conductorNombre,

    // existentes
    pitoReversa: data.pitoReversa,
    timon: data.timon,
    cinturones: data.cinturones,
    martillos: data.martillos,
    kilometraje: data.kilometraje,

    // nuevas secciones
    llantasPresion: data.llantasPresion,
    llantasObjetos: data.llantasObjetos,
    llantasTuercas: data.llantasTuercas,

    fugasMotor: data.fugasMotor,
    fugasCaja: data.fugasCaja,
    fugasDiferencial: data.fugasDiferencial,
    fugasCombustible: data.fugasCombustible,

    nivelMotor: data.nivelMotor,
    nivelRefrigerante: data.nivelRefrigerante,
    nivelHidraulico: data.nivelHidraulico,
    nivelFrenosEmbrague: data.nivelFrenosEmbrague,

    filtrosEstado: data.filtrosEstado,
    filtrosFugas: data.filtrosFugas,

    bateriasBornes: data.bateriasBornes,
    bateriasEstado: data.bateriasEstado,

    correasEstado: data.correasEstado,
    correasTension: data.correasTension,

    revAseo: data.revAseo,
    revLucesAltas: data.revLucesAltas,
    revLucesBajas: data.revLucesBajas,
    revCocuyos: data.revCocuyos,
    revLuzBlanca: data.revLuzBlanca,

    createdAt: prev?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };

  await upsertByDate(entry);
  return entry;
}
