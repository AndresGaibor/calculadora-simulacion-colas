export type ModeloCola = "MM1" | "MMK" | "MM1M" | "MMKM" | "MMK_HET"; // MMK_HET = M/M/k con servidores heterogéneos
export type Objetivo = "P0" | "Pn" | "Lq" | "L" | "Wq" | "W";

export interface EntradaBase {
  lambda: number;
  mu: number;
  objetivo: Objetivo;
  n?: number;
}

export interface EntradaMM1 extends EntradaBase {
  modelo: "MM1";
}

export interface EntradaMMK extends EntradaBase {
  modelo: "MMK";
  k: number;
}

export interface EntradaMM1M extends EntradaBase {
  modelo: "MM1M";
  M: number;
}

export interface EntradaMMKM extends EntradaBase {
  modelo: "MMKM";
  k: number;
  M: number;
}

export interface PasoDesarrollo {
  formula: string;
  sustitucion: string;
  operacion: string;
  resultado: string;
}

export interface ResultadoCalculo {
  modelo: ModeloCola;
  objetivo: Objetivo;
  valor: number;
  unidad: string;
  advertencias: string[];
  desarrollo: PasoDesarrollo[];
  estable: boolean;
}
