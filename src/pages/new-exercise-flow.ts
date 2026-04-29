/**
 * Estado centralizado para la página /new.
 * 
 * Soporta entrada flexible de parámetros y cálculo de múltiples "literales"
 * (sub-preguntas) de un mismo ejercicio.
 */

import { calcularTodo, type MetricasCompletas, type ParametrosSistema, minutosDiariosAlMenosUnServidorLibre, probAcumuladaMayorIgual, probAlMenosUnServidorLibre, probEsperandoExacto, probMasDeEsperando } from "../domain/cola/calcular-todo";
import { calcularHeterogeneo, optimizarMHeterogeneo, type MetricasHeterogeneo, type ParametrosHeterogeneo } from "../domain/cola/calcular-heterogeneo";
import { optimizarK, optimizarM, type CondicionOptimizacion } from "../domain/cola/optimizar";
import { LITERALES_DISPONIBLES, GRUPOS_LITERALES } from "../domain/cola/literales/catalogo";
import {
  minutosDiariosVacio, horasDiariosVacio, horasSemanalesVacio,
  clientesDiariosQueEsperan, clientesSemanalesQueEsperan,
  calcularCostoTotalDiario, fraccionEnOperacion, enOperacion,
  horasSemanalesOcupado, tiempoTotalSemanalEnSistema, fraccionSinEspera,
  horasDiariosDesocupadosTodos, type ConfigCosto, type Jornada,
  horasTotalesServidoresDesocupados, minutosDiariosTodosOcupados,
  clientesSemanalesQueNoEsperan,
} from "../domain/cola/metricas-derivadas";
import type { UnidadTiempo } from "../domain/cola/convertir";
import { tasaAHoras } from "../domain/cola/convertir";
import type { EntradaTasaGeneral } from "../domain/cola/normalizar-entrada";
import { normalizarEntradaATasaHora } from "../domain/cola/normalizar-entrada";
import { formatearNumero } from "../domain/cola/desarrollo";
import type { PasoDesarrollo } from "../domain/cola/tipos";

export { LITERALES_DISPONIBLES, GRUPOS_LITERALES };

// ─── Tipos de entrada ───────────────────────────────────────────────────

export type ModelId = "mm1" | "mmk" | "mm1m" | "mmkm" | "mmk_het"; // mmk_het = M/M/k heterogéneo
export interface ParametroEntrada {
  valor: number;
  unidad: UnidadTiempo;
}

export function entradaATasaHora(p: ParametroEntrada): number {
  if (p.valor <= 0) return 0;
  return tasaAHoras(p.valor, p.unidad);
}

// ─── Tipos de literales (sub-preguntas) ─────────────────────────────────

export type TipoLiteral =
  // Métricas directas
  | "P0" | "Pn" | "Pk" | "Lq" | "L" | "Wq_min" | "Wq_h" | "W_min" | "W_h" | "rho"
  | "Ln" | "Wn_min" | "Wn_h"
  // Métricas con jornada
  | "minutos_diarios_vacio" | "horas_diarias_vacio" | "horas_semanales_vacio"
  | "horas_diarias_desocupados_todos"
  | "minutos_al_menos_un_libre" | "horas_al_menos_un_libre"   // P(N<k) × H × 60
  | "horas_totales_servidores_desocupados"
  | "minutos_diarios_todos_ocupados" | "horas_diarias_todos_ocupados"
  | "clientes_diarios_esperan" | "clientes_semanales_esperan" | "clientes_semanales_no_esperan"
  | "clientes_diarios_total"
  | "horas_semanales_ocupado"
  | "tiempo_total_semanal_en_sistema"
  | "fraccion_espera" | "fraccion_sin_espera" | "fraccion_operacion"
  | "en_operacion" | "porcentaje_fuera_sistema"
  // Métricas de probabilidad de cola
  | "prob_mas_de_q_esperando" | "prob_exacto_q_esperando" | "prob_entre_q1_q2_esperando"
  | "prob_al_menos_un_servidor_libre" | "prob_al_menos_un_servidor_ocupado"
  | "minutos_diarios_cola_positiva"
  // Métricas heterogéneas (servidores no idénticos)
  | "het_prob_ambos_ocupados" | "het_prob_alguno_disponible" | "het_en_operacion" | "het_fraccion_operacion"
  | "het_minutos_ambos_ocupados" | "het_minutos_alguno_disponible"
  // Optimización
  | "optimizar_k_costo" | "optimizar_k_condicion" | "optimizar_m_condicion"
  // Costo
  | "costo_total_diario" | "costo_total_semanal" | "rentabilidad"
  // Multiplicador y escenarios
  | "multiplicar" | "total_sistemas_identicos" | "calcular_con_lambda_alternativo"
  // Nuevos tipos para el plan de implementación
  | "comparar_escenarios"
  | "multi_colas_independientes"
  | "flujo_efectivo_reproceso"
  | "servicio_ponderado"
  | "flujo_por_porcentajes"
  | "lambda_efectiva";

// ─── Estado del literal ─────────────────────────────────────────────────

