/**
 * Módulo de costos centralizado para teoría de colas.
 *
 * Centraliza todos los cálculos de costo para evitar duplicación
 * entre optimizar.ts, metricas-derivadas.ts y new-exercise-flow.ts.
 *
 * Soporta:
 * - Costo sobre cola (Lq) o sistema completo (L)
 * - Múltiples unidades de costo (hora, día, período)
 * - Cálculo de costo total diario y semanal
 */

import type { MetricasCompletas } from "./calcular-todo";
import type { PasoDesarrollo } from "./tipos";
import { formatearNumero } from "./desarrollo";

export type CostoSobre = "Lq" | "L";

export interface ConfigCostoPeriodo {
  costoServidor: number;
  unidadServidor: "hora" | "dia" | "periodo";
  costoEsperaHoraCliente: number;
  costoSobre: CostoSobre;
  horasPeriodo: number;
  dias?: number;
  k: number;
}

export interface ResultadoCostoPeriodo {
  costoServidor: number;
  costoEspera: number;
  costoTotal: number;
  pasos: PasoDesarrollo[];
}

export function costoServidorPeriodo(cfg: ConfigCostoPeriodo): number {
  if (cfg.unidadServidor === "hora") {
    return cfg.costoServidor * cfg.k * cfg.horasPeriodo * (cfg.dias ?? 1);
  }

  if (cfg.unidadServidor === "dia") {
    return cfg.costoServidor * cfg.k * (cfg.dias ?? 1);
  }

  return cfg.costoServidor * cfg.k;
}

export function calcularCostoPeriodo(
  metricas: MetricasCompletas,
  cfg: ConfigCostoPeriodo,
): ResultadoCostoPeriodo {
  const dias = cfg.dias ?? 1;
  const horasTotales = cfg.horasPeriodo * dias;
  const base = cfg.costoSobre === "L" ? metricas.L : metricas.Lq;

  const costoServidor = costoServidorPeriodo(cfg);
  const costoEspera = base * horasTotales * cfg.costoEsperaHoraCliente;

  const pasos: PasoDesarrollo[] = [
    {
      formula: "Costo servidores",
      sustitucion: `${formatearNumero(cfg.costoServidor)} × k=${cfg.k}${cfg.unidadServidor !== "hora" ? ` × ${cfg.horasPeriodo}h` : ""} × ${dias}d`,
      operacion: "Calcular",
      resultado: `$${formatearNumero(costoServidor)}`,
    },
    {
      formula: `Costo espera = ${cfg.costoSobre} × horas × costo/h`,
      sustitucion: `${formatearNumero(base)} × ${horasTotales} × ${cfg.costoEsperaHoraCliente}`,
      operacion: "Calcular",
      resultado: `$${formatearNumero(costoEspera)}`,
    },
    {
      formula: "Costo total = servidores + espera",
      sustitucion: `$${formatearNumero(costoServidor)} + $${formatearNumero(costoEspera)}`,
      operacion: "Sumar",
      resultado: `$${formatearNumero(costoServidor + costoEspera)}`,
    },
  ];

  return {
    costoServidor,
    costoEspera,
    costoTotal: costoServidor + costoEspera,
    pasos,
  };
}

export function costoSobreL( costos: ConfigCostoPeriodo, metricas: MetricasCompletas, k: number, horas: number ): number {
  return costos.costoServidor * k * horas + metricas.L * horas * costos.costoEsperaHoraCliente;
}

export function costoSobreLq( costos: ConfigCostoPeriodo, metricas: MetricasCompletas, k: number, horas: number ): number {
  return costos.costoServidor * k * horas + metricas.Lq * horas * costos.costoEsperaHoraCliente;
}