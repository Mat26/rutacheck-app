export type InspectionEntry = {
  id: string;
  date: string;      // YYYY-MM-DD (único por día)
  month: string;     // YYYY-MM (autocompletado desde la fecha)

  // Información general / usuario
  movil?: string;
  placas?: string;
  conductorNombre?: string;

  // --- Antes de la operación ---
  // Llantas
  llantasPresion: boolean;
  llantasObjetos: boolean;
  llantasTuercas: boolean;

  // Fugas
  fugasMotor: boolean;
  fugasCaja: boolean;
  fugasDiferencial: boolean;
  fugasCombustible: boolean;

  // Niveles y tapas
  nivelMotor: boolean;
  nivelRefrigerante: boolean;
  nivelHidraulico: boolean;
  nivelFrenosEmbrague: boolean;

  // Filtros
  filtrosEstado: boolean;
  filtrosFugas: boolean;

  // Baterías
  bateriasBornes: boolean;
  bateriasEstado: boolean;

  // Correas
  correasEstado: boolean;
  correasTension: boolean;

  // Revisión interna
  revAseo: boolean;
  revLucesAltas: boolean;
  revLucesBajas: boolean;
  revCocuyos: boolean;
  revLuzBlanca: boolean;

  createdAt: number;
  updatedAt?: number;
};
