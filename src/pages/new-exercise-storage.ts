import type { NewExerciseState } from "./new-exercise-flow";

const STORAGE_KEY = "queuelab.new-exercise.v1";
const NON_FINITE = "__queuelab_number__";

export function serializarEstado(state: NewExerciseState): string {
  return JSON.stringify(state, (_key, value: unknown) =>
    typeof value === "number" && !Number.isFinite(value)
      ? { [NON_FINITE]: String(value) }
      : value,
  );
}

export function deserializarEstado(raw: string | null): NewExerciseState | undefined {
  if (!raw) return undefined;
  try {
    const parsed: unknown = JSON.parse(raw, (_key, value: unknown) => {
      if (value && typeof value === "object" && NON_FINITE in value) {
        const number = (value as Record<string, unknown>)[NON_FINITE];
        if (number === "Infinity") return Infinity;
        if (number === "-Infinity") return -Infinity;
        if (number === "NaN") return NaN;
      }
      return value;
    });
    if (!parsed || typeof parsed !== "object") return undefined;
    const state = parsed as Partial<NewExerciseState>;
    if (!state.general || typeof state.general !== "object" || !Array.isArray(state.literales)) return undefined;
    if (typeof state.general.model !== "string" || !state.general.lambdaEntrada || !state.general.muEntrada) return undefined;
    return state as NewExerciseState;
  } catch {
    return undefined;
  }
}

export function cargarEstado(): NewExerciseState | undefined {
  try {
    return deserializarEstado(localStorage.getItem(STORAGE_KEY));
  } catch {
    return undefined;
  }
}

export function guardarEstado(state: NewExerciseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializarEstado(state));
  } catch {
    // Storage puede estar deshabilitado o lleno; la calculadora sigue funcionando en memoria.
  }
}
