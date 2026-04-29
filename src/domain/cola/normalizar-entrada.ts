/**
 * Normalizador de entradas para teoría de colas.
 *
 * Convierte cualquier formato de entrada que aparezca en un enunciado
 * a una tasa por hora estándar (λ o μ).
 *
 * Formatos soportados:
 * - Tasa directa: "18 clientes/hora"
 * - Intervalo: "1 cada 50 minutos"
 * - Tiempo de servicio: "servicio medio de 6 minutos"
 * - Capacidad por período: "atiende 12 en 8 horas"
 * - Compuesto: "15 productos × 4 segundos"
 * - Capacidad/unidades: "10 páginas/h y 0.9 páginas por manuscrito"
 */

import type { UnidadTiempo } from "./convertir";

export type EntradaTasaGeneral =
  | {
      tipo: "tasa";
      valor: number;
      unidad: UnidadTiempo;
    }
  | {
      tipo: "intervalo";
      cantidad: number;
      cada: number;
      unidad: UnidadTiempo;
    }
  | {
      tipo: "tiempo_servicio";
      tiempo: number;
      unidad: UnidadTiempo;
    }
  | {
      tipo: "capacidad_periodo";
      cantidad: number;
      periodo: number;
      unidadPeriodo: UnidadTiempo;
    }
  | {
      tipo: "compuesto_tiempo_unidad";
      unidadesPorCliente: number;
      tiempoPorUnidad: number;
      unidadTiempo: UnidadTiempo;
    }
  | {
      tipo: "capacidad_por_unidad_cliente";
      capacidadUnidades: number;
      unidadCapacidad: UnidadTiempo;
      unidadesPorCliente: number;
    };

export interface ResultadoNormalizacion {
  tasaPorHora: number;
  formula: string;
  sustitucion: string;
  resultado: string;
}

/**
 * Convierte una entrada flexible a tasa por hora.
 */
export function normalizarEntradaATasaHora(
  entrada: EntradaTasaGeneral,
  etiqueta: "λ" | "μ",
): ResultadoNormalizacion {
  switch (entrada.tipo) {
    case "tasa": {
      const factor =
        entrada.unidad === "segundos" ? 3600 :
        entrada.unidad === "minutos" ? 60 :
        entrada.unidad === "horas" ? 1 :
        1 / 24;

      const tasa = entrada.valor * factor;

      return {
        tasaPorHora: tasa,
        formula: `${etiqueta} = tasa × factor de conversión`,
        sustitucion: `${entrada.valor} por ${entrada.unidad}`,
        resultado: `${tasa.toFixed(4)} por hora`,
      };
    }

    case "intervalo": {
      const horas =
        entrada.unidad === "segundos" ? entrada.cada / 3600 :
        entrada.unidad === "minutos" ? entrada.cada / 60 :
        entrada.unidad === "horas" ? entrada.cada :
        entrada.cada * 24;

      const tasa = entrada.cantidad / horas;

      return {
        tasaPorHora: tasa,
        formula: `${etiqueta} = cantidad / intervalo`,
        sustitucion: `${entrada.cantidad} cada ${entrada.cada} ${entrada.unidad}`,
        resultado: `${tasa.toFixed(4)} por hora`,
      };
    }

    case "tiempo_servicio": {
      const horas =
        entrada.unidad === "segundos" ? entrada.tiempo / 3600 :
        entrada.unidad === "minutos" ? entrada.tiempo / 60 :
        entrada.unidad === "horas" ? entrada.tiempo :
        entrada.tiempo * 24;

      const tasa = 1 / horas;

      return {
        tasaPorHora: tasa,
        formula: `${etiqueta} = 1 / tiempo medio de servicio`,
        sustitucion: `1 / ${entrada.tiempo} ${entrada.unidad}`,
        resultado: `${tasa.toFixed(4)} por hora`,
      };
    }

    case "capacidad_periodo": {
      const horas =
        entrada.unidadPeriodo === "segundos" ? entrada.periodo / 3600 :
        entrada.unidadPeriodo === "minutos" ? entrada.periodo / 60 :
        entrada.unidadPeriodo === "horas" ? entrada.periodo :
        entrada.periodo * 24;

      const tasa = entrada.cantidad / horas;

      return {
        tasaPorHora: tasa,
        formula: `${etiqueta} = capacidad / periodo`,
        sustitucion: `${entrada.cantidad} en ${entrada.periodo} ${entrada.unidadPeriodo}`,
        resultado: `${tasa.toFixed(4)} por hora`,
      };
    }

    case "compuesto_tiempo_unidad": {
      const tiempoTotal = entrada.unidadesPorCliente * entrada.tiempoPorUnidad;
      const horas =
        entrada.unidadTiempo === "segundos" ? tiempoTotal / 3600 :
        entrada.unidadTiempo === "minutos" ? tiempoTotal / 60 :
        entrada.unidadTiempo === "horas" ? tiempoTotal :
        tiempoTotal * 24;

      const tasa = 1 / horas;

      return {
        tasaPorHora: tasa,
        formula: `${etiqueta} = 1 / (unidades por cliente × tiempo por unidad)`,
        sustitucion: `1 / (${entrada.unidadesPorCliente} × ${entrada.tiempoPorUnidad} ${entrada.unidadTiempo})`,
        resultado: `${tasa.toFixed(4)} por hora`,
      };
    }

    case "capacidad_por_unidad_cliente": {
      const factor =
        entrada.unidadCapacidad === "segundos" ? 3600 :
        entrada.unidadCapacidad === "minutos" ? 60 :
        entrada.unidadCapacidad === "horas" ? 1 :
        1 / 24;

      const capacidadPorHora = entrada.capacidadUnidades * factor;
      const tasa = capacidadPorHora / entrada.unidadesPorCliente;

      return {
        tasaPorHora: tasa,
        formula: `${etiqueta} = capacidad por hora / unidades por cliente`,
        sustitucion: `${capacidadPorHora.toFixed(4)} / ${entrada.unidadesPorCliente}`,
        resultado: `${tasa.toFixed(4)} por hora`,
      };
    }
  }
}