export interface LiteralExtra {
  n?: number;
  jornada?: Jornada;
  costos?: ConfigCostoEjercicio;
  condicion?: CondicionOptimizacion;
  /** Parámetro q para probabilidades de cola */
  q?: number;
  /** Parámetro q1 para rango de probabilidades de cola */
  q1?: number;
  /** Parámetro q2 para rango de probabilidades de cola */
  q2?: number;
  /** Factor de multiplicación para el literal 'multiplicar' */
  factor?: number;
  /** Fuente del resultado a multiplicar (ej: "Lq", "L") */
  fuente?: string;
  /** Lambda alternativa para escenario "y si cambia lambda" */
  lambdaNueva?: number;
  /** Población externa para porcentajes derivados no finitos */
  poblacionExterna?: number;
}

/**
 * Configuración de costos para ejercicios.
 * Soporta dos modos:
 * - Modo básico: costo por servidor por hora + costo de espera por cliente por hora
 * - Modo ejercicio 12: salario diario por servidor + costo de pérdida por hora de espera
 */
export interface ConfigCostoEjercicio {
  /** Salario diario por servidor ($50/día en ejercicio 12) */
  costoServidorDia: number;
  /** Costo de espera por hora-cliente (pérdida por hora de espera, $10/h en ej12) */
  costoEsperaHoraCliente: number;
  /** Número de horas del período */
  horasPeriodo: number;
  /** Número de días del período (para costo semanal) */
  dias?: number;
  /** Métrica que genera costo: cola (Lq) o sistema completo (L) */
  costoSobre?: "Lq" | "L";
}

export interface LiteralState {
  id: string;
  tipo: TipoLiteral;
  label: string;
  extra: LiteralExtra;
  resultado?: LiteralResultado;
}

export interface LiteralResultado {
  valor: number | null;
  valorFormateado: string;
  unidad: string;
  desarrollo: PasoDesarrollo[];
  tablaOptimizacion?: import("../domain/cola/optimizar").FilaOptimizacion[];
  advertencias: string[];
}

// ─── Estado general ─────────────────────────────────────────────────────

export interface GeneralState {
  model: ModelId;
  lambdaEntrada: ParametroEntrada;
  muEntrada: ParametroEntrada;
  /** Array de tasas μ para servidores heterogéneos (opcional) */
  musEntrada?: ParametroEntrada[];
  k: number;
  M: number; // Infinity = población infinita

  /** Entrada flexible para λ (normalizador de entrada) */
  lambdaFlexible?: import("../domain/cola/normalizar-entrada").EntradaTasaGeneral;
  /** Entrada flexible para μ (normalizador de entrada) */
  muFlexible?: import("../domain/cola/normalizar-entrada").EntradaTasaGeneral;
  /** Entradas flexibles para μ heterogéneas */
  musFlexibles?: import("../domain/cola/normalizar-entrada").EntradaTasaGeneral[];
}

export interface NewExerciseState {
  general: GeneralState;
  literales: LiteralState[];
  metricas?: MetricasCompletas;
  /** Métricas para modelo heterogéneo (alternativo) */
  metricasHeterogeneo?: MetricasHeterogeneo;
}

const DEFAULT_GENERAL: GeneralState = {
  model: "mm1",
  lambdaEntrada: { valor: 10, unidad: "horas" },
  muEntrada: { valor: 15, unidad: "horas" },
  k: 1,
  M: Infinity,
};

export function crearEstadoInicial(): NewExerciseState {
  return {
    general: DEFAULT_GENERAL,
    literales: [],
  };
}

// ─── Conversión general → ParametrosSistema ─────────────────────────────

export function generalAParametros(g: GeneralState): ParametrosSistema {
  const lambda = entradaATasaHora(g.lambdaEntrada);
  const mu = entradaATasaHora(g.muEntrada);
  const esFinita = isFinite(g.M) && g.M > 0;
  const esMulti = g.k > 1;
  const modelo = esFinita
    ? esMulti ? "MMKM" : "MM1M"
    : esMulti ? "MMK" : "MM1";

  return { modelo, lambda, mu, k: g.k, M: esFinita ? g.M : Infinity };
}

// ─── Cálculo de un literal ──────────────────────────────────────────────

