/**
 * Motor de cálculo completo de teoría de colas.
 * 
 * Calcula TODAS las métricas de una sola vez para un sistema dado.
 * Esto permite resolver ejercicios completos sin recalcular P0 cada vez.
 * 
 * Soporta: MM1, MMK, MM1M (M/M/1/M/M), MMKM (M/M/k/M/M)
 */

import { crearPasoDesarrollo, formatearNumero } from "./desarrollo";
import type { PasoDesarrollo, ModeloCola } from "./tipos";

// ─── Utilidades matemáticas ────────────────────────────────────────────

export function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export function combinatoria(n: number, r: number): number {
  if (r > n || r < 0) return 0;
  return factorial(n) / (factorial(r) * factorial(n - r));
}

// ─── Tipos ─────────────────────────────────────────────────────────────

export interface ParametrosSistema {
  modelo: ModeloCola;
  /** Tasa de llegada (por hora) */
  lambda: number;
  /** Tasa de servicio POR SERVIDOR (por hora) */
  mu: number;
  /** Número de servidores (1 para MM1 y MM1M) */
  k: number;
  /** Tamaño de la población (Infinity para poblacion infinita) */
  M: number;
}

export interface MetricasCompletas {
  /** Modelo identificado */
  modelo: ModeloCola;
  /** Si el sistema es estable */
  estable: boolean;
  /** Factor de utilización del sistema: ρ = λ/(kμ) */
  rho: number;
  /** Factor de tráfico: a = λ/μ */
  a: number;

  // ─── Probabilidades ──────────────────────────────────────────────────
  /** P0: Probabilidad de sistema vacío */
  P0: number;
  /** Pn(n): función para calcular probabilidad de n clientes */
  Pn: (n: number) => number;
  /** Pk: Probabilidad de que una llegada tenga que esperar */
  Pk: number;

  // ─── Métricas de longitud ────────────────────────────────────────────
  /** L: Número esperado de clientes en el sistema */
  L: number;
  /** Lq: Número esperado de clientes en cola */
  Lq: number;
  /** Ln: Número esperado de clientes en cola no vacía */
  Ln: number;

  // ─── Métricas de tiempo (en horas) ───────────────────────────────────
  /** W: Tiempo medio en el sistema (horas) */
  W: number;
  /** Wq: Tiempo medio en cola (horas) */
  Wq: number;
  /** Wn: Tiempo medio en cola no vacía (horas) */
  Wn: number;

  // ─── Para población finita ───────────────────────────────────────────
  /** Lambda efectiva (para modelos de población finita) */
  lambdaEfectiva?: number;

  // ─── Desarrollo paso a paso ──────────────────────────────────────────
  desarrollo: PasoDesarrollo[];
  advertencias: string[];
}

// ─── Motor MM1 ─────────────────────────────────────────────────────────

