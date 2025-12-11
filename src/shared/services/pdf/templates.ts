import { InspectionEntry } from "@features/inspection/types/InspectionEntry";
import { UserProfile } from "@features/profile/types/UserProfile";

/** Utils de fecha */
function parseMonth(month: string) {
  // month: "YYYY-MM"
  const [y, m] = month.split("-").map(Number);
  return { y, m }; // m: 1..12
}
function daysInMonth(month: string) {
  const { y, m } = parseMonth(month);
  return new Date(y, m, 0).getDate(); // último día del mes
}
function dayFromISO(iso: string) {
  // iso: YYYY-MM-DD -> día (1..31)
  return Number(iso.slice(8, 10));
}

/** Toma el registro "más representativo" del mes para la tabla general:
 * preferimos el de mayor updatedAt; si no hay, el de mayor createdAt. */
function pickLatest(entries: InspectionEntry[]): InspectionEntry | null {
  if (!entries.length) return null;
  const sorted = [...entries].sort((a, b) => {
    const au = a.updatedAt ?? a.createdAt;
    const bu = b.updatedAt ?? b.createdAt;
    return bu - au;
  });
  return sorted[0];
}

/** Mapa fecha->entry para accesos O(1) por día */
function byDayMap(month: string, rows: InspectionEntry[]) {
  const map = new Map<number, InspectionEntry>();
  rows.forEach((e) => {
    if (e.date.startsWith(month + "-")) {
      map.set(dayFromISO(e.date), e);
    }
  });
  return map;
}

/** Define filas (ítems) de la matriz con su sección y cómo leer el booleano/valor */
type RowDef =
  | { kind: "section"; label: string; align?: "left" | "center" } 
  | { kind: "bool"; section?: string; label: string; pick: (e: InspectionEntry) => boolean | undefined }
  | { kind: "number"; section?: string; label: string; pick: (e: InspectionEntry) => number | undefined };

