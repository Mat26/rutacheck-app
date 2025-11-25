import { InspectionEntry } from "@features/inspection/types/InspectionEntry";

const fmt = (b: boolean) => (b ? "Sí" : "No");

export function buildMonthlyHtml(month: string, rows: InspectionEntry[]) {
  const items = rows.map(r => `
    <tr>
      <td>${r.date}</td>
      <td>${fmt(r.pitoReversa)}</td>
      <td>${fmt(r.timon)}</td>
      <td>${fmt(r.cinturones)}</td>
      <td>${fmt(r.martillos)}</td>
      <td style="text-align:right">${r.kilometraje}</td>
    </tr>`).join("");

  return `<!doctype html><html><head><meta charset="utf-8"/>
    <title>RutaCheck ${month}</title>
    <style>
      body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; padding: 24px; }
      h1 { margin: 0 0 12px 0; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; }
      th { background: #f3f4f6; text-align: left; }
    </style>
  </head>
  <body>
    <h1>RutaCheck — ${month}</h1>
    <table>
      <thead>
        <tr>
          <th>Fecha</th><th>Pito reversa</th><th>Timón</th>
          <th>Cinturones</th><th>Martillos</th><th style="text-align:right">Kilometraje</th>
        </tr>
      </thead>
      <tbody>${items || `<tr><td colspan="6">Sin registros</td></tr>`}</tbody>
    </table>
  </body></html>`;
}
