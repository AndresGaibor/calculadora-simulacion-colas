/**
 * Módulo de optimización para teoría de colas.
 * 
 * Resuelve problemas tipo:
 * - "¿Cuántos servidores para minimizar costos?"
 * - "¿Cuántos servidores para que P0 ≥ X?"
 * - "¿Cuántos servidores para que Pk ≤ X?"
 * - "¿Cuántos servidores para que L ≤ X?"
 * - "¿Cuántos servidores para que no más de X% esperen?"
 * - "¿Cuántos de población (M) asignar al sistema?"
 */

import { calcularTodo, type MetricasCompletas, type ParametrosSistema } from "./calcular-todo";
import { crearPasoDesarrollo, formatearNumero } from "./desarrollo";
import type { PasoDesarrollo } from "./tipos";

// ─── Tipos ─────────────────────────────────────────────────────────────

export interface CostosPorServidor {
  /** Costo por servidor por hora (o por día, pero consistente) */
  costoServidor: number;
  /** Costo por cliente esperando por hora (o misma unidad) */
  costoEspera: number;
  /** Si el costo de espera aplica a tiempo en cola (Lq) o en sistema (L) */
  costoSobre: "cola" | "sistema";
}

export interface ResultadoOptimizacion {
  /** Valor óptimo encontrado */
  valorOptimo: number;
  /** Métricas para el valor óptimo */
  metricas: MetricasCompletas;
  /** Tabla comparativa para cada valor probado */
  tabla: FilaOptimizacion[];
  /** Desarrollo paso a paso */
  desarrollo: PasoDesarrollo[];
}

export interface FilaOptimizacion {
  /** Valor de k (servidores) o M (población) */
  valor: number;
  /** Si el sistema es estable */
  estable: boolean;
  /** ρ del sistema */
  rho: number;
  /** P0 */
  P0: number;
  /** Pk */
  Pk: number;
  /** Lq */
  Lq: number;
  /** L */
  L: number;
  /** Wq (en la unidad del sistema) */
  Wq: number;
  /** W */
  W: number;
  /** Costo total (si se proporcionaron costos) */
  costoTotal?: number;
  /** Costo servidores */
  costoServidor?: number;
  /** Costo espera */
  costoEspera?: number;
  /** Cumple la condición */
  cumpleCondicion: boolean;
  /** Es el valor óptimo */
  esOptimo: boolean;
}

export type CondicionOptimizacion =
  | { tipo: "P0_minimo"; valor: number }           // P0 ≥ valor  (ej: 50% desocupados)
  | { tipo: "Pk_maximo"; valor: number }            // Pk ≤ valor  (ej: no más de 20% esperen)
  | { tipo: "L_maximo"; valor: number }             // L ≤ valor   (ej: máximo 2 en sistema)
  | { tipo: "Lq_maximo"; valor: number }            // Lq ≤ valor  (ej: no más de 1 esperando)
  | { tipo: "Wq_maximo_min"; valor: number }        // Wq ≤ valor minutos
  | { tipo: "W_maximo_min"; valor: number }         // W ≤ valor minutos
  | { tipo: "Pk_sistema_maximo"; valor: number }    // P(N≥k) ≤ valor (para gasolineras, etc.)
  | { tipo: "fraccion_operacion_minima"; valor: number } // (M-L)/M ≥ valor (% en operación)
  | { tipo: "fraccion_no_espera_minima"; valor: number } // 1-Pk ≥ valor  (% atendidos inmediatamente)
  | { tipo: "minimizar_costo"; costos: CostosPorServidor } // Costo mínimo
  | { tipo: "Wq_condicional_maximo_min"; valor: number }; // Wn ≤ valor (tiempo de espera de los que SÍ esperan)

function evaluarCondicion(
  metricas: MetricasCompletas,
  condicion: CondicionOptimizacion,
  k: number,
  M: number,
): boolean {
  switch (condicion.tipo) {
    case "P0_minimo":
      return metricas.P0 >= condicion.valor;
    case "Pk_maximo":
      return metricas.Pk <= condicion.valor;
    case "L_maximo":
      return metricas.L <= condicion.valor;
    case "Lq_maximo":
      return metricas.Lq <= condicion.valor;
    case "Wq_maximo_min":
      return metricas.Wq * 60 <= condicion.valor;
    case "W_maximo_min":
      return metricas.W * 60 <= condicion.valor;
    case "Pk_sistema_maximo":
      return metricas.Pk <= condicion.valor;
    case "fraccion_operacion_minima": {
      if (M === Infinity) return true;
      const fraccionOperacion = (M - metricas.L) / M;
      return fraccionOperacion >= condicion.valor;
    }
    case "fraccion_no_espera_minima":
      return (1 - metricas.Pk) >= condicion.valor;
    case "minimizar_costo":
      return metricas.estable;
    case "Wq_condicional_maximo_min":
      return metricas.Wn * 60 <= condicion.valor;
  }
}

