/**
 * Plantillas predefinidas (recetas) para resolver ejercicios comunes.
 *
 * Cada plantilla define un conjunto de literales y configuración
 * que permite resolver un tipo de ejercicio con un clic.
 */

import type { RecetaEjercicio } from "./tipos";

export const plantillaMM1Completo: RecetaEjercicio = {
  id: "mm1_completo",
  nombre: "M/M/1 completo",
  descripcion: "P0, ρ, Lq, L, Wq, W, clientes que esperan y costos opcionales.",
  general: { model: "mm1", k: 1 },
  literales: [
    { tipo: "P0" },
    { tipo: "rho" },
    { tipo: "fraccion_espera" },
    { tipo: "Lq" },
    { tipo: "L" },
    { tipo: "Wq_min" },
    { tipo: "W_min" },
    { tipo: "clientes_diarios_esperan", extra: { jornada: { horasDiarias: 8 } } },
  ],
};

export const plantillaMMKCompleto: RecetaEjercicio = {
  id: "mmk_completo",
  nombre: "M/M/k completo",
  descripcion: "P0, Pespera, Lq, L, Wq, W, servidores libres y ocupados.",
  general: { model: "mmk" },
  literales: [
    { tipo: "P0" },
    { tipo: "Pk" },
    { tipo: "fraccion_sin_espera" },
    { tipo: "prob_al_menos_un_servidor_libre" },
    { tipo: "Lq" },
    { tipo: "L" },
    { tipo: "Wq_min" },
    { tipo: "W_min" },
    { tipo: "minutos_diarios_todos_ocupados", extra: { jornada: { horasDiarias: 8 } } },
  ],
};

export const plantillaPoblacionFinita: RecetaEjercicio = {
  id: "poblacion_finita",
  nombre: "Población finita",
  descripcion: "P0, L, Lq, λ efectiva, en operación y fracción en operación.",
  general: { model: "mm1m" },
  literales: [
    { tipo: "P0" },
    { tipo: "Pk" },
    { tipo: "Lq" },
    { tipo: "L" },
    { tipo: "Wq_min" },
    { tipo: "W_min" },
    { tipo: "en_operacion" },
    { tipo: "fraccion_operacion" },
  ],
};

export const plantillaOptimizarCosto: RecetaEjercicio = {
  id: "optimizar_costo",
  nombre: "Optimizar servidores por costo",
  descripcion: "Prueba varios k y elige el menor costo.",
  general: { model: "mmk" },
  literales: [
    {
      tipo: "optimizar_k_costo",
      extra: {
        jornada: { horasDiarias: 8 },
        costos: {
          costoServidorDia: 100,
          costoEsperaHoraCliente: 10,
          horasPeriodo: 8,
          costoSobre: "Lq",
        },
      },
    },
  ],
};

export const plantillaOptimizarCondicion: RecetaEjercicio = {
  id: "optimizar_condicion",
  nombre: "Optimizar por condición",
  descripcion: "Ej: Pespera ≤ 20%, W ≤ 10 min, L ≤ 2.",
  general: { model: "mmk" },
  literales: [
    {
      tipo: "optimizar_k_condicion",
      extra: {
        condicion: { tipo: "Pk_maximo", valor: 0.2 },
      },
    },
  ],
};

export const plantillaOptimizarM: RecetaEjercicio = {
  id: "optimizar_m",
  nombre: "Optimizar población (M)",
  descripcion: "Encuentra el M óptimo para una condición dada.",
  general: { model: "mm1m" },
  literales: [
    {
      tipo: "optimizar_m_condicion",
      extra: {
        condicion: { tipo: "fraccion_no_espera_minima", valor: 0.20 },
      },
    },
  ],
};

export const plantillaCompararAlternativas: RecetaEjercicio = {
  id: "comparar_alternativas",
  nombre: "Comparar alternativas",
  descripcion: "Compara 2 o más configuraciones lado a lado.",
  literales: [
    { tipo: "L" },
    { tipo: "W_min" },
    { tipo: "costo_total_diario", extra: { costos: { costoServidorDia: 50, costoEsperaHoraCliente: 10, horasPeriodo: 8 } } },
  ],
};

export const plantillaMultiColas: RecetaEjercicio = {
  id: "multi_colas",
  nombre: "Multicolas independientes",
  descripcion: "Dos o más sistemas operando en paralelo.",
  literales: [
    { tipo: "Lq" },
    { tipo: "L" },
  ],
};

export const plantillaReproceso: RecetaEjercicio = {
  id: "reproceso",
  nombre: "Reproceso / flujo efectivo",
  descripcion: "Para ejercicios con porcentaje de retorno/reproceso.",
  literales: [
    { tipo: "Lq" },
    { tipo: "L" },
    { tipo: "Wq_min" },
    { tipo: "W_min" },
  ],
};

export const TODAS_PLANTILLAS: RecetaEjercicio[] = [
  plantillaMM1Completo,
  plantillaMMKCompleto,
  plantillaPoblacionFinita,
  plantillaOptimizarCosto,
  plantillaOptimizarCondicion,
  plantillaOptimizarM,
  plantillaCompararAlternativas,
  plantillaMultiColas,
  plantillaReproceso,
];

export function getPlantillaPorId(id: string): RecetaEjercicio | undefined {
  return TODAS_PLANTILLAS.find(p => p.id === id);
}