/**
 * Motor de cálculo para modelos de colas con servidores heterogéneos.
 * 
 * Soporta: M/M/k con servidores no idénticos (tasas μ distintas)
 * y población finita (M/M/k/M con servidores heterogéneos).
 * 
 * Se resuelve mediante el enfoque de estados (birth-death process)
 * ya que no existen fórmulas cerradas para servidores con tasas distintas.
 * 
 * Ejercicio 20: 2 técnicos con μ distintos atendiendo montacargas.
 * Ejercicio 23.f: Unificar atención de dos técnicos heterogéneos.
 */

import { crearPasoDesarrollo, formatearNumero } from "./desarrollo";
import type { PasoDesarrollo } from "./tipos";

// ─── Tipos ─────────────────────────────────────────────────────────────

export interface ParametrosHeterogeneo {
  /** Tasa de llegada base (por hora) */
  lambda: number;
  /** Tasas de servicio POR SERVIDOR (por hora) - pueden ser distintas */
  mus: number[];
  /** Tamaño de la población (Infinity para población infinita) */
  M: number;
}

export interface MetricasHeterogeneo {
  /** Si el sistema es estable (siempre true para finitos) */
  estable: boolean;
  /** Número de servidores */
  k: number;
  
  // ─── Probabilidades ──────────────────────────────────────────────────
  /** P0: Probabilidad de sistema vacío */
  P0: number;
  /** Pn(n): función para calcular probabilidad de n clientes en sistema */
  Pn: (n: number) => number;
  /** Pk: Probabilidad de que una llegada deba esperar (todos ocupados) */
  Pk: number;
  /** P(al menos un servidor libre) = P(N < k) */
  P_al_menos_un_libre: number;

  // ─── Métricas de longitud ────────────────────────────────────────────
  /** L: Número esperado de clientes en el sistema */
  L: number;
  /** Lq: Número esperado de clientes en cola */
  Lq: number;
  /** Ln: Número esperado de clientes en cola no vacía */
  Ln: number;
  /** Número de servidores ocupados en promedio */
  servidoresOcupados: number;

  // ─── Métricas de tiempo (en horas) ───────────────────────────────────
  /** W: Tiempo medio en el sistema (horas) */
  W: number;
  /** Wq: Tiempo medio en cola (horas) */
  Wq: number;
  /** Wn: Tiempo medio en cola no vacía (horas) */
  Wn: number;

  // ─── Para población finita ───────────────────────────────────────────
  /** Lambda efectiva (tasa de llegada efectiva) */
  lambdaEfectiva?: number;
  /** Número en operación (M - L) para población finita */
  enOperacion?: number;
  /** Fracción en operación */
  fraccionOperacion?: number;

  // ─── Probabilidades específicas heterogéneas ──────────────────────
  /** P(ambos ocupados simultáneamente) - para 2 servidores */
  P_ambos_ocupados?: number;
  /** P(alguno disponible) = 1 - P(todos ocupados) */
  P_alguno_disponible?: number;

  // ─── Desarrollo paso a paso ──────────────────────────────────────────
  desarrollo: PasoDesarrollo[];
  advertencias: string[];
}

// ─── Funciones auxiliares ─────────────────────────────────────────────

/**
 * Obtiene la tasa de servicio para el estado n.
 * 
 * Política: "entra primero al más rápido"
 * - Estado 0: 0 (nadie atiende)
 * - Estado 1: μ_máx (el servidor más rápido)
 * - Estado n >= 2: Σ μ_i (todos los servidores ocupados)
 * 
 * Para el caso general con k servidores:
 * - Los estados n <= k usan los n servidores más rápidos
 * - Los estados n > k usan todos los k servidores
 */
function tasaServicio(n: number, musOrdenadas: number[]): number {
  if (n <= 0) return 0;
  if (n >= musOrdenadas.length) {
    // Todos los servidores ocupados
    return musOrdenadas.reduce((sum, mu) => sum + mu, 0);
  }
  // n servidores más rápidos
  return musOrdenadas.slice(0, n).reduce((sum, mu) => sum + mu, 0);
}

/**
 * Calcula todas las métricas para servidores heterogéneos.
 * 
 * @param params - Parámetros del sistema con mus[] distintas
 * @returns Métricas completas
 */
