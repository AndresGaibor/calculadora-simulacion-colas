/**
 * Motor de métricas derivadas.
 * 
 * Calcula resultados derivados que aparecen en los ejercicios pero que
 * no son métricas directas del modelo de colas (como P0, Lq, etc).
 * 
 * Ejemplos de métricas derivadas:
 * - "Total minutos diarios que el servidor está desocupado" = P0 × H × 60
 * - "Clientes diarios que esperan" = λ × H × Pk
 * - "Costo total diario" = Cs × k × H + Ce × L × H
 * - "Rentabilidad" = Ingresos / Gastos
 */

import type { MetricasCompletas } from "./calcular-todo";
import { crearPasoDesarrollo, formatearNumero } from "./desarrollo";
import type { PasoDesarrollo } from "./tipos";

export interface Jornada {
  horasDiarias: number;
  diasSemana?: number;
}

// ─── Métricas de tiempo con jornada ────────────────────────────────────

/** Minutos diarios que el sistema pasa completamente vacío (P0 × H × 60) */
export function minutosDiariosVacio(P0: number, jornada: Jornada): { valor: number; pasos: PasoDesarrollo[] } {
  const valor = P0 * jornada.horasDiarias * 60;
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "Minutos vacío/día = P0 × H × 60",
      `= ${formatearNumero(P0)} × ${jornada.horasDiarias} × 60`,
      "Calcular",
      `${formatearNumero(valor)} min/día`,
    )],
  };
}

/** Horas diarias que el sistema pasa completamente vacío (P0 × H) */
export function horasDiariosVacio(P0: number, jornada: Jornada): { valor: number; pasos: PasoDesarrollo[] } {
  const valor = P0 * jornada.horasDiarias;
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "Horas vacío/día = P0 × H",
      `= ${formatearNumero(P0)} × ${jornada.horasDiarias}`,
      "Calcular",
      `${formatearNumero(valor)} h/día`,
    )],
  };
}

/** Horas semanales desocupado (P0 × H × días) */
export function horasSemanalesVacio(P0: number, jornada: Jornada): { valor: number; pasos: PasoDesarrollo[] } {
  const dias = jornada.diasSemana ?? 5;
  const valor = P0 * jornada.horasDiarias * dias;
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "Horas vacío/semana = P0 × H × D",
      `= ${formatearNumero(P0)} × ${jornada.horasDiarias} × ${dias}`,
      "Calcular",
      `${formatearNumero(valor)} h/semana`,
    )],
  };
}

/** Horas diarias que TODOS los k servidores están desocupados simultáneamente */
export function horasDiariosDesocupadosTodos(P0: number, jornada: Jornada): { valor: number; pasos: PasoDesarrollo[] } {
  const valor = P0 * jornada.horasDiarias;
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "Horas todos desocupados/día = P0 × H",
      `= ${formatearNumero(P0)} × ${jornada.horasDiarias}`,
      "Todos los servidores libres simultáneamente",
      `${formatearNumero(valor)} h/día`,
    )],
  };
}

/** Minutos diarios que al menos un servidor está desocupado (fracción de tiempo por caja) = (1 - ρ) × H × 60 */
export function minutosDiariosAlMenosUnoDesocupado(rho: number, jornada: Jornada): { valor: number; pasos: PasoDesarrollo[] } {
  const valor = (1 - rho) * jornada.horasDiarias * 60;
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "Min desocupado/día = (1-ρ) × H × 60",
      `= (1-${formatearNumero(rho)}) × ${jornada.horasDiarias} × 60`,
      "Calcular",
      `${formatearNumero(valor)} min/día`,
    )],
  };
}

/** 
 * Total de horas que pasan todas las cajas/servidores desocupadas (concurrentemente o no) 
 * = k × (1 - ρ) × H 
 */
export function horasTotalesServidoresDesocupados(k: number, rho: number, jornada: Jornada): { valor: number; pasos: PasoDesarrollo[] } {
  const valor = k * (1 - rho) * jornada.horasDiarias;
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "Horas-caja desocupadas = k × (1 - ρ) × H",
      `= ${k} × (1 - ${formatearNumero(rho)}) × ${jornada.horasDiarias}`,
      "Calcular",
      `${formatearNumero(valor)} horas-caja/día`,
    )],
  };
}

/**
 * Minutos diarios que estarán ocupados TODOS los servidores al mismo tiempo.
 * Es igual a P(N ≥ k) × H × 60 = Pk × H × 60
 */
export function minutosDiariosTodosOcupados(Pk: number, jornada: Jornada): { valor: number; pasos: PasoDesarrollo[] } {
  const valor = Pk * jornada.horasDiarias * 60;
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "Minutos todos ocupados/día = Pk × H × 60",
      `= ${formatearNumero(Pk)} × ${jornada.horasDiarias} × 60`,
      "Calcular",
      `${formatearNumero(valor)} min/día`,
    )]
  };
}