function calcularTodoMM1(lambda: number, mu: number): MetricasCompletas {
  const rho = lambda / mu;
  const a = rho;
  const estable = rho < 1;
  const advertencias: string[] = [];
  const desarrollo: PasoDesarrollo[] = [];

  if (!estable) {
    advertencias.push("⚠ Sistema INESTABLE: ρ = λ/μ ≥ 1. Los resultados son teóricos.");
  }

  // P0
  const P0 = estable ? 1 - rho : 0;
  desarrollo.push(crearPasoDesarrollo(
    "P0 = 1 - ρ",
    `P0 = 1 - ${formatearNumero(rho)}`,
    "Calcular",
    formatearNumero(P0),
  ));

  // Pn función
  const Pn = (n: number): number => P0 * (rho ** n);

  // Pk = ρ (probabilidad de esperar = probabilidad de que el servidor esté ocupado)
  const Pk = rho;
  desarrollo.push(crearPasoDesarrollo(
    "Pk (prob. espera) = ρ",
    `Pk = ${formatearNumero(rho)}`,
    "En M/M/1, la prob. de esperar = ρ",
    formatearNumero(Pk),
  ));

  // L
  const L = estable ? lambda / (mu - lambda) : Infinity;
  desarrollo.push(crearPasoDesarrollo(
    "L = λ/(μ-λ)",
    `L = ${lambda}/(${mu}-${lambda}) = ${lambda}/${mu - lambda}`,
    "Calcular",
    formatearNumero(L),
  ));

  // Lq
  const Lq = estable ? (lambda ** 2) / (mu * (mu - lambda)) : Infinity;
  desarrollo.push(crearPasoDesarrollo(
    "Lq = λ²/[μ(μ-λ)]",
    `Lq = ${lambda}²/[${mu}×(${mu}-${lambda})]`,
    "Calcular",
    formatearNumero(Lq),
  ));

  // W
  const W = estable ? 1 / (mu - lambda) : Infinity;
  desarrollo.push(crearPasoDesarrollo(
    "W = 1/(μ-λ)",
    `W = 1/(${mu}-${lambda}) = ${formatearNumero(W)} horas`,
    "Calcular",
    `${formatearNumero(W)} h = ${formatearNumero(W * 60)} min`,
  ));

  // Wq
  const Wq = estable ? lambda / (mu * (mu - lambda)) : Infinity;
  desarrollo.push(crearPasoDesarrollo(
    "Wq = λ/[μ(μ-λ)]",
    `Wq = ${lambda}/[${mu}×(${mu}-${lambda})]`,
    "Calcular",
    `${formatearNumero(Wq)} h = ${formatearNumero(Wq * 60)} min`,
  ));

  // Ln (cola no vacía)
  const Ln = estable ? mu / (mu - lambda) : Infinity;

  // Wn (tiempo en cola no vacía)
  const Wn = estable ? 1 / (mu - lambda) : Infinity;

  return {
    modelo: "MM1",
    estable,
    rho,
    a,
    P0,
    Pn,
    Pk,
    L,
    Lq,
    Ln,
    W,
    Wq,
    Wn,
    desarrollo,
    advertencias,
  };
}

// ─── Motor MMK ─────────────────────────────────────────────────────────

