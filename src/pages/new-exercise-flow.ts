/**
 * Estado centralizado para la página /new.
 * 
 * Soporta entrada flexible de parámetros y cálculo de múltiples "literales"
 * (sub-preguntas) de un mismo ejercicio.
 */

import { calcularTodo, type MetricasCompletas, type ParametrosSistema, minutosDiariosAlMenosUnServidorLibre } from "../domain/cola/calcular-todo";
import { optimizarK, optimizarM, type CondicionOptimizacion } from "../domain/cola/optimizar";
import {
  minutosDiariosVacio, horasDiariosVacio, horasSemanalesVacio,
  clientesDiariosQueEsperan, clientesSemanalesQueEsperan,
  calcularCostoTotalDiario, fraccionEnOperacion, enOperacion,
  horasSemanalesOcupado, tiempoTotalSemanalEnSistema, fraccionSinEspera,
  horasDiariosDesocupadosTodos, type ConfigCosto, type Jornada,
  horasTotalesServidoresDesocupados, minutosDiariosTodosOcupados,
  clientesSemanalesQueNoEsperan,
} from "../domain/cola/metricas-derivadas";
import { tasaAHoras, type UnidadTiempo } from "../domain/cola/convertir";
import { formatearNumero } from "../domain/cola/desarrollo";
import type { PasoDesarrollo } from "../domain/cola/tipos";

// ─── Tipos de entrada ───────────────────────────────────────────────────

export type ModelId = "mm1" | "mmk" | "mm1m" | "mmkm";
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
  | "minutos_al_menos_un_libre"   // P(N<k) × H × 60
  | "horas_totales_servidores_desocupados"
  | "minutos_diarios_todos_ocupados"
  | "clientes_diarios_esperan" | "clientes_semanales_esperan" | "clientes_semanales_no_esperan"
  | "clientes_diarios_total"
  | "horas_semanales_ocupado"
  | "tiempo_total_semanal_en_sistema"
  | "fraccion_espera" | "fraccion_sin_espera" | "fraccion_operacion"
  | "en_operacion"
  // Optimización
  | "optimizar_k_costo" | "optimizar_k_condicion" | "optimizar_m_condicion"
  // Costo
  | "costo_total_diario" | "rentabilidad";

export interface LiteralConfig {
  tipo: TipoLiteral;
  label: string;
  requiereN?: boolean;
  requiereJornada?: boolean;
  requiereCostos?: boolean;
  requiereCondicion?: boolean;
  requierePoblacion?: boolean;
}

export const LITERALES_DISPONIBLES: LiteralConfig[] = [
  // ─── Probabilidades ───
  { tipo: "P0", label: "P0 — Prob. sistema vacío / servidores libres" },
  { tipo: "Pn", label: "Pn — Prob. de exactamente n en el sistema", requiereN: true },
  { tipo: "Pk", label: "Pk — Prob. de que haya línea de espera (Erlang C)" },
  { tipo: "fraccion_espera", label: "Fracción de clientes que deben esperar" },
  { tipo: "fraccion_sin_espera", label: "Fracción de clientes atendidos de inmediato" },
  // ─── Longitudes ───
  { tipo: "Lq", label: "Lq — Longitud media de la cola" },
  { tipo: "L", label: "L — Número medio de clientes en el sistema" },
  { tipo: "Ln", label: "Ln — Longitud de cola (sólo cuando hay cola)" },
  // ─── Tiempos ───
  { tipo: "Wq_min", label: "Wq — Tiempo medio de espera en cola (minutos)" },
  { tipo: "Wq_h", label: "Wq — Tiempo medio de espera en cola (horas)" },
  { tipo: "W_min", label: "W — Tiempo medio en el sistema (minutos)" },
  { tipo: "W_h", label: "W — Tiempo medio en el sistema (horas)" },
  { tipo: "Wn_min", label: "Wn — Tiempo de espera en cola no vacía (minutos)" },
  { tipo: "rho", label: "ρ — Factor de utilización del sistema" },
  // ─── Con jornada ───
  { tipo: "minutos_diarios_vacio", label: "Min. diarios sistema completamente vacío (P0 × H × 60)", requiereJornada: true },
  { tipo: "horas_diarias_vacio", label: "Horas diarias sistema completamente vacío (P0 × H)", requiereJornada: true },
  { tipo: "minutos_al_menos_un_libre", label: "Min. diarios con al menos un servidor desocupado (P0+P1+... × H × 60)", requiereJornada: true },
  { tipo: "horas_diarias_desocupados_todos", label: "Horas diarias TODOS los servidores desocupados simultáneamente", requiereJornada: true },
  { tipo: "horas_totales_servidores_desocupados", label: "Horas totales que pasan todos los servidores desocupados, concurrentemente o no", requiereJornada: true },
  { tipo: "minutos_diarios_todos_ocupados", label: "Minutos diarios que TODOS los servidores están ocupados al mismo tiempo", requiereJornada: true },
  { tipo: "horas_semanales_vacio", label: "Horas semanales que el sistema pasa vacío", requiereJornada: true },
  { tipo: "horas_semanales_ocupado", label: "Horas semanales que el sistema está ocupado", requiereJornada: true },
  { tipo: "clientes_diarios_esperan", label: "Estimación de clientes diarios que deben esperar", requiereJornada: true },
  { tipo: "clientes_semanales_esperan", label: "Clientes semanales que deben esperar", requiereJornada: true },
  { tipo: "clientes_semanales_no_esperan", label: "Clientes semanales que NO deben esperar (atendidos de inmediato)", requiereJornada: true },
  { tipo: "clientes_diarios_total", label: "Total de clientes atendidos por día", requiereJornada: true },
  { tipo: "tiempo_total_semanal_en_sistema", label: "Tiempo total semanal en el sistema (horas)", requiereJornada: true },
  // ─── Población finita ───
  { tipo: "fraccion_operacion", label: "Fracción de unidades en operación (M finita)", requierePoblacion: true },
  { tipo: "en_operacion", label: "Número medio de unidades en operación (M finita)", requierePoblacion: true },
  // ─── Costos ───
  { tipo: "costo_total_diario", label: "Costo total diario (salario/día/servidor + costo espera/cliente/hora)", requiereCostos: true, requiereJornada: true },
  // ─── Optimización ───
  { tipo: "optimizar_k_costo", label: "¿Cuántos servidores para minimizar costos?", requiereCostos: true, requiereJornada: true },
  { tipo: "optimizar_k_condicion", label: "¿Cuántos servidores para cumplir una condición?", requiereCondicion: true },
  { tipo: "optimizar_m_condicion", label: "¿Cuántos en la población para cumplir condición? (M)", requiereCondicion: true },
];


