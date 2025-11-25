import { InspectionEntry } from "../types/InspectionEntry";
import { getByDate, upsertByDate } from "../services/inspectionStorage";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export async function upsertInspection(
  date: string,
  data: Omit<InspectionEntry, "id" | "date" | "createdAt" | "updatedAt">
) {
  const prev = await getByDate(date);
  const entry: InspectionEntry = {
    id: prev?.id ?? uid(),
    date,
    pitoReversa: data.pitoReversa,
    timon: data.timon,
    cinturones: data.cinturones,
    martillos: data.martillos,
    kilometraje: data.kilometraje,
    createdAt: prev?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };
  await upsertByDate(entry);
  return entry;
}