function calcularTodoMMK(lambda: number, mu: number, k: number): MetricasCompletas {
  const a = lambda / mu;
  const rho = lambda / (k * mu);
  const estable = rho < 1;
  const advertencias: string[] = [];
  const desarrollo: PasoDesarrollo[] = [];

  if (!estable) {
    advertencias.push("⚠ Sistema INESTABLE: ρ = λ/(kμ) ≥ 1. Los resultados son teóricos.");
  }

  desarrollo.push(crearPasoDesarrollo(
    "Datos normalizados",
    `λ = ${formatearNumero(lambda)} c/h, μ = ${formatearNumero(mu)} c/h, k = ${k}`,
    "Datos de entrada",
    "",
  ));
  desarrollo.push(crearPasoDesarrollo(
    "Factor de tráfico",
    `a = λ/μ = ${formatearNumero(lambda)}/${formatearNumero(mu)} = ${formatearNumero(a)}`,
    "Calcular",
    formatearNumero(a),
  ));
  desarrollo.push(crearPasoDesarrollo(
    "Factor de utilización",
    `ρ = λ/(kμ) = ${formatearNumero(lambda)}/(${k}×${formatearNumero(mu)}) = ${formatearNumero(rho)}`,
    "Calcular",
    formatearNumero(rho),
  ));

  // P0
  let sumaP0 = 0;
  for (let n = 0; n < k; n++) {
    sumaP0 += (a ** n) / factorial(n);
  }
  const colaTermino = ((a ** k) / factorial(k)) * (1 / (1 - rho));
  const P0 = estable ? 1 / (sumaP0 + colaTermino) : 0;

  desarrollo.push(crearPasoDesarrollo(
    "P0 = [Σ(a^n/n!) + a^k/(k!(1-ρ))]⁻¹",
    `Σ = ${formatearNumero(sumaP0)}, cola = ${formatearNumero(colaTermino)}`,
    "Calcular",
    formatearNumero(P0),
  ));

  // Pn
  const Pn = (n: number): number => {
    if (n < 0) return 0;
    if (n < k) {
      return ((a ** n) / factorial(n)) * P0;
    }
    return ((a ** n) / (factorial(k) * (k ** (n - k)))) * P0;
  };

  // Pk — Erlang C: probabilidad de que una llegada deba esperar
  const Pk = estable
    ? ((a ** k) / (factorial(k) * (1 - rho))) * P0
    : 1;
  desarrollo.push(crearPasoDesarrollo(
    "Pk (Erlang C) = [a^k / (k!(1-ρ))] × P0",
    `Pk = [${formatearNumero(a)}^${k} / (${k}!×(1-${formatearNumero(rho)}))] × ${formatearNumero(P0)}`,
    "Probabilidad de que una llegada espere",
    formatearNumero(Pk),
  ));

  // Lq
  const Lq = estable
    ? (P0 * (a ** k) * rho) / (factorial(k) * ((1 - rho) ** 2))
    : Infinity;
  desarrollo.push(crearPasoDesarrollo(
    "Lq = P0 × a^k × ρ / [k! × (1-ρ)²]",
    `Lq = ${formatearNumero(P0)} × ${formatearNumero(a)}^${k} × ${formatearNumero(rho)} / [${k}! × (1-${formatearNumero(rho)})²]`,
    "Calcular",
    `${formatearNumero(Lq)} clientes`,
  ));

  // L
  const L = estable ? Lq + a : Infinity;
  desarrollo.push(crearPasoDesarrollo(
    "L = Lq + λ/μ",
    `L = ${formatearNumero(Lq)} + ${formatearNumero(a)}`,
    "Calcular",
    `${formatearNumero(L)} clientes`,
  ));

  // Wq
  const Wq = estable ? Lq / lambda : Infinity;
  desarrollo.push(crearPasoDesarrollo(
    "Wq = Lq/λ",
    `Wq = ${formatearNumero(Lq)}/${formatearNumero(lambda)}`,
    "Calcular",
    `${formatearNumero(Wq)} h = ${formatearNumero(Wq * 60)} min`,
  ));

  // W
  const W = estable ? Wq + 1 / mu : Infinity;
  desarrollo.push(crearPasoDesarrollo(
    "W = Wq + 1/μ",
    `W = ${formatearNumero(Wq)} + 1/${formatearNumero(mu)}`,
    "Calcular",
    `${formatearNumero(W)} h = ${formatearNumero(W * 60)} min`,
  ));

  // Ln (cola no vacía)
  const Ln = Pk > 0 ? Lq / Pk : 0;

  // Wn (tiempo cola no vacía)
  const Wn = Pk > 0 ? Wq / Pk : 0;

  return {
    modelo: "MMK",
    estable,
    rho,
    a,
    P0,
    Pn,
    Pk,
    L,
    Lq,
    Ln,
    W,
    Wq,
    Wn,
    desarrollo,
    advertencias,
  };
}

// ─── Motor MM1M (población finita, 1 servidor) ────────────────────────

