import { getAll } from "@features/inspection/services/inspectionStorage";

export async function getAvailableMonths(): Promise<string[]> {
  const rows = await getAll();
  const set = new Set<string>();
  for (const r of rows) {
    if (r.month) set.add(r.month);           // YYYY-MM que ya guardas
    else if (r.date) set.add(r.date.slice(0, 7));
  }
  // más recientes primero
  return Array.from(set).sort().reverse();
}
