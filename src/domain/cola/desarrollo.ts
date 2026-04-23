import type { PasoDesarrollo } from "./tipos";

export function crearPasoDesarrollo(
  formula: string,
  sustitucion: string,
  operacion: string,
  resultado: string,
): PasoDesarrollo {
  return { formula, sustitucion, operacion, resultado };
}

export function formatearNumero(valor: number, decimales = 6): string {
  if (!Number.isFinite(valor)) return String(valor);
  return Number(valor.toFixed(decimales)).toString();
}