// ─── Métricas de clientes con jornada ───────────────────────────────────

/** Estimación de clientes diarios que deben esperar = λ × H × Pk */
export function clientesDiariosQueEsperan(lambda: number, Pk: number, jornada: Jornada): { valor: number; pasos: PasoDesarrollo[] } {
  const clientesPorHora = lambda;
  const valor = clientesPorHora * jornada.horasDiarias * Pk;
  return {
    valor,
    pasos: [
      crearPasoDesarrollo(
        "Clientes/hora que esperan = λ × Pk",
        `= ${formatearNumero(lambda)} × ${formatearNumero(Pk)}`,
        "Calcular",
        `${formatearNumero(lambda * Pk)} c/h`,
      ),
      crearPasoDesarrollo(
        "Clientes diarios que esperan = (λ × Pk) × H",
        `= ${formatearNumero(lambda * Pk)} × ${jornada.horasDiarias}`,
        "Calcular",
        `${formatearNumero(valor)} clientes/día`,
      ),
    ],
  };
}

/** Total de clientes atendidos por día = λ × H */
export function clientesDiariosAtendidos(lambda: number, jornada: Jornada): { valor: number; pasos: PasoDesarrollo[] } {
  const valor = lambda * jornada.horasDiarias;
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "Clientes/día = λ × H",
      `= ${formatearNumero(lambda)} × ${jornada.horasDiarias}`,
      "Calcular",
      `${formatearNumero(valor)} clientes/día`,
    )],
  };
}

/** Clientes semanales que esperan */
export function clientesSemanalesQueEsperan(lambda: number, Pk: number, jornada: Jornada): { valor: number; pasos: PasoDesarrollo[] } {
  const dias = jornada.diasSemana ?? 5;
  const valor = lambda * jornada.horasDiarias * dias * Pk;
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "Clientes semanales que esperan = λ × H × D × Pk",
      `= ${formatearNumero(lambda)} × ${jornada.horasDiarias} × ${dias} × ${formatearNumero(Pk)}`,
      "Calcular",
      `${formatearNumero(valor)} clientes/semana`,
    )],
  };
}

/** Clientes semanales que NO esperan (son atendidos de inmediato) */
export function clientesSemanalesQueNoEsperan(lambda: number, Pk: number, jornada: Jornada): { valor: number; pasos: PasoDesarrollo[] } {
  const dias = jornada.diasSemana ?? 5;
  const valor = lambda * jornada.horasDiarias * dias * (1 - Pk);
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "Clientes semanales que NO esperan = λ × H × D × (1 - Pk)",
      `= ${formatearNumero(lambda)} × ${jornada.horasDiarias} × ${dias} × (1 - ${formatearNumero(Pk)})`,
      "Calcular",
      `${formatearNumero(valor)} clientes/semana`,
    )],
  };
}

// ─── Métricas de tiempo total en el sistema ─────────────────────────────

/** Tiempo total diario que pasan todos los clientes en el sistema = λ × W × H (en minutos) */
export function tiempoTotalDiarioEnSistema(lambda: number, W: number, jornada: Jornada): { valor: number; pasos: PasoDesarrollo[] } {
  // Número de clientes/hora × tiempo por cliente × horas = total horas-cliente/día
  const totalHoras = lambda * W * jornada.horasDiarias;
  const totalMinutos = totalHoras * 60;
  return {
    valor: totalMinutos,
    pasos: [
      crearPasoDesarrollo(
        "W en horas",
        `W = ${formatearNumero(W)} h = ${formatearNumero(W * 60)} min`,
        "Unidad",
        `${formatearNumero(W * 60)} min`,
      ),
      crearPasoDesarrollo(
        "Tiempo total = λ × W × H",
        `= ${formatearNumero(lambda)} × ${formatearNumero(W)} × ${jornada.horasDiarias}`,
        "Calcular",
        `${formatearNumero(totalHoras)} h/día = ${formatearNumero(totalMinutos)} min/día`,
      ),
    ],
  };
}

/** Tiempo total semanal en el sistema (W × λ × H × D) */
export function tiempoTotalSemanalEnSistema(lambda: number, W: number, jornada: Jornada): { valor: number; pasos: PasoDesarrollo[] } {
  const dias = jornada.diasSemana ?? 7;
  const totalHoras = lambda * W * jornada.horasDiarias * dias;
  return {
    valor: totalHoras,
    pasos: [crearPasoDesarrollo(
      "Tiempo total semanal = λ × W × H × D",
      `= ${formatearNumero(lambda)} × ${formatearNumero(W)} × ${jornada.horasDiarias} × ${dias}`,
      "Calcular",
      `${formatearNumero(totalHoras)} h/semana`,
    )],
  };
}

// ─── Costo total del sistema ─────────────────────────────────────────────

