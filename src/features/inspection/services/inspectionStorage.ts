import { storage } from "@shared/services/storage";
import { InspectionEntry } from "../types/InspectionEntry";

const KEY = "rutacheck:entries";

export async function getAll(): Promise<InspectionEntry[]> {
  return (await storage.get<InspectionEntry[]>(KEY)) ?? [];
}

export async function setAll(list: InspectionEntry[]) {
  await storage.set(KEY, list);
}

export async function getByDate(date: string): Promise<InspectionEntry | undefined> {
  const all = await getAll();
  return all.find(e => e.date === date);
}

export async function upsertByDate(entry: InspectionEntry): Promise<void> {
  const list = await getAll();
  const idx = list.findIndex(e => e.date === entry.date);
  if (idx >= 0) {
    const prev = list[idx];
    list[idx] = { ...prev, ...entry, id: prev.id, createdAt: prev.createdAt, updatedAt: Date.now() };
  } else {
    list.unshift({ ...entry, updatedAt: Date.now() });
  }
  await setAll(list);
}

export async function clearAll() {
  await storage.remove(KEY);
}