function calcularTodoMM1M(lambda: number, mu: number, M: number): MetricasCompletas {
  const a = lambda / mu;
  const advertencias: string[] = [];
  const desarrollo: PasoDesarrollo[] = [];

  desarrollo.push(crearPasoDesarrollo(
    "Datos normalizados",
    `λ = ${formatearNumero(lambda)} c/h, μ = ${formatearNumero(mu)} c/h, M = ${M}`,
    "Población finita, 1 servidor",
    "",
  ));

  // P0
  let sumaP0 = 0;
  for (let n = 0; n <= M; n++) {
    sumaP0 += (a ** n) * factorial(M) / factorial(M - n);
  }
  const P0 = 1 / sumaP0;

  desarrollo.push(crearPasoDesarrollo(
    "P0 = [Σ (λ/μ)^n × M!/(M-n)!]⁻¹",
    `n = 0..${M}, a = ${formatearNumero(a)}`,
    "Calcular",
    formatearNumero(P0),
  ));

  // Pn
  const Pn = (n: number): number => {
    if (n < 0 || n > M) return 0;
    return ((a ** n) * factorial(M) / factorial(M - n)) * P0;
  };

  // L
  const L = M - (mu / lambda) * (1 - P0);
  desarrollo.push(crearPasoDesarrollo(
    "L = M - (μ/λ)(1-P0)",
    `L = ${M} - (${formatearNumero(mu)}/${formatearNumero(lambda)})(1-${formatearNumero(P0)})`,
    "Calcular",
    `${formatearNumero(L)} clientes`,
  ));

  // Lq
  const Lq = L - (1 - P0);
  desarrollo.push(crearPasoDesarrollo(
    "Lq = L - (1-P0)",
    `Lq = ${formatearNumero(L)} - (1-${formatearNumero(P0)})`,
    "Calcular",
    `${formatearNumero(Lq)} clientes`,
  ));

  // λ efectiva
  const lambdaEfectiva = mu * (1 - P0);
  desarrollo.push(crearPasoDesarrollo(
    "λ_ef = μ(1-P0)",
    `λ_ef = ${formatearNumero(mu)}×(1-${formatearNumero(P0)})`,
    "Tasa efectiva de llegada",
    formatearNumero(lambdaEfectiva),
  ));

  // W (usando λ efectiva)
  const W = lambdaEfectiva > 0 ? L / lambdaEfectiva : Infinity;
  desarrollo.push(crearPasoDesarrollo(
    "W = L/λ_ef",
    `W = ${formatearNumero(L)}/${formatearNumero(lambdaEfectiva)}`,
    "Calcular",
    `${formatearNumero(W)} h = ${formatearNumero(W * 60)} min`,
  ));

  // Wq
  const Wq = lambdaEfectiva > 0 ? Lq / lambdaEfectiva : Infinity;
  desarrollo.push(crearPasoDesarrollo(
    "Wq = Lq/λ_ef",
    `Wq = ${formatearNumero(Lq)}/${formatearNumero(lambdaEfectiva)}`,
    "Calcular",
    `${formatearNumero(Wq)} h = ${formatearNumero(Wq * 60)} min`,
  ));

  // Pk (probabilidad de esperar = probabilidad de sistema no vacío cuando k=1)
  const Pk = 1 - P0;

  // rho
  const rho = lambdaEfectiva / mu;

  // Ln (cola no vacía)
  const Ln = Pk > 0 ? Lq / Pk : 0;

  // Wn
  const Wn = Pk > 0 ? Wq / Pk : 0;

  return {
    modelo: "MM1M",
    estable: true, // Modelos de población finita siempre son estables
    rho,
    a,
    P0,
    Pn,
    Pk,
    L,
    Lq,
    Ln,
    W,
    Wq,
    Wn,
    lambdaEfectiva,
    desarrollo,
    advertencias,
  };
}

// ─── Motor MMKM (población finita, k servidores) ──────────────────────