export interface ConfigCosto {
  /** Costo por servidor por hora */
  costoServidorHora: number;
  /** Número de servidores */
  k: number;
  /** Costo de espera por cliente por hora */
  costoEsperaHora: number;
  /** Si el costo de espera es sobre L (sistema) o Lq (cola) */
  costoSobre: "L" | "Lq";
  /** Horas del período */
  horas: number;
}

export interface ResultadoCostoTotal {
  costoServidor: number;
  costoEspera: number;
  costoTotal: number;
  pasos: PasoDesarrollo[];
}

export function calcularCostoTotalDiario(
  metricas: MetricasCompletas,
  config: ConfigCosto,
): ResultadoCostoTotal {
  const pasos: PasoDesarrollo[] = [];

  const costoServidor = config.costoServidorHora * config.k * config.horas;
  pasos.push(crearPasoDesarrollo(
    `Costo servidores = Cs/h × k × H`,
    `= $${formatearNumero(config.costoServidorHora)} × ${config.k} × ${config.horas}`,
    "Calcular",
    `$${formatearNumero(costoServidor)}`,
  ));

  const metrica = config.costoSobre === "L" ? metricas.L : metricas.Lq;
  const costoEspera = config.costoEsperaHora * metrica * config.horas;
  pasos.push(crearPasoDesarrollo(
    `Costo espera = Ce/h × ${config.costoSobre} × H`,
    `= $${formatearNumero(config.costoEsperaHora)} × ${formatearNumero(metrica)} × ${config.horas}`,
    "Calcular",
    `$${formatearNumero(costoEspera)}`,
  ));

  const costoTotal = costoServidor + costoEspera;
  pasos.push(crearPasoDesarrollo(
    "Costo total = Cs + Ce",
    `= $${formatearNumero(costoServidor)} + $${formatearNumero(costoEspera)}`,
    "Sumar",
    `$${formatearNumero(costoTotal)}`,
  ));

  return { costoServidor, costoEspera, costoTotal, pasos };
}

/** Rentabilidad = Ingresos / Gastos */
export function calcularRentabilidad(ingresos: number, gastos: number): { valor: number; pasos: PasoDesarrollo[] } {
  const valor = gastos > 0 ? ingresos / gastos : Infinity;
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "Rentabilidad = Ingresos / Gastos",
      `= $${formatearNumero(ingresos)} / $${formatearNumero(gastos)}`,
      "Calcular",
      `${formatearNumero(valor)}`,
    )],
  };
}

// ─── Fracción / porcentaje ───────────────────────────────────────────────

/** Fracción en operación para población finita = (M - L) / M */
export function fraccionEnOperacion(M: number, L: number): { valor: number; pasos: PasoDesarrollo[] } {
  const valor = (M - L) / M;
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "Fracción en operación = (M - L) / M",
      `= (${M} - ${formatearNumero(L)}) / ${M}`,
      "Calcular",
      `${formatearNumero(valor * 100)}%`,
    )],
  };
}

/** Fracción que NO debe esperar = 1 - Pk */
export function fraccionSinEspera(Pk: number): { valor: number; pasos: PasoDesarrollo[] } {
  const valor = 1 - Pk;
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "Fracción sin espera = 1 - Pk",
      `= 1 - ${formatearNumero(Pk)}`,
      "Calcular",
      `${formatearNumero(valor * 100)}%`,
    )],
  };
}

/** Número estimado en operación (para población finita) = M - L */
export function enOperacion(M: number, L: number): { valor: number; pasos: PasoDesarrollo[] } {
  const valor = M - L;
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "En operación = M - L",
      `= ${M} - ${formatearNumero(L)}`,
      "Calcular",
      `${formatearNumero(valor)} unidades`,
    )],
  };
}

/** Tiempo improductivo total diario */
export function tiempoImprodutivoDiario(
  L: number,
  jornada: Jornada,
): { valor: number; pasos: PasoDesarrollo[] } {
  const valor = L * jornada.horasDiarias;
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "Horas improductivas/día = L × H",
      `= ${formatearNumero(L)} × ${jornada.horasDiarias}`,
      "Calcular",
      `${formatearNumero(valor)} h/día`,
    )],
  };
}

/** Horas semanales ocupado = (1-P0) × H × D */
export function horasSemanalesOcupado(P0: number, jornada: Jornada): { valor: number; pasos: PasoDesarrollo[] } {
  const dias = jornada.diasSemana ?? 5;
  const valor = (1 - P0) * jornada.horasDiarias * dias;
  return {
    valor,
    pasos: [crearPasoDesarrollo(
      "Horas ocupado/semana = (1-P0) × H × D",
      `= (1-${formatearNumero(P0)}) × ${jornada.horasDiarias} × ${dias}`,
      "Calcular",
      `${formatearNumero(valor)} h/semana`,
    )],
  };
}
