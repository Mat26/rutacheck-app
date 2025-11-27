// Fecha local de "hoy" -> "YYYY-MM-DD"
export function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
// Convierte un Date cualquiera a YYYY-MM-DD local
export function toLocalISO(date: Date): string {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

// Mes local YYYY-MM (útil para PDF)
export function monthLocalISO(date: Date = new Date()): string {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 7);
}

// Convierte "YYYY-MM-DD" a Date local (¡no UTC!)
export function ymdToLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

// Mes desde "YYYY-MM" o "YYYY-MM-DD"
export function monthFromYmd(ymdOrMonth: string): string {
  return ymdOrMonth.slice(0, 7);
}

