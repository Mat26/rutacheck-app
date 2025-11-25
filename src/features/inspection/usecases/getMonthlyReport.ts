import { InspectionEntry } from "../types/InspectionEntry";
import { getAll } from "../services/inspectionStorage";

export function monthOf(dateISO: string) {
  return dateISO.slice(0, 7); // YYYY-MM
}

export async function getEntriesOfMonth(month: string): Promise<InspectionEntry[]> {
  const all = await getAll();
  return all.filter(e => monthOf(e.date) === month);
}