/**
 * Crea una entrada de tipo "tasa" desde un valor simple.
 */
export function crearEntradaTasa(valor: number, unidad: UnidadTiempo): EntradaTasaGeneral {
  return { tipo: "tasa", valor, unidad };
}

/**
 * Crea una entrada de tipo "intervalo".
 */
export function crearEntradaIntervalo(cantidad: number, cada: number, unidad: UnidadTiempo): EntradaTasaGeneral {
  return { tipo: "intervalo", cantidad, cada, unidad };
}

/**
 * Crea una entrada de tipo "tiempo_servicio".
 */
export function crearEntradaTiempoServicio(tiempo: number, unidad: UnidadTiempo): EntradaTasaGeneral {
  return { tipo: "tiempo_servicio", tiempo, unidad };
}

/**
 * Crea una entrada de tipo "capacidad_periodo".
 */
export function crearEntradaCapacidadPeriodo(cantidad: number, periodo: number, unidadPeriodo: UnidadTiempo): EntradaTasaGeneral {
  return { tipo: "capacidad_periodo", cantidad, periodo, unidadPeriodo };
}

/**
 * Crea una entrada de tipo "compuesto_tiempo_unidad".
 */
export function crearEntradaCompuesto(unidadesPorCliente: number, tiempoPorUnidad: number, unidadTiempo: UnidadTiempo): EntradaTasaGeneral {
  return { tipo: "compuesto_tiempo_unidad", unidadesPorCliente, tiempoPorUnidad, unidadTiempo };
}

/**
 * Crea una entrada de tipo "capacidad_por_unidad_cliente".
 */
export function crearEntradaCapacidadPorUnidad(capacidadUnidades: number, unidadCapacidad: UnidadTiempo, unidadesPorCliente: number): EntradaTasaGeneral {
  return { tipo: "capacidad_por_unidad_cliente", capacidadUnidades, unidadCapacidad, unidadesPorCliente };
}

/**
 * Obtiene el tipo de entrada como texto legible para UI.
 */
export function getTipoLabel(tipo: EntradaTasaGeneral["tipo"]): string {
  switch (tipo) {
    case "tasa": return "Tasa directa";
    case "intervalo": return "Cada cierto tiempo";
    case "tiempo_servicio": return "Tiempo medio de servicio";
    case "capacidad_periodo": return "Capacidad por período";
    case "compuesto_tiempo_unidad": return "Compuesto (unidades × tiempo)";
    case "capacidad_por_unidad_cliente": return "Capacidad / unidades por cliente";
  }
}