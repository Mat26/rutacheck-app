export type InspectionEntry = {
  id: string;
  date: string;          // YYYY-MM-DD (único por día)
  pitoReversa: boolean;
  timon: boolean;
  cinturones: boolean;
  martillos: boolean;
  kilometraje: number;
  createdAt: number;
  updatedAt?: number;
};
