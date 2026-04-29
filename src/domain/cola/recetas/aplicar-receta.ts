/**
 * Aplica una receta al estado actual.
 */

import type { NewExerciseState, LiteralState, GeneralState, TipoLiteral, LiteralExtra } from "@/pages/new-exercise-flow";
import type { RecetaEjercicio } from "./tipos";

export function aplicarReceta(
  state: NewExerciseState,
  receta: RecetaEjercicio,
): NewExerciseState {
  const nuevosLiterales: LiteralState[] = receta.literales.map((lit, index) => ({
    id: `receta-${receta.id}-${index}-${Date.now()}`,
    tipo: lit.tipo as TipoLiteral,
    label: lit.label ?? lit.tipo,
    extra: lit.extra ?? {} as LiteralExtra,
  }));

  return {
    ...state,
    general: {
      ...state.general,
      ...(receta.general ?? {}),
    },
    literales: nuevosLiterales,
    metricas: undefined,
    metricasHeterogeneo: undefined,
  };
}

export function aplicarPlantilla(
  state: NewExerciseState,
  plantillaId: string,
  recetas: RecetaEjercicio[],
): NewExerciseState {
  const receta = recetas.find(r => r.id === plantillaId);
  if (!receta) return state;
  return aplicarReceta(state, receta);
}