function calcularCosto(
  metricas: MetricasCompletas,
  k: number,
  costos: CostosPorServidor,
  horasUnidad: number = 1,
): { costoServidor: number; costoEspera: number; costoTotal: number } {
  const cs = costos.costoServidor * k * horasUnidad;
  const cantidadEspera = costos.costoSobre === "cola" ? metricas.Lq : metricas.L;
  const ce = costos.costoEspera * cantidadEspera * horasUnidad;
  return { costoServidor: cs, costoEspera: ce, costoTotal: cs + ce };
}

// ─── Optimización de K (servidores) ────────────────────────────────────

/**
 * Encuentra el número óptimo de servidores según una condición.
 * 
 * @param lambda - Tasa de llegada por hora
 * @param mu - Tasa de servicio por servidor por hora
 * @param condicion - Condición a cumplir
 * @param M - Población (Infinity para infinita)
 * @param kMax - Máximo k a probar (default: 30)
 */
export function optimizarK(
  lambda: number,
  mu: number,
  condicion: CondicionOptimizacion,
  M: number = Infinity,
  kMax: number = 30,
): ResultadoOptimizacion {
  const tabla: FilaOptimizacion[] = [];
  const desarrollo: PasoDesarrollo[] = [];
  let kMinEstable = Math.max(1, Math.ceil(lambda / mu));
  let kOptimo = kMinEstable;
  let metricasOptimas: MetricasCompletas | null = null;
  let costoMinimo = Infinity;

  desarrollo.push(crearPasoDesarrollo(
    "Condición de estabilidad",
    `k_min ≥ λ/μ = ${formatearNumero(lambda)}/${formatearNumero(mu)} = ${formatearNumero(lambda / mu)}`,
    "k mínimo para estabilidad",
    `k ≥ ${kMinEstable}`,
  ));

  for (let k = 1; k <= Math.min(kMax, M === Infinity ? kMax : M); k++) {
    const params: ParametrosSistema = {
      modelo: M < Infinity ? (k > 1 ? "MMKM" : "MM1M") : (k > 1 ? "MMK" : "MM1"),
      lambda,
      mu,
      k,
      M,
    };

    const metricas = calcularTodo(params);
    const cumple = metricas.estable && evaluarCondicion(metricas, condicion, k, M);
    let esCandidatoOptimo = false;

    if (condicion.tipo === "minimizar_costo" && metricas.estable) {
      const { costoTotal, costoServidor: cs, costoEspera: ce } = calcularCosto(
        metricas,
        k,
        condicion.costos,
      );

      const fila: FilaOptimizacion = {
        valor: k,
        estable: metricas.estable,
        rho: metricas.rho,
        P0: metricas.P0,
        Pk: metricas.Pk,
        Lq: metricas.Lq,
        L: metricas.L,
        Wq: metricas.Wq,
        W: metricas.W,
        costoTotal,
        costoServidor: cs,
        costoEspera: ce,
        cumpleCondicion: cumple,
        esOptimo: false,
      };
      tabla.push(fila);

      if (costoTotal < costoMinimo) {
        costoMinimo = costoTotal;
        kOptimo = k;
        metricasOptimas = metricas;
        esCandidatoOptimo = true;
      }
    } else {
      const fila: FilaOptimizacion = {
        valor: k,
        estable: metricas.estable,
        rho: metricas.rho,
        P0: metricas.P0,
        Pk: metricas.Pk,
        Lq: metricas.Lq,
        L: metricas.L,
        Wq: metricas.Wq,
        W: metricas.W,
        cumpleCondicion: cumple,
        esOptimo: false,
      };
      tabla.push(fila);

      if (cumple && !metricasOptimas) {
        kOptimo = k;
        metricasOptimas = metricas;
        esCandidatoOptimo = true;
      }
    }
  }

  // Marcar el óptimo
  for (const fila of tabla) {
    fila.esOptimo = fila.valor === kOptimo;
  }

  if (metricasOptimas) {
    desarrollo.push(crearPasoDesarrollo(
      "Resultado de optimización",
      `k óptimo = ${kOptimo}`,
      condicion.tipo === "minimizar_costo"
        ? `Costo mínimo: ${formatearNumero(costoMinimo)}`
        : `Primer k que cumple la condición`,
      `k = ${kOptimo}`,
    ));
  }

  return {
    valorOptimo: kOptimo,
    metricas: metricasOptimas ?? calcularTodo({ modelo: "MM1", lambda, mu, k: 1, M: Infinity }),
    tabla,
    desarrollo,
  };
}

// ─── Optimización de M (población) ────────────────────────────────────

