/**
 * Tipos para el sistema de plantillas (recetas).
 *
 * Una receta es una configuración predefinida de literales
 * que permite resolver un tipo de ejercicio con un clic.
 */

import type { GeneralState, LiteralExtra, TipoLiteral } from "@/pages/new-exercise-flow";

export interface LiteralReceta {
  tipo: TipoLiteral;
  extra?: LiteralExtra;
  label?: string;
}

export interface RecetaEjercicio {
  id: string;
  nombre: string;
  descripcion: string;
  general?: Partial<GeneralState>;
  literales: LiteralReceta[];
}

export interface RecetaParams {
  jornada?: { horasDiarias: number; diasSemana?: number };
  costos?: {
    costoServidorDia?: number;
    costoEsperaHoraCliente?: number;
    horasPeriodo?: number;
    costoSobre?: "Lq" | "L";
  };
  condicion?: {
    tipo: "Pk_maximo" | "fraccion_no_espera_minima" | "Wq_maximo_min" | "W_maximo_min" | "L_maximo" | "Lq_maximo";
    valor: number;
  };
}