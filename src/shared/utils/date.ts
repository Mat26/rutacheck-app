// YYYY-MM-DD en HORA LOCAL (no UTC)
export function todayLocalISO(): string {
  const d = new Date();
  // truco: compensa el timezone para que toISOString no salte de día
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
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