/**
 * Encuentra el número óptimo de población (M) para un taller/sistema finito.
 * 
 * Útil para: "¿Cuántos montacargas asignar?", "¿Por cuántos aviones responder?"
 */
export function optimizarM(
  lambda: number,
  mu: number,
  k: number,
  condicion: CondicionOptimizacion,
  mMax: number = 50,
): ResultadoOptimizacion {
  const tabla: FilaOptimizacion[] = [];
  const desarrollo: PasoDesarrollo[] = [];
  let mOptimo = k + 1;
  let metricasOptimas: MetricasCompletas | null = null;
  let costoMinimo = Infinity;

  for (let M = k; M <= mMax; M++) {
    const params: ParametrosSistema = {
      modelo: k > 1 ? "MMKM" : "MM1M",
      lambda,
      mu,
      k,
      M,
    };

    const metricas = calcularTodo(params);
    const cumple = evaluarCondicion(metricas, condicion, k, M);

    if (condicion.tipo === "minimizar_costo") {
      const { costoTotal, costoServidor: cs, costoEspera: ce } = calcularCosto(
        metricas,
        k,
        condicion.costos,
      );

      tabla.push({
        valor: M,
        estable: true,
        rho: metricas.rho,
        P0: metricas.P0,
        Pk: metricas.Pk,
        Lq: metricas.Lq,
        L: metricas.L,
        Wq: metricas.Wq,
        W: metricas.W,
        costoTotal,
        costoServidor: cs,
        costoEspera: ce,
        cumpleCondicion: cumple,
        esOptimo: false,
      });

      if (costoTotal < costoMinimo) {
        costoMinimo = costoTotal;
        mOptimo = M;
        metricasOptimas = metricas;
      }
    } else {
      tabla.push({
        valor: M,
        estable: true,
        rho: metricas.rho,
        P0: metricas.P0,
        Pk: metricas.Pk,
        Lq: metricas.Lq,
        L: metricas.L,
        Wq: metricas.Wq,
        W: metricas.W,
        cumpleCondicion: cumple,
        esOptimo: false,
      });

      // Para M, queremos el MAYOR M que aún cumpla la condición
      // (más población asignada = más eficiente el taller)
      if (cumple) {
        mOptimo = M;
        metricasOptimas = metricas;
      }
    }
  }

  // Marcar el óptimo
  for (const fila of tabla) {
    fila.esOptimo = fila.valor === mOptimo;
  }

  if (metricasOptimas) {
    desarrollo.push(crearPasoDesarrollo(
      "Resultado de optimización de M",
      `M óptimo = ${mOptimo}`,
      "Máxima población que cumple la condición",
      `M = ${mOptimo}`,
    ));
  }

  return {
    valorOptimo: mOptimo,
    metricas: metricasOptimas ?? calcularTodo({ modelo: "MM1M", lambda, mu, k: 1, M: k + 1 }),
    tabla,
    desarrollo,
  };
}

// ─── Cálculo de costos completo ────────────────────────────────────────

export interface ResultadoCosto {
  costoServidor: number;
  costoEspera: number;
  costoTotal: number;
  desarrollo: PasoDesarrollo[];
}

/**
 * Calcula el costo total del sistema para un período dado.
 */
export function calcularCostoTotal(
  metricas: MetricasCompletas,
  k: number,
  costoServidorPorHora: number,
  costoEsperaPorHora: number,
  horasPeriodo: number,
  costoSobre: "cola" | "sistema" = "sistema",
): ResultadoCosto {
  const desarrollo: PasoDesarrollo[] = [];

  const cs = costoServidorPorHora * k * horasPeriodo;
  const L_o_Lq = costoSobre === "cola" ? metricas.Lq : metricas.L;
  const ce = costoEsperaPorHora * L_o_Lq * horasPeriodo;

  desarrollo.push(crearPasoDesarrollo(
    "Costo servidores",
    `Cs = ${formatearNumero(costoServidorPorHora)} × ${k} × ${horasPeriodo} h`,
    "Calcular",
    `$ ${formatearNumero(cs)}`,
  ));
  desarrollo.push(crearPasoDesarrollo(
    `Costo espera (sobre ${costoSobre === "cola" ? "Lq" : "L"})`,
    `Ce = ${formatearNumero(costoEsperaPorHora)} × ${formatearNumero(L_o_Lq)} × ${horasPeriodo} h`,
    "Calcular",
    `$ ${formatearNumero(ce)}`,
  ));
  desarrollo.push(crearPasoDesarrollo(
    "Costo total",
    `CT = Cs + Ce = ${formatearNumero(cs)} + ${formatearNumero(ce)}`,
    "Sumar",
    `$ ${formatearNumero(cs + ce)}`,
  ));

  return { costoServidor: cs, costoEspera: ce, costoTotal: cs + ce, desarrollo };
}
