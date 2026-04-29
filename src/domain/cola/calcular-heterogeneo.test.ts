import { describe, test, expect } from "bun:test";
import { calcularHeterogeneo } from "./calcular-heterogeneo";

describe("Motor heterogéneo - Ejercicio 20", () => {
  test("debe calcular correctamente para 2 técnicos con μ distintos", () => {
    // Datos ejercicio 20:
    // λ = 1/5 = 0.2 por hora (cada medio día)
    // Técnico A: μ_A = 60/130 = 0.4615 por hora
    // Técnico B: μ_B = 60/170 = 0.3529 por hora
    // M = 6 montacargas

    const result = calcularHeterogeneo({
      lambda: 0.2,
      mus: [0.4615, 0.3529],
      M: 6,
    });

    console.log("=== Ejercicio 20 Verificación ===");
    console.log("P0:", result.P0);
    console.log("Pk (prob espera):", result.Pk);
    console.log("P_ambos_ocupados:", result.P_ambos_ocupados);
    console.log("P_alguno_disponible:", result.P_alguno_disponible);
    console.log("L:", result.L);
    console.log("Lq:", result.Lq);
    console.log("enOperacion:", result.enOperacion);
    console.log("fraccionOperacion:", result.fraccionOperacion);
    console.log("Wq (horas):", result.Wq);
    console.log("W (horas):", result.W);

    // Verificar que Pk + P_alguno_disponible = 1
    expect(result.Pk + result.P_alguno_disponible).toBeCloseTo(1, 5);

    // Verificar que enOperacion = M - L
    expect(result.enOperacion).toBeCloseTo(6 - result.L, 4);

    // Para M=6, fracción en operación debe ser positiva
    expect(result.fraccionOperacion).toBeGreaterThan(0);
    expect(result.fraccionOperacion).toBeLessThanOrEqual(1);
  });

  test("debe calcular correctamente la probabilidad de ambos ocupados", () => {
    const result = calcularHeterogeneo({
      lambda: 0.2,
      mus: [0.4615, 0.3529],
      M: 6,
    });

    // P(ambos ocupados) + P(al menos uno libre) = 1
    expect(result.P_ambos_ocupados).toBeDefined();
    expect(result.P_alguno_disponible).toBeDefined();
    expect(result.P_ambos_ocupados! + result.P_alguno_disponible!).toBeCloseTo(1, 5);
  });

  test("debe encontrar M=6 como óptimo para fracción no espera ≥ 0.20", () => {
    const { optimizarMHeterogeneo } = require("./calcular-heterogeneo");

    const resultado = optimizarMHeterogeneo(
      0.2,
      [0.4615, 0.3529],
      { tipo: "fraccion_no_espera_minima", valor: 0.20 },
      20,
    );

    console.log("=== Optimización M ===");
    console.log("M óptimo:", resultado.valorOptimo);
    console.log("Tabla:");
    resultado.tabla.forEach((fila: any) => {
      console.log(`M=${fila.M}: Pk=${fila.Pk.toFixed(4)}, noEspera=${(fila.fraccionNoEspera * 100).toFixed(2)}%, cumple=${fila.cumple}`);
    });

    // El valor óptimo debe ser 6 o mayor
    expect(resultado.valorOptimo).toBeGreaterThanOrEqual(6);
  });

  test("debe funcionar con población infinita", () => {
    const result = calcularHeterogeneo({
      lambda: 10,
      mus: [15, 12],
      M: Infinity,
    });

    console.log("=== Población Infinita ===");
    console.log("P0:", result.P0);
    console.log("L:", result.L);
    console.log("Lq:", result.Lq);
    console.log("Pk:", result.Pk);

    expect(result.P0).toBeGreaterThan(0);
    expect(result.P0).toBeLessThan(1);
    expect(result.L).toBeGreaterThan(0);
    expect(result.Pk).toBeGreaterThan(0);
    expect(result.Pk).toBeLessThan(1);
  });
});