function calcularTodoMMKM(lambda: number, mu: number, k: number, M: number): MetricasCompletas {
  const a = lambda / mu;
  const advertencias: string[] = [];
  const desarrollo: PasoDesarrollo[] = [];

  if (k > M) {
    advertencias.push("k > M: número de servidores mayor que la población. Se usará k = M.");
    k = M;
  }

  desarrollo.push(crearPasoDesarrollo(
    "Datos normalizados",
    `λ = ${formatearNumero(lambda)} c/h, μ = ${formatearNumero(mu)} c/h, k = ${k}, M = ${M}`,
    "Población finita, k servidores",
    "",
  ));

  // P0
  let sumaP0 = 0;
  for (let n = 0; n <= M; n++) {
    if (n < k) {
      sumaP0 += ((a ** n) * factorial(M)) / (factorial(M - n) * factorial(n));
    } else {
      sumaP0 += ((a ** n) * factorial(M)) / (factorial(M - n) * factorial(k) * (k ** (n - k)));
    }
  }
  const P0 = 1 / sumaP0;

  desarrollo.push(crearPasoDesarrollo(
    "P0 (población finita, k servidores)",
    `Σ completa = ${formatearNumero(sumaP0)}`,
    "Calcular",
    formatearNumero(P0),
  ));

  // Pn
  const Pn = (n: number): number => {
    if (n < 0 || n > M) return 0;
    if (n < k) {
      return ((a ** n) * factorial(M) / (factorial(M - n) * factorial(n))) * P0;
    }
    return ((a ** n) * factorial(M) / (factorial(M - n) * factorial(k) * (k ** (n - k)))) * P0;
  };

  // L = Σ n × Pn
  let L = 0;
  for (let n = 1; n <= M; n++) {
    L += n * Pn(n);
  }
  desarrollo.push(crearPasoDesarrollo(
    "L = Σ n × Pn",
    `n = 1..${M}`,
    "Calcular",
    `${formatearNumero(L)} clientes`,
  ));

  // Lq = Σ (n-k) × Pn para n > k
  let Lq = 0;
  for (let n = k + 1; n <= M; n++) {
    Lq += (n - k) * Pn(n);
  }
  desarrollo.push(crearPasoDesarrollo(
    "Lq = Σ (n-k) × Pn",
    `n = ${k + 1}..${M}`,
    "Calcular",
    `${formatearNumero(Lq)} clientes`,
  ));

  // λ efectiva = Σ (M-n) × λ × Pn para n=0..M-1
  // Para población finita: λ_ef = μ × (L - Lq) si k servidores
  // Alternativa: λ_ef = λ(M - L) usando la fórmula simplificada
  const lambdaEfectiva = lambda * (M - L);
  desarrollo.push(crearPasoDesarrollo(
    "λ_ef = λ(M-L)",
    `λ_ef = ${formatearNumero(lambda)}×(${M}-${formatearNumero(L)})`,
    "Tasa efectiva de llegada",
    formatearNumero(lambdaEfectiva),
  ));

  // W
  const W = lambdaEfectiva > 0 ? L / lambdaEfectiva : Infinity;
  desarrollo.push(crearPasoDesarrollo(
    "W = L/λ_ef",
    `W = ${formatearNumero(L)}/${formatearNumero(lambdaEfectiva)}`,
    "Calcular",
    `${formatearNumero(W)} h = ${formatearNumero(W * 60)} min`,
  ));

  // Wq
  const Wq = lambdaEfectiva > 0 ? Lq / lambdaEfectiva : Infinity;
  desarrollo.push(crearPasoDesarrollo(
    "Wq = Lq/λ_ef",
    `Wq = ${formatearNumero(Lq)}/${formatearNumero(lambdaEfectiva)}`,
    "Calcular",
    `${formatearNumero(Wq)} h = ${formatearNumero(Wq * 60)} min`,
  ));

  // Pk — probabilidad de que una llegada espere (todos servidores ocupados)
  let Pk = 0;
  for (let n = k; n <= M; n++) {
    Pk += Pn(n);
  }
  desarrollo.push(crearPasoDesarrollo(
    "Pk = Σ Pn para n ≥ k",
    `Pk = Σ P${k}..P${M}`,
    "Probabilidad de esperar",
    formatearNumero(Pk),
  ));

  // rho (utilización promedio de servidores)
  const servidoresOcupados = L - Lq;
  const rho = servidoresOcupados / k;

  // Ln (cola no vacía)
  const Ln = Pk > 0 ? Lq / Pk : 0;

  // Wn
  const Wn = Pk > 0 ? Wq / Pk : 0;

  return {
    modelo: "MMKM",
    estable: true,
    rho,
    a,
    P0,
    Pn,
    Pk,
    L,
    Lq,
    Ln,
    W,
    Wq,
    Wn,
    lambdaEfectiva,
    desarrollo,
    advertencias,
  };
}

// ─── API principal ─────────────────────────────────────────────────────

/**
 * Calcula TODAS las métricas del sistema de colas dado.
 * 
 * @param params - Parámetros del sistema
 * @returns Todas las métricas calculadas con desarrollo paso a paso
 */