export function calcularHeterogeneo(params: ParametrosHeterogeneo): MetricasHeterogeneo {
  const { lambda, mus, M } = params;
  const k = mus.length;
  
  // Ordenar mus de mayor a menor (más rápido primero)
  const musOrdenadas = [...mus].sort((a, b) => b - a);
  
  const advertencias: string[] = [];
  const desarrollo: PasoDesarrollo[] = [];

  const esFinita = M < Infinity && M > 0;
  const M_max = esFinita ? M : 200; // Para infinitos, usamos un límite grande

  desarrollo.push(crearPasoDesarrollo(
    "Datos del sistema heterogéneo",
    `λ = ${formatearNumero(lambda)} c/h, μ = [${mus.map(m => formatearNumero(m)).join(", ")}] c/h, k = ${k}, M = ${esFinita ? M : "∞"}`,
    "Servidores con tasas distintas",
    "",
  ));

  desarrollo.push(crearPasoDesarrollo(
    "Ordenar servidores (más rápido primero)",
    `μ ordenadas = [${musOrdenadas.map(m => formatearNumero(m)).join(", ")}]`,
    "Política: entra primero al más rápido",
    "",
  ));

  // ─── Calcular P0 ─────────────────────────────────────────────────────
  
  // Para población finita:
  // P0 = 1 / [1 + Σ(n=1..M) Π(i=0..n-1) λ_i / μ_{i+1}]
  // donde λ_i = (M-i)*λ para finitos, o λ para infinitos
  
  // Para infinitos:
  // P0 = 1 / [1 + Σ(n=1..∞) λ^n / (μ_1 * μ_2 * ... * μ_min(n,k))]

  let sumaP0 = 1; // El término n=0 es 1
  const probabilidades: number[] = [1]; // p0 = se calculará después

  if (esFinita) {
    // Población finita
    for (let n = 1; n <= M; n++) {
      let producto = 1;
      for (let i = 0; i < n; i++) {
        const lambda_i = (M - i) * lambda;
        const mu_i = tasaServicio(i + 1, musOrdenadas);
        producto *= lambda_i / mu_i;
      }
      sumaP0 += producto;
    }
  } else {
    // Población infinita (aproximación con M_max estados)
    for (let n = 1; n <= M_max; n++) {
      let producto = 1;
      for (let i = 0; i < n; i++) {
        const mu_i = tasaServicio(i + 1, musOrdenadas);
        producto *= lambda / mu_i;
      }
      sumaP0 += producto;
      
      // Si el término es muy pequeño, parar
      if (producto < 1e-15) break;
    }
  }

  const P0 = 1 / sumaP0;
  
  desarrollo.push(crearPasoDesarrollo(
    "P0 = 1 / Σ (Π λ_i/μ_i)",
    `Σ = ${formatearNumero(sumaP0)}`,
    "Calcular",
    formatearNumero(P0),
  ));

  // ─── Calcular Pn para todos los estados ──────────────────────────────
  
  const Pn_array: number[] = [P0];
  
  if (esFinita) {
    for (let n = 1; n <= M; n++) {
      let producto = 1;
      for (let i = 0; i < n; i++) {
        const lambda_i = (M - i) * lambda;
        const mu_i = tasaServicio(i + 1, musOrdenadas);
        producto *= lambda_i / mu_i;
      }
      Pn_array.push(P0 * producto);
    }
  } else {
    for (let n = 1; n <= M_max; n++) {
      let producto = 1;
      for (let i = 0; i < n; i++) {
        const mu_i = tasaServicio(i + 1, musOrdenadas);
        producto *= lambda / mu_i;
      }
      const pn = P0 * producto;
      Pn_array.push(pn);
      
      // Si el término es muy pequeño, parar
      if (pn < 1e-15) break;
    }
  }

  // Función Pn
  const Pn = (n: number): number => {
    if (n < 0) return 0;
    if (n < Pn_array.length) return Pn_array[n];
    return 0; // Fuera del rango calculado
  };

  // ─── Calcular L (longitud promedio) ─────────────────────────────────
  
  let L = 0;
  const limiteL = esFinita ? M : Pn_array.length - 1;
  
  for (let n = 1; n <= limiteL; n++) {
    L += n * Pn(n);
  }

  desarrollo.push(crearPasoDesarrollo(
    "L = Σ n × Pn",
    `n = 1..${limiteL}`,
    "Calcular",
    `${formatearNumero(L)} clientes`,
  ));

  // ─── Calcular Pk (probabilidad de esperar = todos ocupados) ─────────
  
  let Pk = 0;
  const limitePk = esFinita ? M : Pn_array.length - 1;
  
  for (let n = k; n <= limitePk; n++) {
    Pk += Pn(n);
  }

  desarrollo.push(crearPasoDesarrollo(
    "Pk = Σ Pn para n ≥ k",
    `Pk = Σ P${k}..P${limitePk}`,
    "Probabilidad de que todos los servidores estén ocupados",
    formatearNumero(Pk),
  ));

  // ─── Calcular Lq (longitud en cola) ─────────────────────────────────
  
  let Lq = 0;
  const limiteLq = esFinita ? M : Pn_array.length - 1;
  
  for (let n = k + 1; n <= limiteLq; n++) {
    Lq += (n - k) * Pn(n);
  }

  desarrollo.push(crearPasoDesarrollo(
    "Lq = Σ (n-k) × Pn",
    `n = ${k + 1}..${limiteLq}`,
    "Calcular",
    `${formatearNumero(Lq)} clientes`,
  ));

  // ─── Servidores ocupados promedio ────────────────────────────────────
  
  const servidoresOcupados = L - Lq;

  // ─── Lambda efectiva (para población finita) ───────────────────────
  
  let lambdaEfectiva: number | undefined = undefined;
  
  if (esFinita) {
    // λ_ef = λ × (M - L) para población finita
    lambdaEfectiva = lambda * (M - L);
    
    desarrollo.push(crearPasoDesarrollo(
      "λ_ef = λ(M-L)",
      `λ_ef = ${formatearNumero(lambda)}×(${M}-${formatearNumero(L)})`,
      "Tasa efectiva de llegada",
      formatearNumero(lambdaEfectiva),
    ));
  } else {
    // Para infinitos, λ_ef = λ
    lambdaEfectiva = lambda;
  }

  // ─── Tiempos W y Wq ─────────────────────────────────────────────────
  
  const W = lambdaEfectiva > 0 ? L / lambdaEfectiva : Infinity;
  const Wq = lambdaEfectiva > 0 ? Lq / lambdaEfectiva : Infinity;

  desarrollo.push(crearPasoDesarrollo(
    "W = L/λ_ef",
    `W = ${formatearNumero(L)}/${formatearNumero(lambdaEfectiva ?? 0)}`,
    "Calcular",
    `${formatearNumero(W)} h = ${formatearNumero(W * 60)} min`,
  ));

  desarrollo.push(crearPasoDesarrollo(
    "Wq = Lq/λ_ef",
    `Wq = ${formatearNumero(Lq)}/${formatearNumero(lambdaEfectiva ?? 0)}`,
    "Calcular",
    `${formatearNumero(Wq)} h = ${formatearNumero(Wq * 60)} min`,
  ));

  // ─── Ln y Wn (cola no vacía) ──────────────────────────────────────
  
  const Ln = Pk > 0 ? Lq / Pk : 0;
  const Wn = Pk > 0 ? Wq / Pk : 0;

  // ─── Probabilidades específicas ─────────────────────────────────────
  
  // P(al menos un servidor libre) = P(N < k)
  let P_al_menos_un_libre = 0;
  for (let n = 0; n < k; n++) {
    P_al_menos_un_libre += Pn(n);
  }

  // P(ambos ocupados) - solo para 2 servidores
  let P_ambos_ocupados: number | undefined = undefined;
  if (k === 2) {
    P_ambos_ocupados = Pk; // Cuando ambos están ocupados = n >= 2
  }

  const P_alguno_disponible = 1 - Pk;

  // ─── Métricas de población finita ───────────────────────────────────
  
  let enOperacion: number | undefined = undefined;
  let fraccionOperacion: number | undefined = undefined;

  if (esFinita) {
    enOperacion = M - L;
    fraccionOperacion = (M - L) / M;

    desarrollo.push(crearPasoDesarrollo(
      "En operación = M - L",
      `= ${M} - ${formatearNumero(L)}`,
      "Calcular",
      `${formatearNumero(enOperacion)} unidades`,
    ));

    desarrollo.push(crearPasoDesarrollo(
      "Fracción en operación = (M-L)/M",
      `= (${M}-${formatearNumero(L)})/${M}`,
      "Calcular",
      `${formatearNumero(fraccionOperacion * 100)}%`,
    ));
  }

  return {
    estable: true, // Siempre estable para finitos; para infinitos verificar
    k,
    P0,
    Pn,
    Pk,
    P_al_menos_un_libre,
    L,
    Lq,
    Ln,
    servidoresOcupados,
    W,
    Wq,
    Wn,
    lambdaEfectiva,
    enOperacion,
    fraccionOperacion,
    P_ambos_ocupados,
    P_alguno_disponible,
    desarrollo,
    advertencias,
  };
}

