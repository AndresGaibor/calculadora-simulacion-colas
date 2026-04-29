import { expect, test, describe } from "bun:test";
import { normalizarEntradaATasaHora } from "./normalizar-entrada";

describe("normalizarEntradaATasaHora", () => {
  test("1 cada 50 minutos => 1.2 por hora", () => {
    const r = normalizarEntradaATasaHora({
      tipo: "intervalo",
      cantidad: 1,
      cada: 50,
      unidad: "minutos",
    }, "λ");

    expect(r.tasaPorHora).toBeCloseTo(1.2, 4);
  });

  test("servicio medio 6 minutos => 10 por hora", () => {
    const r = normalizarEntradaATasaHora({
      tipo: "tiempo_servicio",
      tiempo: 6,
      unidad: "minutos",
    }, "μ");

    expect(r.tasaPorHora).toBeCloseTo(10, 4);
  });

  test("15 productos por 4 segundos => 60 por hora", () => {
    const r = normalizarEntradaATasaHora({
      tipo: "compuesto_tiempo_unidad",
      unidadesPorCliente: 15,
      tiempoPorUnidad: 4,
      unidadTiempo: "segundos",
    }, "μ");

    expect(r.tasaPorHora).toBeCloseTo(60, 4);
  });

  test("12 ordenadores en 8 horas => 1.5 por hora", () => {
    const r = normalizarEntradaATasaHora({
      tipo: "capacidad_periodo",
      cantidad: 12,
      periodo: 8,
      unidadPeriodo: "horas",
    }, "μ");

    expect(r.tasaPorHora).toBeCloseTo(1.5, 4);
  });

  test("10 páginas/h y 0.9 páginas/manuscrito => 11.1111 por hora", () => {
    const r = normalizarEntradaATasaHora({
      tipo: "capacidad_por_unidad_cliente",
      capacidadUnidades: 10,
      unidadCapacidad: "horas",
      unidadesPorCliente: 0.9,
    }, "μ");

    expect(r.tasaPorHora).toBeCloseTo(11.1111, 4);
  });

  test("tasa directa: 18 por hora => 18", () => {
    const r = normalizarEntradaATasaHora({
      tipo: "tasa",
      valor: 18,
      unidad: "horas",
    }, "λ");

    expect(r.tasaPorHora).toBeCloseTo(18, 4);
  });

  test("tasa en minutos: 2 por minuto => 120 por hora", () => {
    const r = normalizarEntradaATasaHora({
      tipo: "tasa",
      valor: 2,
      unidad: "minutos",
    }, "λ");

    expect(r.tasaPorHora).toBeCloseTo(120, 4);
  });

  test("tasa en segundos: 1 por segundo => 3600 por hora", () => {
    const r = normalizarEntradaATasaHora({
      tipo: "tasa",
      valor: 1,
      unidad: "segundos",
    }, "λ");

    expect(r.tasaPorHora).toBeCloseTo(3600, 4);
  });
});