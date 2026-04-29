/**
 * Preprocesadores para cálculos especiales de teoría de colas.
 *
 * Estos se usan cuando el enunciado del ejercicio requiere calcular
 * un flujo efectivo o λ/μ antes de aplicar el modelo de colas.
 *
 * Casos:
 * - Flujo por porcentajes: ejercicios tipo 24 (20% entra directo, 10% renueva)
 * - Flujo con reproceso: ejercicio 25 (5% reprocesa)
 * - Servicio ponderado: cuando hay múltiples tipos de servicio con probabilidades
 */

import type { ResultadoNormalizacion } from "./normalizar-entrada";

/**
 * Calcula el flujo efectivo cuando las llegadas tienen porcentajes
 * que determinan cuántas pasan efectivamente por el sistema.
 *
 * Ejemplo: "20% entra directo, 10% renueva"
 * λ efectiva = flujo_base × (20% + 10%) = flujo_base × 0.30
 */
export interface ResultadoFlujoPorcentajes {
  lambda: number;
  formula: string;
  sustitucion: string;
  resultado: string;
}

export function flujoPorPorcentajes(
  flujoBase: number,
  porcentajes: number[],
): ResultadoFlujoPorcentajes {
  const factor = porcentajes.reduce((s, p) => s + p, 0);
  const lambda = flujoBase * factor;

  return {
    lambda,
    formula: "λ = flujo base × suma de porcentajes",
    sustitucion: `${flujoBase} × (${porcentajes.map(p => (p * 100).toFixed(0) + "%").join(" + ")}) = ${flujoBase} × ${factor.toFixed(4)}`,
    resultado: `${lambda.toFixed(4)} por hora`,
  };
}

/**
 * Calcula el flujo efectivo cuando hay reprocesos/retornos.
 *
 * Ejemplo: "5% de los clientes vuelve a entrar"
 * λ efectiva = λ / (1 - r)
 *
 * Nota: M/M/k estándar no modela prioridad de reprocesos.
 * Este preprocesador es una aproximación.
 */
export interface ResultadoFlujoReproceso {
  lambdaEfectiva: number;
  flujoReproceso: number;
  formula: string;
  sustitucion: string;
  resultado: string;
  advertencia?: string;
}

export function flujoEfectivoConReproceso(params: {
  lambdaExterna: number;
  probabilidadRetorno: number;
}): ResultadoFlujoReproceso {
  const { lambdaExterna, probabilidadRetorno } = params;

  if (probabilidadRetorno >= 1) {
    return {
      lambdaEfectiva: Infinity,
      flujoReproceso: Infinity,
      formula: "λe = λ / (1 - r) — ERROR",
      sustitucion: `r = ${probabilidadRetorno} ≥ 1`,
      resultado: "∞ — r debe ser < 1",
      advertencia: "La probabilidad de retorno debe ser menor que 1",
    };
  }

  const lambdaEfectiva = lambdaExterna / (1 - probabilidadRetorno);
  const flujoReproceso = lambdaEfectiva - lambdaExterna;

  return {
    lambdaEfectiva,
    flujoReproceso,
    formula: "λe = λ / (1 - r)",
    sustitucion: `${lambdaExterna} / (1 - ${probabilidadRetorno}) = ${lambdaEfectiva.toFixed(4)}`,
    resultado: `${lambdaEfectiva.toFixed(4)} por hora (flujo reproceso: ${flujoReproceso.toFixed(4)}/h)`,
    advertencia: "M/M/k estándar no modela prioridad de reprocesos — esta es una aproximación",
  };
}

/**
 * Calcula μ efectivo cuando hay múltiples tipos de servicio
 * con probabilidades diferentes.
 *
 * Ejemplo: "60% de clientes tarda 4 min, 40% tarda 8 min"
 * E[S] = 0.6 × 4 + 0.4 × 8 = 5.6 min
 * μ = 1 / (5.6 min en horas) = 10.71/h
 */
export interface ResultadoServicioPonderado {
  tiempoMedio: number;
  mu: number;
  unidad: "segundos" | "minutos" | "horas";
  formula: string;
  sustitucion: string;
  resultado: string;
}

export function servicioPonderado(params: {
  tiempos: { tiempo: number; probabilidad: number }[];
  unidad: "segundos" | "minutos" | "horas";
}): ResultadoServicioPonderado {
  const { tiempos, unidad } = params;

  const tiempoMedio = tiempos.reduce(
    (s, t) => s + t.tiempo * t.probabilidad,
    0,
  );

  let horas: number;
  if (unidad === "segundos") {
    horas = tiempoMedio / 3600;
  } else if (unidad === "minutos") {
    horas = tiempoMedio / 60;
  } else {
    horas = tiempoMedio;
  }

  const mu = 1 / horas;

  const desgloseProb = tiempos.map(t => `${t.tiempo} ${unidad} × ${t.probabilidad}`).join(" + ");

  return {
    tiempoMedio,
    mu,
    unidad,
    formula: "E[S] = Σ tiempo_i × prob_i; μ = 1/E[S]",
    sustitucion: `E[S] = ${desgloseProb} = ${tiempoMedio.toFixed(4)} ${unidad}; μ = 1 / ${horas.toFixed(6)} h`,
    resultado: `${mu.toFixed(4)} servicios/hora`,
  };
}

/**
 * Combina dos λ por porcentaje — útil para ejercicios tipo 24.
 */
export function flujoCombinadoPorcentajes(
  flujos: { flujoBase: number; porcentaje: number }[],
): ResultadoFlujoPorcentajes {
  const porcentajes = flujos.map(f => f.porcentaje);
  const flujoBase = flujos[0]?.flujoBase ?? 0;
  return flujoPorPorcentajes(flujoBase, porcentajes);
}