function rowsDefinition(): RowDef[] {
  const rows: RowDef[] = [
    { kind: "section", label: "1-ANTES DE LA OPERACIÓN", align: "center"},

    { kind: "section", label: "A. LLANTAS" },
    { kind: "bool", label: "Presión de aire", pick: (e) => e.llantasPresion },
    { kind: "bool", label: "Objetos incrustados", pick: (e) => e.llantasObjetos },
    { kind: "bool", label: "Estado de tuercas (completas y ajustadas)", pick: (e) => e.llantasTuercas },

    { kind: "section", label: "B. FUGAS" },
    { kind: "bool", label: "Motor", pick: (e) => e.fugasMotor },
    { kind: "bool", label: "Caja", pick: (e) => e.fugasCaja },
    { kind: "bool", label: "Diferencial", pick: (e) => e.fugasDiferencial },
    { kind: "bool", label: "Combustible", pick: (e) => e.fugasCombustible },

    { kind: "section", label: "C. NIVELES Y TAPAS" },
    { kind: "bool", label: "Motor", pick: (e) => e.nivelMotor },
    { kind: "bool", label: "Agua o refrigerante", pick: (e) => e.nivelRefrigerante },
    { kind: "bool", label: "Hidráulico", pick: (e) => e.nivelHidraulico },
    { kind: "bool", label: "Líquido de frenos o embrague", pick: (e) => e.nivelFrenosEmbrague },

    { kind: "section", label: "D. FILTROS" },
    { kind: "bool", label: "Estado", pick: (e) => e.filtrosEstado },
    { kind: "bool", label: "Fugas", pick: (e) => e.filtrosFugas },

    { kind: "section", label: "E. BATERÍAS" },
    { kind: "bool", label: "Bornes", pick: (e) => e.bateriasBornes },
    { kind: "bool", label: "Estado general", pick: (e) => e.bateriasEstado },

    { kind: "section", label: "F. CORREAS" },
    { kind: "bool", label: "Estado", pick: (e) => e.correasEstado },
    { kind: "bool", label: "Tensión", pick: (e) => e.correasTension },

    { kind: "section", label: "G. REVISIÓN INTERNA" },
    { kind: "bool", label: "Aseo", pick: (e) => e.revAseo },
    { kind: "bool", label: "Luces altas", pick: (e) => e.revLucesAltas },
    { kind: "bool", label: "Luces bajas", pick: (e) => e.revLucesBajas },
    { kind: "bool", label: "Cocuyos", pick: (e) => e.revCocuyos },
    { kind: "bool", label: "Luz blanca", pick: (e) => e.revLuzBlanca },

    { kind: "section", label: "2.EN EL MOMENTO DE ENCENDIDO DEL VEHICULO", align: "center" },
    // --- Funcionamiento Indicadores y luces ---
  { kind: "section", label: "A. FUNCIONAMIENTO INDICADORES Y LUCES" },
  { kind: "bool", label: "Presión de aceite", pick: e => e.indPresionAceite },
  { kind: "bool", label: "Carga alternador", pick: e => e.indCargaAlternador },
  { kind: "bool", label: "Temperatura del motor", pick: e => e.indTempMotor },
  { kind: "bool", label: "Presión de aire frenos", pick: e => e.indPresionAireFrenos },
  { kind: "bool", label: "Indicador de revoluciones", pick: e => e.indIndicadorRevoluciones },
  { kind: "bool", label: "Luces principales", pick: e => e.indLucesPrincipales },
  { kind: "bool", label: "Luz de freno", pick: e => e.indLuzFreno },
  { kind: "bool", label: "Luces direccionales", pick: e => e.indDireccionales },
  { kind: "bool", label: "Luz y pito de reversa", pick: e => e.indLuzYPitoReversa },
  { kind: "bool", label: "Funcionamiento del limpiabrisas", pick: e => e.indLimpiabrisas },
  { kind: "bool", label: "Pito", pick: e => e.indPito },
  { kind: "bool", label: "Dispositivo de conT de velocidad", pick: e => e.indControlVelocidad },

  // --- Documentación y elementos de seguridad ---
  { kind: "section", label: "B. REVISIÓN DE DOCUMENTACIÓN Y ELEMENTOS DE SEGURIDAD" },
  { kind: "bool", label: "Rev., porte y verificación de fechas (doc.)", pick: e => e.docFechasVigenciaOk },
  { kind: "bool", label: "Rev., porte y estado del botiquín", pick: e => e.docBotiquinOk },
  { kind: "bool", label: "Rev., porte y fecha de vencimiento extintor", pick: e => e.docExtintorOk },

  // --- Durante la operación (centrado) ---
  { kind: "section", label: "3. DURANTE LA OPERACIÓN", align: "center" },
  { kind: "bool", label: "Ruidos extraños", pick: e => e.opRuidosExtranos },
  { kind: "bool", label: "Novedades en los indicadores", pick: e => e.opNovedadesIndicadores },
  { kind: "bool", label: "Otros", pick: e => e.opOtros },

  // --- Después de la operación (centrado) ---
  { kind: "section", label: "4. DESPUÉS DE LA OPERACIÓN", align: "center" },
  { kind: "bool", label: "Llantas", pick: e => e.postLlantas },
  { kind: "bool", label: "Luces", pick: e => e.postLuces },
  { kind: "bool", label: "Fugas", pick: e => e.postFugas },
  { kind: "bool", label: "Correas", pick: e => e.postCorreas },
  { kind: "bool", label: "Estado general del vehículo", pick: e => e.postEstadoGeneral },
  { kind: "bool", label: "Kilometraje", pick: e => e.postKilometrajeOk },
  ];
  return rows;
}

/** Render helpers */
function cellBool(v: boolean | undefined) {
  if (v === undefined) return "–";
  return v ? "Sí" : "No";
}
function cellNum(v: number | undefined) {
  if (v === undefined || v === null || Number.isNaN(v)) return "–";
  return String(v);
}

/** Tabla de información general (encabezado) */
function renderGeneralTable(profile: UserProfile | null, month: string) {
  const movil = profile?.movil ?? "";
  const placas = profile?.placas ?? "";
  const conductor = profile?.conductorNombre ?? "";

  return `
  <table class="kv kv-horizontal">
    <tbody>
      <tr>
        <th class="kv-k">MES</th>
        <td class="kv-v">${escapeHtml(month)}</td>
        <th class="kv-k">MÓVIL</th>
        <td class="kv-v">${escapeHtml(movil)}</td>
        <th class="kv-k">PLACAS</th>
        <td class="kv-v">${escapeHtml(placas)}</td>
        <th class="kv-k">CONDUCTOR</th>
        <td class="kv-v">${escapeHtml(conductor)}</td>
      </tr>
    </tbody>
  </table>`;
}