// ─── Estado del literal ─────────────────────────────────────────────────

export interface LiteralExtra {
  n?: number;
  jornada?: Jornada;
  costos?: ConfigCostoEjercicio;
  condicion?: CondicionOptimizacion;
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
  k: number;
  M: number; // Infinity = población infinita
}

export interface NewExerciseState {
  general: GeneralState;
  literales: LiteralState[];
  metricas?: MetricasCompletas;
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
    case "minutos_al_menos_un_libre": {
      const M = isFinite(params.M) ? params.M : undefined;
      const r = minutosDiariosAlMenosUnServidorLibre(metricas, params.k, jornada.horasDiarias, M);
      valor = r.valor; unidad = "min/día"; desarrollo.push(...r.pasos);
      break;
    }
    case "costo_total_diario": {
      const cfg = extra.costos ?? { costoServidorDia: 50, costoEsperaHoraCliente: 10, horasPeriodo: jornada.horasDiarias };
      // Costo de servidores = salario/día × k × días
      // Costo de espera = λ × horas × Wq(h) × costo/hora_espera
      const costoServidores = cfg.costoServidorDia * params.k;
      const clientesTotales = params.lambda * cfg.horasPeriodo;
      const horasEsperaTotales = clientesTotales * metricas.Wq;
      const costoEspera = horasEsperaTotales * cfg.costoEsperaHoraCliente;
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
        formula: "Horas totales de espera = (λ × H) × Wq",
        sustitucion: `= ${formatearNumero(clientesTotales)} × ${formatearNumero(metricas.Wq)} h`,
        operacion: "Calcular",
        resultado: `${formatearNumero(horasEsperaTotales)} h-cliente/día`,
      });
      desarrollo.push({
        formula: "C_espera = h_espera × Ce/hora",
        sustitucion: `= ${formatearNumero(horasEsperaTotales)} × $${formatearNumero(cfg.costoEsperaHoraCliente)}`,
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
      const condicion: CondicionOptimizacion = {
        tipo: "minimizar_costo",
        costos: { costoServidor: costoServidorHora, costoEspera: costos.costoEsperaHoraCliente, costoSobre: "cola" },
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
  const metricas = calcularTodo(params);
  const literales = state.literales.map(l => ({
    ...l,
    resultado: calcularLiteral(l, params, metricas),
  }));
  return { ...state, metricas, literales };
}

// ─── Helpers de display ─────────────────────────────────────────────────

export function getLambdaPerHour(g: GeneralState): number {
  return entradaATasaHora(g.lambdaEntrada);
}

export function getMuPerHour(g: GeneralState): number {
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
  if (esFinita && k > 1) return `M/M/${k}/${M}`;
  if (esFinita) return `M/M/1/${M}`;
  if (k > 1) return `M/M/${k}`;
  return "M/M/1";
}