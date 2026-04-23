/**
 * Módulo de conversión de unidades para teoría de colas.
 * 
 * Maneja todas las conversiones que aparecen en los ejercicios:
 * - Tasa ↔ Intervalo  (ej: "cada 50 min" → λ = 60/50 = 1.2/h)
 * - Unidades de tiempo (segundos, minutos, horas, días)
 * - Tasas compuestas   (ej: "15 productos × 4 seg" → μ = 3600/60)
 */

export type UnidadTiempo = "segundos" | "minutos" | "horas" | "dias";

/** Factores para convertir cada unidad a horas */
const FACTOR_A_HORAS: Record<UnidadTiempo, number> = {
  segundos: 1 / 3600,
  minutos: 1 / 60,
  horas: 1,
  dias: 24,
};

/**
 * Convierte un valor de tiempo de una unidad a otra.
 * Ej: convertirTiempo(4, "minutos", "horas") → 4/60
 */
export function convertirTiempo(valor: number, desde: UnidadTiempo, hacia: UnidadTiempo): number {
  const enHoras = valor * FACTOR_A_HORAS[desde];
  return enHoras / FACTOR_A_HORAS[hacia];
}

/**
 * Convierte un intervalo medio a tasa por hora.
 * Ej: "un cliente cada 4 minutos" → intervaloATasa(4, "minutos") → 15 c/h
 *     "cada 50 minutos"           → intervaloATasa(50, "minutos") → 1.2 c/h
 *     "cada 10 días"              → intervaloATasa(10, "dias")    → 0.1/día × (1/24) → 1/240 c/h
 */
export function intervaloATasa(intervalo: number, unidad: UnidadTiempo): number {
  if (intervalo <= 0) return 0;
  const intervaloEnHoras = intervalo * FACTOR_A_HORAS[unidad];
  return 1 / intervaloEnHoras;
}

/**
 * Convierte una tasa a intervalo medio.
 * Ej: tasaAIntervalo(15, "minutos") → 4 min entre llegadas
 */
export function tasaAIntervalo(tasaPorHora: number, unidadSalida: UnidadTiempo): number {
  if (tasaPorHora <= 0) return Infinity;
  const intervaloEnHoras = 1 / tasaPorHora;
  return intervaloEnHoras / FACTOR_A_HORAS[unidadSalida];
}

/**
 * Convierte una tasa dada en alguna unidad a tasa por hora.
 * Ej: tasaAHoras(2, "minutos") → 120 c/h
 *     tasaAHoras(10, "horas")  → 10 c/h
 *     tasaAHoras(0.1, "dias")  → 0.1/24 c/h ← NO, "0.1 c/día" → 0.1/24
 */
export function tasaAHoras(valor: number, unidadDeTasa: UnidadTiempo): number {
  // Si la tasa está en "c/min", multiplicamos por 60 para obtener c/h
  // Si está en "c/seg", multiplicamos por 3600
  // Si está en "c/día", dividimos por 24
  return valor / FACTOR_A_HORAS[unidadDeTasa];
}

/**
 * Convierte una tasa por hora a otra unidad de tasa.
 * Ej: tasaDesdeHoras(120, "minutos") → 2 c/min
 */
export function tasaDesdeHoras(tasaPorHora: number, unidadSalida: UnidadTiempo): number {
  return tasaPorHora * FACTOR_A_HORAS[unidadSalida];
}

/**
 * Calcula tasa de servicio compuesta.
 * Ej: "15 productos, 4 segundos por producto" 
 *   → tiempoServicioCompuesto(15, 4, "segundos") → 60 seg total → μ = 60 c/h
 * Ej: "0.9 páginas por manuscrito, 10 páginas por hora"
 *   → capacidad real = 10/0.9 manuscritos/hora
 */
export function tiempoServicioCompuesto(
  cantidadPorCliente: number,
  tiempoPorUnidad: number,
  unidadTiempo: UnidadTiempo,
): number {
  const tiempoTotalPorCliente = cantidadPorCliente * tiempoPorUnidad;
  return intervaloATasa(tiempoTotalPorCliente, unidadTiempo);
}

/**
 * Interfaz para describir cómo se ingresan λ o μ.
 * Permite flexibilidad total en la entrada de datos.
 */
export interface EntradaFlexible {
  /** Modo de entrada */
  modo: "tasa" | "intervalo" | "compuesto";
  /** Valor numérico principal */
  valor: number;
  /** Unidad del valor */
  unidad: UnidadTiempo;
  /** Para modo "compuesto": cantidad por cliente (ej: 15 productos) */
  cantidadPorCliente?: number;
}

/**
 * Convierte una entrada flexible a tasa por hora.
 */
export function flexibleATasaHora(entrada: EntradaFlexible): number {
  switch (entrada.modo) {
    case "tasa":
      return tasaAHoras(entrada.valor, entrada.unidad);
    case "intervalo":
      return intervaloATasa(entrada.valor, entrada.unidad);
    case "compuesto":
      return tiempoServicioCompuesto(
        entrada.cantidadPorCliente ?? 1,
        entrada.valor,
        entrada.unidad,
      );
  }
}

/**
 * Convierte horas a la unidad de salida deseada.
 * Útil para mostrar resultados en la unidad del ejercicio.
 */
export function horasA(valor: number, unidad: UnidadTiempo): number {
  return valor / FACTOR_A_HORAS[unidad];
}

/**
 * Parámetros de jornada laboral.
 */
export interface Jornada {
  horasDiarias: number;
  diasSemana?: number;
}

/**
 * Calcula la cantidad total en un período dado.
 * Ej: "clientes diarios que esperan" = λ × horasDiarias × Pk
 */
export function totalEnPeriodo(tasaPorHora: number, horas: number): number {
  return tasaPorHora * horas;
}

/**
 * Convierte factor de tiempo a minutos diarios.
 * Ej: "minutos diarios desocupado" = P0 × horasDiarias × 60
 */
export function fraccionAMinutosDiarios(fraccion: number, horasDiarias: number): number {
  return fraccion * horasDiarias * 60;
}

/**
 * Convierte factor de tiempo a horas diarias.
 * Ej: "horas diarias desocupado" = P0 × horasDiarias
 */
export function fraccionAHorasDiarias(fraccion: number, horasDiarias: number): number {
  return fraccion * horasDiarias;
}

/**
 * Convierte factor de tiempo a horas semanales.
 */
export function fraccionAHorasSemanales(fraccion: number, horasDiarias: number, diasSemana: number): number {
  return fraccion * horasDiarias * diasSemana;
}