/** Tabla principal (matriz) */
function renderMatrixTable(month: string, rows: InspectionEntry[], profile: UserProfile | null) {
  const totalDays = daysInMonth(month);
  const map = byDayMap(month, rows);
  const totalCols = 1 + totalDays; // 1 col de ítem + N días

  // Bloque de encabezado que SÍ se repite en todas las páginas
  const headerBlock = `
    <tr class="matrix-header-wrapper">
      <th class="matrix-header-cell" colspan="${totalCols}">
        <div class="matrix-header-block">
          ${renderHeaderTable()}
        </div>
      </th>
    </tr>`;

  // Fila de información general (MES, MÓVIL, etc.) SOLO PRIMERA PÁGINA
  const generalRow = `
    <tr class="general-row">
      <td class="general-cell" colspan="${totalCols}">
        ${renderGeneralTable(profile, month)}
      </td>
    </tr>`;

  // colgroup para respetar anchos exactos
  const colgroup =
    `<col style="width: var(--item-col)">` +
    Array.from({ length: totalDays }, () => `<col style="width: var(--day-col)">`).join("");

  // Encabezado de días: etiqueta "DÍA" + números 1..N
  const daysHead =
    '<tr class="days-head">' +
      '<th class="item-col">DÍA</th>' +
      Array.from({ length: totalDays }, (_, i) => `<th class="day-col">${i + 1}</th>`).join("") +
    "</tr>";

  const defs = rowsDefinition();
  const body = defs.map((def) => {
    if (def.kind === "section") {
      const centerClass = (def as any).align === "center" ? " center" : "";
      return `<tr class="section${centerClass}">
                <td class="section-label" colspan="${1 + totalDays}">${escapeHtml(def.label)}</td>
              </tr>`;
    }
    const labelCell = `<td class="item-label">${escapeHtml(def.label)}</td>`;
    const dayCells = Array.from({ length: totalDays }, (_, idx) => {
      const day = idx + 1;
      const entry = map.get(day);
      if (!entry) return `<td class="day-cell">–</td>`;
      if (def.kind === "bool") return `<td class="day-cell">${cellBool(def.pick(entry))}</td>`;
      return `<td class="day-cell num">${cellNum(def.pick(entry))}</td>`;
    }).join("");
    return `<tr>${labelCell}${dayCells}</tr>`;
  }).join("");

  // Aviso al conductor (lo dejamos en el cuerpo, debajo de la fila general)
  const notice =
    `<tr class="notice">
       <th class="notice-cell" colspan="${1 + totalDays}">
         SEÑOR CONDUCTOR: Es importante que se realicen las revisiones diarias recomendadas ANTES, DURANTE y DESPUÉS de la operación.
         Si encuentra alguna novedad, señalar con una “X” en la casilla correspondiente y relacionarla en la parte posterior de este formato.
       </th>
     </tr>`;

  return `
  <table class="matrix">
    <colgroup>${colgroup}</colgroup>
    <thead>
      ${headerBlock}
      ${generalRow}
      ${notice}
      ${daysHead}
    </thead>
    <tbody>
      ${body}
    </tbody>
  </table>`;
}


function renderHeaderTable() {
  return `
  <table class="header-table">
    <tbody>
      <!-- Fila 1: Logo - Títulos - Versión -->
      <tr>
        <td class="header-logo">
          LOGO CENTRADO
        </td>
        <td class="header-main">
          <div>Servicio con calidad y experiencia</div>
          <div>SISTEMA GESTIÓN DE CALIDAD</div>
          <div>FORMATO DE REVISION DIARIA DE VEHICULOS</div>
        </td>
        <td class="header-version">
          Versión: 1
        </td>
      </tr>

      <!-- Fila 2: Revisión / Aprobado / Fecha -->
      <tr class="header-subrow">
        <td class="header-review">
          <div>REVISIÓN:</div>
          <div>Coordinador de Calidad</div>
        </td>
        <td class="header-approval">
          <div>APROBADO: GERENTE</div>
        </td>
        <td class="header-date">
          <div>Fecha de:</div>
        </td>
      </tr>
    </tbody>
  </table>`;
}