function calcularLiteral(
  literal: LiteralState,
  params: ParametrosSistema,
  metricas: MetricasCompletas,
): LiteralResultado {
  const advertencias = [...metricas.advertencias];
  const desarrollo: PasoDesarrollo[] = [...metricas.desarrollo];
  let valor: number | null = null;
  let unidad = "";
  let tablaOptimizacion: import("../domain/cola/optimizar").FilaOptimizacion[] | undefined;

  const { tipo, extra } = literal;
  const jornada = extra.jornada ?? { horasDiarias: 8 };

  switch (tipo) {
    case "P0":
      valor = metricas.P0;
      unidad = "probabilidad";
      break;
    case "Pn": {
      const n = extra.n ?? 0;
      valor = metricas.Pn(n);
      unidad = "probabilidad";
      desarrollo.push({ formula: `Pn con n=${n}`, sustitucion: `P(${n})`, operacion: "Calcular", resultado: formatearNumero(valor) });
      break;
    }
    case "Pk":
      valor = metricas.Pk;
      unidad = "probabilidad";
      break;
    case "Lq":
      valor = metricas.Lq;
      unidad = "clientes";
      break;
    case "L":
      valor = metricas.L;
      unidad = "clientes";
      break;
    case "Ln":
      valor = metricas.Ln;
      unidad = "clientes";
      break;
    case "Wq_min":
      valor = metricas.Wq * 60;
      unidad = "minutos";
      desarrollo.push({ formula: "Wq en minutos = Wq × 60", sustitucion: `${formatearNumero(metricas.Wq)} × 60`, operacion: "Convertir", resultado: formatearNumero(valor) });
      break;
    case "Wq_h":
      valor = metricas.Wq;
      unidad = "horas";
      break;
    case "W_min":
      valor = metricas.W * 60;
      unidad = "minutos";
      desarrollo.push({ formula: "W en minutos = W × 60", sustitucion: `${formatearNumero(metricas.W)} × 60`, operacion: "Convertir", resultado: formatearNumero(valor) });
      break;
    case "W_h":
      valor = metricas.W;
      unidad = "horas";
      break;
    case "Wn_min":
      valor = metricas.Wn * 60;
      unidad = "minutos";
      break;
    case "rho":
      valor = metricas.rho;
      unidad = "adimensional";
      break;
    case "fraccion_espera":
      valor = metricas.Pk;
      unidad = "fracción";
      break;
    case "fraccion_sin_espera":
      valor = fraccionSinEspera(metricas.Pk).valor;
      unidad = "fracción";
      desarrollo.push(...fraccionSinEspera(metricas.Pk).pasos);
      break;
    case "prob_al_menos_un_servidor_libre": {
      const M = isFinite(params.M) ? params.M : undefined;
      valor = probAlMenosUnServidorLibre(metricas, params.k, M);
      unidad = "probabilidad";
      desarrollo.push({
        formula: "P(al menos un servidor libre) = Σ Pn, n=0..k-1",
        sustitucion: `k=${params.k}`,
        operacion: "Sumar",
        resultado: formatearNumero(valor),
      });
      break;
    }
    case "prob_al_menos_un_servidor_ocupado":
      valor = 1 - metricas.P0;
      unidad = "probabilidad";
      desarrollo.push({
        formula: "P(al menos un servidor ocupado) = 1 - P0",
        sustitucion: `1 - ${formatearNumero(metricas.P0)}`,
        operacion: "Calcular",
        resultado: formatearNumero(valor),
      });
      break;
    // ─── Probabilidades de cola ───
    case "prob_mas_de_q_esperando": {
      // P(Nq ≥ q) = P(N ≥ k + q)
      const q = extra.q ?? 1;
      const M = isFinite(params.M) ? params.M : undefined;
      valor = probMasDeEsperando(metricas, params.k, q - 1, M);
      unidad = "probabilidad";
      desarrollo.push({
        formula: `P(Nq ≥ ${q}) = P(N ≥ k+${q})`,
        sustitucion: `k=${params.k}, q=${q}`,
        operacion: "Calcular",
        resultado: formatearNumero(valor),
      });
      break;
    }
    case "prob_exacto_q_esperando": {
      // P(Nq = q) = P(N = k + q)
      const q = extra.q ?? 0;
      valor = probEsperandoExacto(metricas, params.k, q);
      unidad = "probabilidad";
      desarrollo.push({
        formula: `P(Nq = ${q}) = P(N = k+${q})`,
        sustitucion: `k=${params.k}, q=${q}`,
        operacion: "Calcular",
        resultado: formatearNumero(valor),
      });
      break;
    }
    case "prob_entre_q1_q2_esperando": {
      // P(q1 ≤ Nq ≤ q2) = Σ P(Nq = q) para q=q1..q2
      const q1 = extra.q1 ?? 1;
      const q2 = extra.q2 ?? 2;
      let suma = 0;
      let desglose = "";
      for (let q = q1; q <= q2; q++) {
        const probQ = probEsperandoExacto(metricas, params.k, q);
        suma += probQ;
        desglose += `P(${q})=${formatearNumero(probQ)}`;
        if (q < q2) desglose += " + ";
      }
      valor = suma;
      unidad = "probabilidad";
      desarrollo.push({
        formula: `P(${q1} ≤ Nq ≤ ${q2}) = Σ P(Nq = q)`,
        sustitucion: desglose,
        operacion: "Sumar",
        resultado: formatearNumero(valor),
      });
      break;
    }
    case "minutos_diarios_cola_positiva": {
      // P(Nq > 0) = P(N > k) = P(N ≥ k+1) - P(N = k)
      // O más directamente: P(Nq > 0) = P(N > k) = 1 - P(N ≤ k)
      const M = isFinite(params.M) ? params.M : undefined;
      // Para M/M/1: P(Nq > 0) = P(N ≥ 2) = ρ²
      // Para M/M/k: P(Nq > 0) = P(N > k) = Pk
      let pColaPositiva: number;
      if (metricas.modelo === "MM1") {
        pColaPositiva = metricas.rho ** 2;
      } else {
        pColaPositiva = probMasDeEsperando(metricas, params.k, 0, M);
      }
      valor = pColaPositiva * jornada.horasDiarias * 60;
      unidad = "min/día";
      desarrollo.push({
        formula: "Minutos con cola positiva = P(Nq>0) × H × 60",
        sustitucion: `P(Nq>0)=${formatearNumero(pColaPositiva)}, H=${jornada.horasDiarias}`,
        operacion: "Calcular",
        resultado: `${formatearNumero(valor)} min/día`,
      });
      break;
    }
    case "minutos_diarios_vacio": {
      const r = minutosDiariosVacio(metricas.P0, jornada);
      valor = r.valor; unidad = "min/día"; desarrollo.push(...r.pasos);
      break;
    }
    case "horas_diarias_vacio": {
      const r = horasDiariosVacio(metricas.P0, jornada);
      valor = r.valor; unidad = "h/día"; desarrollo.push(...r.pasos);
      break;
    }
    case "horas_diarias_desocupados_todos": {
      const r = horasDiariosDesocupadosTodos(metricas.P0, jornada);
      valor = r.valor; unidad = "h/día"; desarrollo.push(...r.pasos);
      break;
    }
    case "horas_semanales_vacio": {
      const r = horasSemanalesVacio(metricas.P0, jornada);
      valor = r.valor; unidad = "h/semana"; desarrollo.push(...r.pasos);
      break;
    }
    case "horas_semanales_ocupado": {
      const r = horasSemanalesOcupado(metricas.P0, jornada);
      valor = r.valor; unidad = "h/semana"; desarrollo.push(...r.pasos);
      break;
    }
    case "clientes_diarios_esperan": {
      const r = clientesDiariosQueEsperan(params.lambda, metricas.Pk, jornada);
      valor = r.valor; unidad = "clientes/día"; desarrollo.push(...r.pasos);
      break;
    }
    case "clientes_semanales_esperan": {
      const r = clientesSemanalesQueEsperan(params.lambda, metricas.Pk, jornada);
      valor = r.valor; unidad = "clientes/semana"; desarrollo.push(...r.pasos);
      break;
    }
    case "clientes_semanales_no_esperan": {
      const r = clientesSemanalesQueNoEsperan(params.lambda, metricas.Pk, jornada);
      valor = r.valor; unidad = "clientes/semana"; desarrollo.push(...r.pasos);
      break;
    }
    case "horas_totales_servidores_desocupados": {
      const r = horasTotalesServidoresDesocupados(params.k, metricas.rho, jornada);
      valor = r.valor; unidad = "horas-caja/día"; desarrollo.push(...r.pasos);
      break;
    }
    case "minutos_diarios_todos_ocupados": {
      const r = minutosDiariosTodosOcupados(metricas.Pk, jornada);
      valor = r.valor; unidad = "min/día"; desarrollo.push(...r.pasos);
      break;
    }
    case "horas_diarias_todos_ocupados": {
      valor = metricas.Pk * jornada.horasDiarias;
      unidad = "h/día";
      desarrollo.push({
        formula: "Horas todos ocupados/día = Pk × H",
        sustitucion: `${formatearNumero(metricas.Pk)} × ${jornada.horasDiarias}`,
        operacion: "Calcular",
        resultado: `${formatearNumero(valor)} h/día`,
      });
      break;
    }
    case "clientes_diarios_total": {
      const v = params.lambda * jornada.horasDiarias;
      valor = v; unidad = "clientes/día";
      desarrollo.push({ formula: "Clientes/día = λ × H", sustitucion: `${formatearNumero(params.lambda)} × ${jornada.horasDiarias}`, operacion: "Calcular", resultado: formatearNumero(v) });
      break;
    }
    case "tiempo_total_semanal_en_sistema": {
      const r = tiempoTotalSemanalEnSistema(params.lambda, metricas.W, jornada);
      valor = r.valor; unidad = "h/semana"; desarrollo.push(...r.pasos);
      break;
    }
    case "fraccion_operacion": {
      const M = isFinite(params.M) ? params.M : 0;
      const r = fraccionEnOperacion(M, metricas.L);
      valor = r.valor; unidad = "fracción"; desarrollo.push(...r.pasos);
      break;
    }
    case "en_operacion": {
      const M = isFinite(params.M) ? params.M : 0;
      const r = enOperacion(M, metricas.L);
      valor = r.valor; unidad = "unidades"; desarrollo.push(...r.pasos);
      break;
    }
    case "porcentaje_fuera_sistema": {
      const M = extra.poblacionExterna ?? (isFinite(params.M) ? params.M : 0);
      if (M <= 0) {
        valor = null;
        advertencias.push("Debe indicar una población total externa mayor que 0");
      } else {
        valor = (M - metricas.L) / M;
        unidad = "fracción";
        desarrollo.push({
          formula: "% fuera del sistema = (M - L) / M",
          sustitucion: `(${M} - ${formatearNumero(metricas.L)}) / ${M}`,
          operacion: "Calcular",
          resultado: `${formatearNumero(valor * 100)}%`,
        });
      }
      break;
    }
    case "minutos_al_menos_un_libre": {
      const M = isFinite(params.M) ? params.M : undefined;
      const r = minutosDiariosAlMenosUnServidorLibre(metricas, params.k, jornada.horasDiarias, M);
      valor = r.valor; unidad = "min/día"; desarrollo.push(...r.pasos);
      break;
    }
    case "horas_al_menos_un_libre": {
      const M = isFinite(params.M) ? params.M : undefined;
      const fraccion = probAlMenosUnServidorLibre(metricas, params.k, M);
      valor = fraccion * jornada.horasDiarias;
      unidad = "h/día";
      desarrollo.push({
        formula: "Horas con al menos un servidor libre = P(N<k) × H",
        sustitucion: `${formatearNumero(fraccion)} × ${jornada.horasDiarias}`,
        operacion: "Calcular",
        resultado: `${formatearNumero(valor)} h/día`,
      });
      break;
    }
    case "costo_total_diario": {
      const cfg = extra.costos ?? { costoServidorDia: 50, costoEsperaHoraCliente: 10, horasPeriodo: jornada.horasDiarias };
      // Costo de servidores = salario/día × k × días
      // Costo de espera = λ × horas × Wq(h) × costo/hora_espera
      const costoServidores = cfg.costoServidorDia * params.k;
      const clientesTotales = params.lambda * cfg.horasPeriodo;
      const costoSobre = cfg.costoSobre ?? "Lq";
      const horasClienteTotales = (costoSobre === "L" ? metricas.L : metricas.Lq) * cfg.horasPeriodo;
      const costoEspera = horasClienteTotales * cfg.costoEsperaHoraCliente;
      const costoTotal = costoServidores + costoEspera;
      desarrollo.push({
        formula: "C_servidores = Cs/día × k",
        sustitucion: `= $${formatearNumero(cfg.costoServidorDia)} × ${params.k}`,
        operacion: "Calcular",
        resultado: `$${formatearNumero(costoServidores)}/día`,
      });
      desarrollo.push({
        formula: "Clientes totales = λ × H",
        sustitucion: `= ${formatearNumero(params.lambda)} × ${cfg.horasPeriodo}`,
        operacion: "Calcular",
        resultado: `${formatearNumero(clientesTotales)} clientes/día`,
      });
      desarrollo.push({
        formula: `Horas-cliente = ${costoSobre} × H`,
        sustitucion: `= ${formatearNumero(costoSobre === "L" ? metricas.L : metricas.Lq)} × ${cfg.horasPeriodo}`,
        operacion: "Calcular",
        resultado: `${formatearNumero(horasClienteTotales)} h-cliente/día`,
      });
      desarrollo.push({
        formula: "C_variable = h_cliente × Ce/hora",
        sustitucion: `= ${formatearNumero(horasClienteTotales)} × $${formatearNumero(cfg.costoEsperaHoraCliente)}`,
        operacion: "Calcular",
        resultado: `$${formatearNumero(costoEspera)}/día`,
      });
      desarrollo.push({
        formula: "C_total = C_servidores + C_espera",
        sustitucion: `= $${formatearNumero(costoServidores)} + $${formatearNumero(costoEspera)}`,
        operacion: "Sumar",
        resultado: `$${formatearNumero(costoTotal)}/día`,
      });
      valor = costoTotal; unidad = "$/día";
      break;
    }
    case "optimizar_k_costo": {
      const costos = extra.costos ?? { costoServidorDia: 50, costoEsperaHoraCliente: 10, horasPeriodo: 8 };
      const costoServidorHora = costos.costoServidorDia / costos.horasPeriodo;
      const costoSobre = costos.costoSobre === "L" ? "sistema" : "cola";
      const condicion: CondicionOptimizacion = {
        tipo: "minimizar_costo",
        costos: { costoServidor: costoServidorHora, costoEspera: costos.costoEsperaHoraCliente, costoSobre },
      };
      const resultado = optimizarK(params.lambda, params.mu, condicion, isFinite(params.M) ? params.M : Infinity);
      valor = resultado.valorOptimo; unidad = "servidores";
      tablaOptimizacion = resultado.tabla;
      desarrollo.push(...resultado.desarrollo);
      break;
    }
    case "optimizar_k_condicion": {
      const cond = extra.condicion ?? { tipo: "Pk_maximo", valor: 0.20 };
      const resultado = optimizarK(params.lambda, params.mu, cond, isFinite(params.M) ? params.M : Infinity);
      valor = resultado.valorOptimo; unidad = "servidores";
      tablaOptimizacion = resultado.tabla;
      desarrollo.push(...resultado.desarrollo);
      break;
    }
    case "optimizar_m_condicion": {
      const cond = extra.condicion ?? { tipo: "Pk_maximo", valor: 0.20 };
      const resultado = optimizarM(params.lambda, params.mu, params.k, cond);
      valor = resultado.valorOptimo; unidad = "población (M)";
      tablaOptimizacion = resultado.tabla;
      desarrollo.push(...resultado.desarrollo);
      break;
    }
    case "costo_total_semanal": {
      const cfg = extra.costos ?? { costoServidorDia: 50, costoEsperaHoraCliente: 10, horasPeriodo: jornada.horasDiarias, dias: 7 };
      const dias = cfg.dias ?? 7;
      const costoServidores = cfg.costoServidorDia * params.k * dias;
      const costoSobre = cfg.costoSobre ?? "Lq";
      const horasClienteTotales = (costoSobre === "L" ? metricas.L : metricas.Lq) * cfg.horasPeriodo * dias;
      const costoEspera = horasClienteTotales * cfg.costoEsperaHoraCliente;
      const costoTotal = costoServidores + costoEspera;
      desarrollo.push(
        { formula: "Costo servidores = salario/día × k × días", sustitucion: `${cfg.costoServidorDia} × ${params.k} × ${dias}`, operacion: "Calcular", resultado: `$${formatearNumero(costoServidores)}` },
        { formula: `Horas-cliente = ${costoSobre} × horas × días`, sustitucion: `${formatearNumero(costoSobre === "L" ? metricas.L : metricas.Lq)} × ${cfg.horasPeriodo} × ${dias}`, operacion: "Calcular", resultado: formatearNumero(horasClienteTotales) },
        { formula: "Costo variable = horas-cliente × costo/h", sustitucion: `${formatearNumero(horasClienteTotales)} × ${cfg.costoEsperaHoraCliente}`, operacion: "Calcular", resultado: `$${formatearNumero(costoEspera)}` },
        { formula: "Costo total = servidores + espera", sustitucion: `$${formatearNumero(costoServidores)} + $${formatearNumero(costoEspera)}`, operacion: "Sumar", resultado: `$${formatearNumero(costoTotal)}` },
      );
      valor = costoTotal; unidad = "$/semana";
      break;
    }
    case "multiplicar":
    case "total_sistemas_identicos": {
      const factor = extra.factor ?? 1;
      const fuente = extra.fuente ?? "Lq";
      const fuenteValor = metricas[fuente as keyof MetricasCompletas] as number;
      if (fuenteValor === undefined) {
        advertencias.push(`Fuente '${fuente}' no encontrada en métricas`);
        valor = null;
      } else {
        valor = fuenteValor * factor;
        desarrollo.push(
          { formula: `${fuente} × ${factor}`, sustitucion: `${formatearNumero(fuenteValor)} × ${factor}`, operacion: "Multiplicar", resultado: formatearNumero(valor) },
        );
        unidad = tipo === "total_sistemas_identicos" ? fuente : `veces ${fuente}`;
      }
      break;
    }
    case "calcular_con_lambda_alternativo": {
      const lambdaNueva = extra.lambdaNueva ?? (params.lambda * 1.2);
      const metricasAlt = calcularTodo({ modelo: params.modelo, lambda: lambdaNueva, mu: params.mu, k: params.k, M: isFinite(params.M) ? params.M : Infinity });
      const labelLambda = formatearNumero(lambdaNueva);
      const labelWq = formatearNumero(metricasAlt.Wq * 60);
      const labelLq = formatearNumero(metricasAlt.Lq);
      const labelPk = (metricasAlt.Pk * 100).toFixed(2) + "%";
      desarrollo.push(
        { formula: "λ alternativa", sustitucion: `${formatearNumero(params.lambda)} → ${labelLambda} clientes/h`, operacion: "Recalcular", resultado: labelLambda },
        { formula: "Wq con λ nueva (min)", sustitucion: `${labelLambda} → Wq = ${labelWq} min`, operacion: "Recalcular", resultado: `${labelWq} min` },
        { formula: "Lq con λ nueva", sustitucion: `${labelLambda} → Lq = ${labelLq}`, operacion: "Recalcular", resultado: labelLq },
        { formula: "Pk con λ nueva", sustitucion: `${labelLambda} → Pk = ${labelPk}`, operacion: "Recalcular", resultado: labelPk },
      );
      valor = metricasAlt.Wq * 60; unidad = "min (Wq con λ alternativa)";
      advertencias.push(`Scenario: λ = ${labelLambda}/h (vs ${formatearNumero(params.lambda)}/h actual)`);
      break;
    }
    default:
      advertencias.push(`Tipo de literal desconocido: ${tipo}`);
  }

  const valorFormateado = valor === null ? "—"
    : !isFinite(valor) ? "∞"
      : unidad === "probabilidad" || unidad === "fracción" ? (valor * 100).toFixed(2) + "%"
        : Number.isInteger(valor) ? String(valor)
          : valor.toFixed(4);

  return { valor, valorFormateado, unidad, desarrollo, tablaOptimizacion, advertencias };
}

