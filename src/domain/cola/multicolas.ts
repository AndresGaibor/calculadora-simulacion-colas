/**
 * Motor para múltiples colas independientes.
 * 
 * Calcula métricas agregadas para sistemas donde hay múltiples
 * colas/sistemas independientes operando en paralelo.
 * 
 * Útil para:
 * - Ejercicio 18: Dos cajas independientes en un banco
 * - Ejercicio 23 a-e: Dos técnicos separados en un taller
 * 
 * Fórmulas de agregación:
 * - Lq_total = Σ Lq_i
 * - L_total = Σ L_i
 * - P(alguna cola con espera) = 1 - Π(1 - Pk_i)
 * - Horas ociosas totales = Σ (P0_i × H)
 * - P(todas vacías simultáneamente) = Π P0_i
 */

import type { MetricasCompletas } from "./calcular-todo";
import { crearPasoDesarrollo, formatearNumero } from "./desarrollo";
import type { PasoDesarrollo } from "./tipos";

// ─── Tipos ─────────────────────────────────────────────────────────────

export interface SistemaCola {
  /** Identificador para mostrar */
  id: string;
  nombre: string;
  /** Métricas calculadas del sistema individual */
  metricas: MetricasCompletas;
  /** Jornada laboral del sistema */
  horasDiarias?: number;
}

export interface MetricasMultiCola {
  /** Número de sistemas */
  n: number;
  
  // ─── Métricas agregadas ────────────────────────────────────────────
  
  /** Lq total = Σ Lq_i */
  LqTotal: number;
  /** L total = Σ L_i */
  LTotal: number;
  /** Probabilidad de que alguna cola tenga espera */
  P_alguna_cola_con_espera: number;
  /** Probabilidad de que TODAS estén vacías simultáneamente */
  P_todas_vacias: number;
  /** Horas totales que el sistema está vacío (Σ P0_i × H_i) */
  horas_totales_vacio: number;
  /** Clientes totales que esperan por día */
  clientes_esperando_dia: number;
  
  // ─── Detalle por sistema ───────────────────────────────────────────
  
  /** Resultados por sistema individual */
  detalles: {
    id: string;
    nombre: string;
    Lq: number;
    L: number;
    Pk: number;
    P0: number;
    horasVacio: number;
  }[];
  
  // ─── Desarrollo paso a paso ────────────────────────────────────────
  desarrollo: PasoDesarrollo[];
}

// ─── Funciones ─────────────────────────────────────────────────────────

/**
 * Calcula métricas agregadas para múltiples colas independientes.
 */
export function calcularMultiCola(sistemas: SistemaCola[]): MetricasMultiCola {
  const desarrollo: PasoDesarrollo[] = [];
  
  desarrollo.push(crearPasoDesarrollo(
    "Sistemas independientes",
    `${sistemas.length} sistemas en paralelo`,
    "Identificar",
    "",
  ));

  let LqTotal = 0;
  let LTotal = 0;
  let prodP0 = 1;
  let prodNoEspera = 1;
  let horasTotalesVacio = 0;
  let clientesEsperandoDia = 0;

  const detalles: MetricasMultiCola["detalles"] = [];

  sistemas.forEach((sis, idx) => {
    const { metricas, horasDiarias = 8, nombre } = sis;
    
    LqTotal += metricas.Lq;
    LTotal += metricas.L;
    prodP0 *= metricas.P0;
    prodNoEspera *= (1 - metricas.Pk);
    
    const horasVacio = metricas.P0 * horasDiarias;
    horasTotalesVacio += horasVacio;
    
    const cliEsperando = metricas.Pk * horasDiarias * metricas.lambdaEfectiva ?? metricas.Lq * 8;
    clientesEsperandoDia += cliEsperando;

    detalles.push({
      id: sis.id,
      nombre,
      Lq: metricas.Lq,
      L: metricas.L,
      Pk: metricas.Pk,
      P0: metricas.P0,
      horasVacio,
    });

    desarrollo.push(crearPasoDesarrollo(
      `Sistema ${idx + 1}: ${nombre}`,
      `Lq=${formatearNumero(metricas.Lq)}, L=${formatearNumero(metricas.L)}, Pk=${formatearNumero(metricas.Pk)}`,
      "Métricas individuales",
      "",
    ));
  });

  // P(alguna cola con espera) = 1 - Π(1 - Pk_i)
  const P_alguna_cola_con_espera = 1 - prodNoEspera;
  
  // P(todas vacías) = Π P0_i
  const P_todas_vacias = prodP0;

  desarrollo.push(crearPasoDesarrollo(
    "Lq_total = Σ Lq_i",
    `Lq_total = ${detalles.map(d => formatearNumero(d.Lq)).join(" + ")}`,
    "Sumar",
    `${formatearNumero(LqTotal)}`,
  ));

  desarrollo.push(crearPasoDesarrollo(
    "L_total = Σ L_i",
    `L_total = ${detalles.map(d => formatearNumero(d.L)).join(" + ")}`,
    "Sumar",
    `${formatearNumero(LTotal)}`,
  ));

  desarrollo.push(crearPasoDesarrollo(
    "P(alguna cola con espera) = 1 - Π(1-Pk_i)",
    `= 1 - ${detalles.map(d => formatearNumero(1 - d.Pk)).join(" × ")}`,
    "Calcular",
    `${formatearNumero(P_alguna_cola_con_espera * 100)}%`,
  ));

  desarrollo.push(crearPasoDesarrollo(
    "P(todas vacías) = Π P0_i",
    `= ${detalles.map(d => formatearNumero(d.P0)).join(" × ")}`,
    "Calcular",
    `${formatearNumero(P_todas_vacias * 100)}%`,
  ));

  desarrollo.push(crearPasoDesarrollo(
    "Horas totales vacío/día",
    `= Σ P0_i × H_i = ${horasTotalesVacio.toFixed(2)} h`,
    "Sumar",
    `${formatearNumero(horasTotalesVacio)} h/día`,
  ));

  return {
    n: sistemas.length,
    LqTotal,
    LTotal,
    P_alguna_cola_con_espera,
    P_todas_vacias,
    horas_totales_vacio: horasTotalesVacio,
    clientes_esperando_dia: clientesEsperandoDia,
    detalles,
    desarrollo,
  };
}

/**
 * Resuelve un ejercicio de múltiples colas independientes.
 * 
 * Ejemplo: Ejercicio 18 - Dos cajas independientes
 * - Caja 1: λ₁, μ₁
 * - Caja 2: λ₂, μ₂
 */
export function calcularDosColasIndependientes(
  lambda1: number, mu1: number, horas1: number,
  lambda2: number, mu2: number, horas2: number,
): MetricasMultiCola {
  const { calcularTodo } = require("./calcular-todo");
  
  const metricas1 = calcularTodo({ modelo: "MM1", lambda: lambda1, mu: mu1, k: 1, M: Infinity });
  const metricas2 = calcularTodo({ modelo: "MM1", lambda: lambda2, mu: mu2, k: 1, M: Infinity });

  return calcularMultiCola([
    { id: "cola1", nombre: "Caja 1", metricas: metricas1, horasDiarias: horas1 },
    { id: "cola2", nombre: "Caja 2", metricas: metricas2, horasDiarias: horas2 },
  ]);
}