/**
 * Encuentra el número óptimo de población M para cumplir una condición
 * en un sistema con servidores heterogéneos.
 * 
 * Ejercicio 20.a: "¿Cuántos montacargas para que al menos 20% no esperen?"
 */
export function optimizarMHeterogeneo(
  lambda: number,
  mus: number[],
  condicion: { tipo: "fraccion_no_espera_minima" | "P0_minimo" | "fraccion_operacion_minima"; valor: number },
  mMax: number = 50,
): { valorOptimo: number; tabla: { M: number; P0: number; Pk: number; L: number; enOperacion: number; fraccionNoEspera: number; cumple: boolean }[] } {
  const tabla: { M: number; P0: number; Pk: number; L: number; enOperacion: number; fraccionNoEspera: number; cumple: boolean }[] = [];
  let valorOptimo = mus.length; // Al menos k

  for (let M = mus.length; M <= mMax; M++) {
    const metricas = calcularHeterogeneo({ lambda, mus, M });
    
    const fraccionNoEspera = 1 - metricas.Pk;
    const cumple = condicion.tipo === "fraccion_no_espera_minima" 
      ? fraccionNoEspera >= condicion.valor
      : condicion.tipo === "P0_minimo"
        ? metricas.P0 >= condicion.valor
        : condicion.tipo === "fraccion_operacion_minima"
          ? (metricas.fraccionOperacion ?? 0) >= condicion.valor
          : false;

    tabla.push({
      M,
      P0: metricas.P0,
      Pk: metricas.Pk,
      L: metricas.L,
      enOperacion: metricas.enOperacion ?? 0,
      fraccionNoEspera,
      cumple,
    });

    if (cumple && valorOptimo < M) {
      valorOptimo = M;
    }
  }

  return { valorOptimo, tabla };
}
