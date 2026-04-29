import { expect, test, describe } from "bun:test";
import { calcularCostoPeriodo, costoServidorPeriodo, CostoSobre } from "./costos";
import type { MetricasCompletas } from "./calcular-todo";

function crearMetricasMock(partial: Partial<MetricasCompletas>): MetricasCompletas {
  return {
    modelo: "MM1",
    estable: true,
    rho: 0.5,
    a: 0.5,
    P0: 0.5,
    Pn: () => 0,
    Pk: 0.3,
    L: 1,
    Lq: 0.5,
    Ln: 0,
    W: 0.1,
    Wq: 0.05,
    Wn: 0.1,
    desarrollo: [],
    advertencias: [],
    ...partial,
  } as MetricasCompletas;
}

describe("costoServidorPeriodo", () => {
  test("cálculo por hora", () => {
    const cfg = { costoServidor: 10, unidadServidor: "hora" as const, costoEsperaHoraCliente: 5, costoSobre: "Lq" as CostoSobre, horasPeriodo: 8, k: 2 };
    expect(costoServidorPeriodo(cfg)).toBeCloseTo(160, 4);
  });

  test("cálculo por día", () => {
    const cfg = { costoServidor: 50, unidadServidor: "dia" as const, costoEsperaHoraCliente: 5, costoSobre: "Lq" as CostoSobre, horasPeriodo: 8, k: 2 };
    expect(costoServidorPeriodo(cfg)).toBeCloseTo(100, 4);
  });

  test("cálculo por período (fijo)", () => {
    const cfg = { costoServidor: 100, unidadServidor: "periodo" as const, costoEsperaHoraCliente: 5, costoSobre: "Lq" as CostoSobre, horasPeriodo: 8, k: 2 };
    expect(costoServidorPeriodo(cfg)).toBeCloseTo(200, 4);
  });
});

describe("calcularCostoPeriodo", () => {
  test("costo sobre Lq", () => {
    const metricas = crearMetricasMock({ Lq: 0.5, L: 1 });
    const cfg = { costoServidor: 10, unidadServidor: "hora" as const, costoEsperaHoraCliente: 5, costoSobre: "Lq" as CostoSobre, horasPeriodo: 8, k: 2 };
    const result = calcularCostoPeriodo(metricas, cfg);

    expect(result.costoServidor).toBeCloseTo(160, 4);
    expect(result.costoEspera).toBeCloseTo(20, 4);
    expect(result.costoTotal).toBeCloseTo(180, 4);
  });

  test("costo sobre L (sistema completo)", () => {
    const metricas = crearMetricasMock({ Lq: 0.5, L: 1 });
    const cfg = { costoServidor: 10, unidadServidor: "hora" as const, costoEsperaHoraCliente: 5, costoSobre: "L" as CostoSobre, horasPeriodo: 8, k: 2 };
    const result = calcularCostoPeriodo(metricas, cfg);

    expect(result.costoServidor).toBeCloseTo(160, 4);
    expect(result.costoEspera).toBeCloseTo(40, 4);
    expect(result.costoTotal).toBeCloseTo(200, 4);
  });

  test("costo con múltiples días", () => {
    const metricas = crearMetricasMock({ Lq: 0.5, L: 1 });
    const cfg = { costoServidor: 10, unidadServidor: "hora" as const, costoEsperaHoraCliente: 5, costoSobre: "Lq" as CostoSobre, horasPeriodo: 8, k: 2, dias: 5 };
    const result = calcularCostoPeriodo(metricas, cfg);

    expect(result.costoServidor).toBeCloseTo(800, 4);
    expect(result.costoEspera).toBeCloseTo(100, 4);
    expect(result.costoTotal).toBeCloseTo(900, 4);
  });

  test("pasos incluye desarrollo", () => {
    const metricas = crearMetricasMock({ Lq: 0.5, L: 1 });
    const cfg = { costoServidor: 10, unidadServidor: "hora" as const, costoEsperaHoraCliente: 5, costoSobre: "Lq" as CostoSobre, horasPeriodo: 8, k: 2 };
    const result = calcularCostoPeriodo(metricas, cfg);

    expect(result.pasos.length).toBeGreaterThan(0);
    expect(result.pasos[0].formula).toContain("servidores");
  });
});