export function calcularTodo(params: ParametrosSistema): MetricasCompletas {
  const { lambda, mu, k, M } = params;

  // Auto-detectar modelo si no se especifica o confirmar
  const esFinita = M < Infinity && M > 0;
  const esMulticanal = k > 1;

  if (esFinita && esMulticanal) {
    return calcularTodoMMKM(lambda, mu, k, M);
  } else if (esFinita) {
    return calcularTodoMM1M(lambda, mu, M);
  } else if (esMulticanal) {
    return calcularTodoMMK(lambda, mu, k);
  } else {
    return calcularTodoMM1(lambda, mu);
  }
}

/**
 * Dado un sistema, calcula la probabilidad acumulada P(N >= n).
 */
export function probAcumuladaMayorIgual(metricas: MetricasCompletas, n: number, M?: number): number {
  // Para modelos finitos
  if (M !== undefined && M < Infinity) {
    let suma = 0;
    for (let i = n; i <= M; i++) {
      suma += metricas.Pn(i);
    }
    return suma;
  }
  // Para modelos infinitos (MM1, MMK)
  if (metricas.modelo === "MM1") {
    return metricas.rho ** n;
  }
  // Para MMK, sumamos Pn desde n hasta un número grande
  let suma = 0;
  for (let i = n; i <= n + 200; i++) {
    const pi = metricas.Pn(i);
    suma += pi;
    if (pi < 1e-15) break;
  }
  return suma;
}

/**
 * Calcula la probabilidad exacta de que haya exactamente n clientes esperando (en cola, no siendo servidos).
 * P(cola = m) = P(N = k+m)  donde k = servidores
 */
export function probEsperandoExacto(metricas: MetricasCompletas, k: number, m: number): number {
  return metricas.Pn(k + m);
}

/**
 * P(más de m clientes esperando) = P(N > k+m)
 */
export function probMasDeEsperando(metricas: MetricasCompletas, k: number, m: number, M?: number): number {
  return probAcumuladaMayorIgual(metricas, k + m + 1, M);
}

/**
 * P(al menos un servidor libre) = P(N < k) = Σ Pn para n=0..k-1
 * 
 * Clave para ejercicios como:
 * "Tiempo diario que pasan desocupados uno o ambos operarios"
 * = P(N < k) × horasDiarias × 60
 */
export function probAlMenosUnServidorLibre(metricas: MetricasCompletas, k: number, M?: number): number {
  let suma = 0;
  const limite = M !== undefined && M < Infinity ? Math.min(k - 1, M) : k - 1;
  for (let n = 0; n <= limite; n++) {
    suma += metricas.Pn(n);
  }
  return suma;
}

/**
 * Minutos diarios que hay al menos un servidor libre.
 * = P(N < k) × horasDiarias × 60
 * 
 * Para ejercicio 12c: (P0 + P1) × 8 × 60 = 138.67 min/día
 */
export function minutosDiariosAlMenosUnServidorLibre(
  metricas: MetricasCompletas,
  k: number,
  horasDiarias: number,
  M?: number,
): { valor: number; fraccion: number; pasos: import("./tipos").PasoDesarrollo[] } {
  const fraccion = probAlMenosUnServidorLibre(metricas, k, M);
  const valor = fraccion * horasDiarias * 60;
  const pasos: import("./tipos").PasoDesarrollo[] = [];

  // Mostrar el detalle de cada Pn sumado
  let desglose = "";
  for (let n = 0; n < k; n++) {
    const pn = metricas.Pn(n);
    desglose += `P${n}=${formatearNumero(pn)}`;
    if (n < k - 1) desglose += " + ";
  }

  pasos.push(crearPasoDesarrollo(
    `P(N<${k}) = Σ Pn para n=0..${k - 1}`,
    `= ${desglose}`,
    "Al menos un servidor libre",
    `${formatearNumero(fraccion * 100)}%`,
  ));
  pasos.push(crearPasoDesarrollo(
    `Minutos/día = P(N<${k}) × H × 60`,
    `= ${formatearNumero(fraccion)} × ${horasDiarias} × 60`,
    "Calcular",
    `${formatearNumero(valor)} min/día`,
  ));

  return { valor, fraccion, pasos };
}
