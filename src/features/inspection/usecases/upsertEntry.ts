import { InspectionEntry } from "../types/InspectionEntry";
import { getByDate, upsertByDate } from "../services/inspectionStorage";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Permite enviar cualquier campo de InspectionEntry excepto los gestionados por el sistema.
 * Así, cuando agregues nuevos booleanos al modelo, se guardarán automáticamente.
 */
export type InspectionDataInput = Omit<
  InspectionEntry,
  "id" | "date" | "month" | "createdAt" | "updatedAt"
> & {
  month: string;
};

export async function upsertInspection(date: string, data: InspectionDataInput) {
  const prev = await getByDate(date);
  const now = Date.now();

  // Construcción por merge:
  // - Lo previo se mantiene
  // - Lo nuevo pisa lo anterior
  // - Campos de sistema se fijan aquí
  const next: InspectionEntry = {
    ...(prev ?? ({} as InspectionEntry)),
    ...data,                          // << aquí entran TODOS los campos nuevos (ej. indPresionAceite, etc.)
    id: prev?.id ?? uid(),
    date,
    month: data.month,
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
  };

  await upsertByDate(next);
  return next;
}