/** Pequeño escape para valores de texto */
function escapeHtml(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Estilos: A4 horizontal, tipografía compacta y columnas de días angostas */
function styles(totalDays: number) {
  // más días ⇒ columna "Ítem" aún más angosta
  const itemColMm = totalDays >= 31 ? 62 : totalDays >= 30 ? 66 : 74;
  const baseFont  = totalDays >= 31 ? 9  : totalDays >= 30 ? 9.2 : 9.5;
  const scale     = totalDays >= 31 ? 0.86 : totalDays >= 30 ? 0.88 : 0.90;

  return `
  <style>
    :root{
      --page-w: 297mm;
      --page-h: 210mm;
      --margin: 8mm;

      --content-w: calc(var(--page-w) - 2 * var(--margin));
      --days: ${totalDays};

      --item-col: ${itemColMm}mm;
      --day-col: calc((var(--content-w) - var(--item-col)) / var(--days));
      --sheet-w: var(--content-w);
      --scale: ${scale};
    }
    @media screen {
      :root{
        --content-w: min(95vw, 1350px);
        --day-col: calc((var(--content-w) - var(--item-col)) / var(--days));
        --sheet-w: var(--content-w);
        --scale: 1;
      }
    }

    @page { size: A4 landscape; margin: var(--margin); }
    html, body { height: auto; }
    body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-size: ${baseFont}px; color: #111827; }

    .sheet { width: var(--sheet-w); margin: 0 auto; overflow: hidden; }
    @media print {
      .sheet {
        transform: scale(var(--scale));
        transform-origin: top left;
        width: calc(var(--sheet-w) / var(--scale));
      }
    }

    h1 { margin: 0 0 6px 0; font-size: 16px; text-align: left; }

    /* Info general (horizontal) */
    .kv { border-collapse: collapse; margin: 0; width: 100%; table-layout: fixed; }
    .kv th, .kv td { border: 1px solid #e5e7eb; padding: 0; text-align: left; }
    .kv.kv-horizontal tbody th { background: #f8fafc; }
    .kv-k { white-space: nowrap; width: 10%; background: #f3f4f6; }
    .kv-v { width: 15%; font-weight: 600; }

    /* Matriz: importante border-spacing 0 + table-layout fixed + colgroup */
    .matrix { border-collapse: collapse; border-spacing: 0; width: 100%; table-layout: fixed; }
    .matrix th, .matrix td { border: 1px solid #e5e7eb; padding: 2px 2px; }
    .matrix thead th { background: #f3f4f6; font-weight: 700; }
    .item-col { width: var(--item-col); text-align: left; }
    .day-col  { width: var(--day-col); text-align: center; }
    .item-label { font-weight: 600; }
    .day-cell { text-align: center; }
    .day-cell.num { text-align: right; padding-right: 3px; }

    .section .section-label {
      background: #eef2ff;
      font-weight: 700;
      text-align: left;
      padding: 2px 3px;
    }
    .section.center .section-label {
      text-align: center;
      background: #e0e7ff;              
      letter-spacing: .2px;                
    }
    
    .notice .notice-cell {
      background: #fff7ed;         
      border: 1px solid #e5e7eb;
      font-weight: 600;
      text-align: left;
      padding: 6px 8px;
      line-height: 1.25;
    }
    
    /* Encabezado de días (debajo del aviso) */
    .days-head th {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      padding: 2px 3px;
      font-weight: 700;
      text-align: center;
    }
    .days-head th.item-col { text-align: center; } /* “DÍA” alineado a la izquierda */

    /* Secciones centradas opcionales (si usaste align: "center") */
    .section.center .section-label {
      text-align: center;
      background: #e0e7ff;
      letter-spacing: .2px;
    }

    th, td { word-wrap: break-word; overflow-wrap: anywhere; }

    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
      table-layout: fixed;
    }
    .header-table td {
      border: 1px solid #e5e7eb;
      padding: 3px 4px;
      vertical-align: middle;
    }
    .header-logo {
      width: 18%;
      text-align: center;
      font-weight: 600;
      font-size: 11px;
      white-space: normal;
    }
    .header-main {
      width: 64%;
      text-align: center;
      font-weight: 700;
      line-height: 1.25;
      font-size: 12px;
    }
    .header-main div:nth-child(1) {
      font-size: 13px;
      margin-bottom: 2px;
    }
    .header-main div:nth-child(2),
    .header-main div:nth-child(3) {
      font-size: 11px;
      text-transform: uppercase;
    }
    .header-version {
      width: 18%;
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }
    .header-subrow td {
      font-size: 10px;
      font-weight: 600;
      text-align: center;
      line-height: 1.2;
    }    
    
    .matrix-header-wrapper .matrix-header-cell {
      border-bottom: 1px solid #e5e7eb;
      padding: 0;
    }
    .matrix-header-block {
      width: 100%;
    }

    .matrix-header-block .header-table {
      margin: 0 0 0 0; /* pequeña separación con la tabla general */
    }

    .matrix-header-block .kv {
      margin: 0 0 8px 0;
    }

    .general-row .general-cell {
      border: 1px;
      padding: 0;
    }

    .header-table tr:last-child td {
      border-bottom: 1px;
    }

    /* Quitar borde superior de la primera fila de la kv */
    .kv tr:first-child th,
    .kv tr:first-child td {
      border-top: 1px;
    }

    .notice .notice-cell {
      border-top: 1px ;
    }
  </style>`;
}


/** HTML principal del PDF mensual */
export function buildMonthlyHtml(month: string, rows: InspectionEntry[], profile: UserProfile | null) {
  const totalDays = daysInMonth(month);

  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <title>RutaCheck ${month}</title>
    ${styles(totalDays)}
  </head>
  <body>
    <div class="sheet">
      ${renderMatrixTable(month, rows, profile)}
    </div>
  </body>
  </html>`;
}

