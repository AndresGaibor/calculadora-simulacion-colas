import { expect, test, describe } from "bun:test";
import { flujoPorPorcentajes, flujoEfectivoConReproceso, servicioPonderado } from "./preprocesadores";

describe("preprocesadores", () => {
  test("flujo por porcentajes ejercicio 24", () => {
    const r = flujoPorPorcentajes(50, [0.20, 0.10]);
    expect(r.lambda).toBeCloseTo(15, 4);
  });

  test("flujo por porcentajes con un solo porcentaje", () => {
    const r = flujoPorPorcentajes(100, [0.25]);
    expect(r.lambda).toBeCloseTo(25, 4);
  });

  test("flujo efectivo con reproceso ejercicio 25", () => {
    const r = flujoEfectivoConReproceso({
      lambdaExterna: 6,
      probabilidadRetorno: 0.0455,
    });

    expect(r.lambdaEfectiva).toBeCloseTo(6.2860, 4);
    expect(r.flujoReproceso).toBeCloseTo(0.2860, 4);
  });

  test("flujo efectivo con reproceso retorna advertencia", () => {
    const r = flujoEfectivoConReproceso({
      lambdaExterna: 6,
      probabilidadRetorno: 0.0455,
    });

    expect(r.advertencia).toBeDefined();
    expect(r.advertencia).toContain("aproximación");
  });

  test("flujo efectivo con reproceso: r >= 1 retorna error", () => {
    const r = flujoEfectivoConReproceso({
      lambdaExterna: 6,
      probabilidadRetorno: 1.0,
    });

    expect(r.lambdaEfectiva).toBe(Infinity);
    expect(r.advertencia).toContain("menor que 1");
  });

  test("servicio ponderado", () => {
    const r = servicioPonderado({
      tiempos: [
        { tiempo: 4, probabilidad: 0.6 },
        { tiempo: 8, probabilidad: 0.4 },
      ],
      unidad: "minutos",
    });

    expect(r.tiempoMedio).toBeCloseTo(5.6, 4);
    expect(r.mu).toBeCloseTo(10.7143, 4);
  });

  test("servicio ponderado en segundos", () => {
    const r = servicioPonderado({
      tiempos: [
        { tiempo: 240, probabilidad: 0.6 },
        { tiempo: 480, probabilidad: 0.4 },
      ],
      unidad: "segundos",
    });

    expect(r.tiempoMedio).toBeCloseTo(336, 4);
    expect(r.mu).toBeCloseTo(10.7143, 4);
  });
});