// ─── Reducers ───────────────────────────────────────────────────────────

export function actualizarGeneral(state: NewExerciseState, patch: Partial<GeneralState>): NewExerciseState {
  const general = { ...state.general, ...patch };
  // Resetear literales calculados cuando cambian los parámetros
  return {
    general,
    literales: state.literales.map(l => ({ ...l, resultado: undefined })),
    metricas: undefined,
  };
}

export function agregarLiteral(state: NewExerciseState, tipo: TipoLiteral): NewExerciseState {
  const config = LITERALES_DISPONIBLES.find(l => l.tipo === tipo)!;
  const id = `lit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const nuevo: LiteralState = {
    id,
    tipo,
    label: config.label,
    extra: {},
  };
  return { ...state, literales: [...state.literales, nuevo] };
}

export function eliminarLiteral(state: NewExerciseState, id: string): NewExerciseState {
  return { ...state, literales: state.literales.filter(l => l.id !== id) };
}

export function actualizarExtra(state: NewExerciseState, id: string, patch: Partial<LiteralExtra>): NewExerciseState {
  return {
    ...state,
    literales: state.literales.map(l =>
      l.id === id ? { ...l, extra: { ...l.extra, ...patch }, resultado: undefined } : l,
    ),
  };
}

export function calcularLiteralById(state: NewExerciseState, id: string): NewExerciseState {
  const params = generalAParametros(state.general);
  let metricas = state.metricas;
  if (!metricas) {
    metricas = calcularTodo(params);
  }
  const literales = state.literales.map(l => {
    if (l.id !== id) return l;
    const resultado = calcularLiteral(l, params, metricas!);
    return { ...l, resultado };
  });
  return { ...state, metricas, literales };
}

export function calcularTodosLiterales(state: NewExerciseState): NewExerciseState {
  const params = generalAParametros(state.general);
  
  // Detectar si es modelo heterogéneo
  if (esHeterogeneo(state.general)) {
    const mus = getMusAsArray(state.general);
    const heterogeneoParams: ParametrosHeterogeneo = {
      lambda: entradaATasaHora(state.general.lambdaEntrada),
      mus,
      M: isFinite(state.general.M) ? state.general.M : Infinity,
    };
    const metricasHet = calcularHeterogeneo(heterogeneoParams);
    const literales = state.literales.map(l => ({
      ...l,
      resultado: calcularLiteralHeterogeneo(l, heterogeneoParams, metricasHet),
    }));
    return { ...state, metricasHeterogeneo: metricasHet, literales };
  }
  
  const metricas = calcularTodo(params);
  const literales = state.literales.map(l => ({
    ...l,
    resultado: calcularLiteral(l, params, metricas),
  }));
  return { ...state, metricas, literales };
}

function calcularLiteralHeterogeneo(
  literal: LiteralState,
  params: ParametrosHeterogeneo,
  metricas: MetricasHeterogeneo,
): LiteralResultado {
  const advertencias = [...metricas.advertencias];
  const desarrollo: PasoDesarrollo[] = [...metricas.desarrollo];
  let valor: number | null = null;
  let unidad = "";
  let tablaOptimizacion: import("../domain/cola/optimizar").FilaOptimizacion[] | undefined;

  const { tipo, extra } = literal;
  const jornada = extra.jornada ?? { horasDiarias: 8 };

  switch (tipo) {
    case "P0":
      valor = metricas.P0;
      unidad = "probabilidad";
      break;
    case "Pk":
      valor = metricas.Pk;
      unidad = "probabilidad";
      break;
    case "Lq":
      valor = metricas.Lq;
      unidad = "clientes";
      break;
    case "L":
      valor = metricas.L;
      unidad = "clientes";
      break;
    case "Ln":
      valor = metricas.Ln;
      unidad = "clientes";
      break;
    case "Wq_min":
      valor = metricas.Wq * 60;
      unidad = "minutos";
      break;
    case "Wq_h":
      valor = metricas.Wq;
      unidad = "horas";
      break;
    case "W_min":
      valor = metricas.W * 60;
      unidad = "minutos";
      break;
    case "W_h":
      valor = metricas.W;
      unidad = "horas";
      break;
    case "Wn_min":
      valor = metricas.Wn * 60;
      unidad = "minutos";
      break;
    case "fraccion_espera":
      valor = metricas.Pk;
      unidad = "fracción";
      break;
    case "fraccion_sin_espera":
      valor = 1 - metricas.Pk;
      unidad = "fracción";
      break;
    case "minutos_diarios_vacio":
      valor = metricas.P0 * jornada.horasDiarias * 60;
      unidad = "min/día";
      break;
    case "horas_diarias_vacio":
      valor = metricas.P0 * jornada.horasDiarias;
      unidad = "h/día";
      break;
    case "minutos_diarios_todos_ocupados":
      valor = metricas.Pk * jornada.horasDiarias * 60;
      unidad = "min/día";
      break;
    case "minutos_al_menos_un_libre":
      valor = metricas.P_al_menos_un_libre * jornada.horasDiarias * 60;
      unidad = "min/día";
      break;
    case "fraccion_operacion":
      valor = metricas.fraccionOperacion ?? (params.M < Infinity ? (params.M - metricas.L) / params.M : 0);
      unidad = "fracción";
      break;
    case "en_operacion":
      valor = metricas.enOperacion ?? (params.M < Infinity ? params.M - metricas.L : 0);
      unidad = "unidades";
      break;
    case "het_prob_ambos_ocupados":
      valor = metricas.P_ambos_ocupados ?? metricas.Pk;
      unidad = "probabilidad";
      break;
    case "het_prob_alguno_disponible":
      valor = metricas.P_alguno_disponible ?? metricas.P_al_menos_un_libre;
      unidad = "probabilidad";
      break;
    case "het_en_operacion":
      valor = metricas.enOperacion ?? 0;
      unidad = "unidades";
      break;
    case "het_fraccion_operacion":
      valor = metricas.fraccionOperacion ?? 0;
      unidad = "fracción";
      break;
    case "het_minutos_ambos_ocupados":
      valor = (metricas.P_ambos_ocupados ?? metricas.Pk) * jornada.horasDiarias * 60;
      unidad = "min/día";
      break;
    case "het_minutos_alguno_disponible":
      valor = (metricas.P_alguno_disponible ?? metricas.P_al_menos_un_libre) * jornada.horasDiarias * 60;
      unidad = "min/día";
      break;
    case "clientes_diarios_esperan":
      valor = params.lambda * jornada.horasDiarias * metricas.Pk;
      unidad = "clientes/día";
      break;
    case "clientes_semanales_esperan": {
      const dias = jornada.diasSemana ?? 5;
      valor = params.lambda * jornada.horasDiarias * dias * metricas.Pk;
      unidad = "clientes/semana";
      break;
    }
    case "clientes_semanales_no_esperan": {
      const dias = jornada.diasSemana ?? 5;
      valor = params.lambda * jornada.horasDiarias * dias * (1 - metricas.Pk);
      unidad = "clientes/semana";
      break;
    }
    case "optimizar_m_condicion": {
      const cond = extra.condicion ?? { tipo: "fraccion_no_espera_minima" as const, valor: 0.20 };
      const mus = params.mus;
      const resultado = optimizarMHeterogeneo(params.lambda, mus, cond);
      valor = resultado.valorOptimo;
      unidad = "población (M)";
      tablaOptimizacion = resultado.tabla.map((fila, i) => ({
        valor: fila.M,
        estable: true,
        rho: 0,
        P0: fila.P0,
        Pk: fila.Pk,
        Lq: 0,
        L: fila.L,
        Wq: 0,
        W: 0,
        cumpleCondicion: fila.cumple,
        esOptimo: fila.M === resultado.valorOptimo,
      }));
      break;
    }
    default:
      advertencias.push(`Tipo de literal no soportado para heterogéneos: ${tipo}`);
  }

  const valorFormateado = valor === null ? "—"
    : !isFinite(valor) ? "∞"
      : unidad === "probabilidad" || unidad === "fracción" ? (valor * 100).toFixed(2) + "%"
        : Number.isInteger(valor) ? String(valor)
          : valor.toFixed(4);

  return { valor, valorFormateado, unidad, desarrollo, tablaOptimizacion, advertencias };
}

// ─── Helpers de display ─────────────────────────────────────────────────

export function getLambdaPerHour(g: GeneralState): number {
  if (g.lambdaFlexible) {
    return normalizarEntradaATasaHora(g.lambdaFlexible, "λ").tasaPorHora;
  }
  return entradaATasaHora(g.lambdaEntrada);
}

export function getMuPerHour(g: GeneralState): number {
  if (g.muFlexible) {
    return normalizarEntradaATasaHora(g.muFlexible, "μ").tasaPorHora;
  }
  return entradaATasaHora(g.muEntrada);
}

export function getRho(g: GeneralState): number {
  const lambda = getLambdaPerHour(g);
  const mu = getMuPerHour(g);
  if (mu <= 0 || g.k <= 0) return 0;
  return lambda / (g.k * mu);
}

export function getModelName(g: GeneralState): string {
  const k = g.k;
  const M = g.M;
  const esFinita = isFinite(M);
  const esHeterogeneo = g.model === "mmk_het";
  if (esHeterogeneo && k > 1) return `M/M/${k} (heterogéneo)${esFinita ? `/${M}` : ""}`;
  if (esFinita && k > 1) return `M/M/${k}/${M}`;
  if (esFinita) return `M/M/1/${M}`;
  if (k > 1) return `M/M/${k}`;
  return "M/M/1";
}

export function esHeterogeneo(g: GeneralState): boolean {
  return g.model === "mmk_het" && (
    (g.musFlexibles !== undefined && g.musFlexibles.length > 0) ||
    (g.musEntrada !== undefined && g.musEntrada.length > 0)
  );
}

export function getMusAsArray(g: GeneralState): number[] {
  if (g.musFlexibles && g.musFlexibles.length > 0) {
    return g.musFlexibles.map(mu => {
      const normalizado = normalizarEntradaATasaHora(mu, "μ");
      return normalizado.tasaPorHora;
    });
  }

  if (g.musEntrada && g.musEntrada.length > 0) {
    return g.musEntrada.map(mu => entradaATasaHora(mu));
  }

  return [entradaATasaHora(g.muEntrada)];
}

export function getMusOrdenadas(g: GeneralState): number[] {
  return getMusAsArray(g).sort((a, b) => b - a);
}
