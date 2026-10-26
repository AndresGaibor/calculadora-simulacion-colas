import { expect, test } from "bun:test";
import { calcularTodo } from "./calcular-todo";

test("calcular P0 para M/M/1", () => {
  const r = calcularTodo({ modelo: "MM1", lambda: 4, mu: 5, k: 1, M: Infinity });
  expect(r.P0).toBeCloseTo(0.2, 6);
});

test("Calcula Lq para M/M/1 estable", () => {
  const r = calcularTodo({ modelo: "MM1", lambda: 4, mu: 5, k: 1, M: Infinity });
  expect(r.Lq).toBeCloseTo(3.2, 6);
});

test("calcular P0 para M/M/k", () => {
  const r = calcularTodo({ modelo: "MMK", lambda: 4, mu: 3, k: 2, M: Infinity });
  expect(r.P0).toBeCloseTo(0.2, 6);
});

test("Calcula P0 para M/M/k", () => {
  const r = calcularTodo({ modelo: "MMK", lambda: 4, mu: 3, k: 2, M: Infinity });
  expect(r.estable).toBe(true);
  expect(r.P0).toBeCloseTo(0.2, 6);
});

test("muestra la utilización M/M/k con la tasa por servidor", () => {
  const r = calcularTodo({ modelo: "MMK", lambda: 10, mu: 15, k: 2, M: Infinity });
  const paso = r.desarrollo.find(({ formula }) => formula === "Factor de utilización");

  expect(r.rho).toBeCloseTo(1 / 3, 6);
  expect(paso?.sustitucion).toBe("ρ = λ/(kμ) = 10/(2×15) = 0.333333");
  expect(paso?.resultado).toBe("0.333333");
});

test("desglosa M/M/k con μ por servidor y desarrolla P₀ y Pk", () => {
  const r = calcularTodo({ modelo: "MMK", lambda: 10, mu: 7.5, k: 2, M: Infinity });
  const paso = (formula: string) => r.desarrollo.find((item) => item.formula === formula);

  expect(r.rho).toBeCloseTo(2 / 3, 6);
  expect(r.P0).toBeCloseTo(0.2, 6);
  expect(r.Pk).toBeCloseTo(8 / 15, 6);
  expect(paso("Capacidad de servicio total")?.sustitucion).toBe("kμ = 2×7.5 = 15 c/h");
  expect(paso("Factor de utilización")?.sustitucion).toBe("ρ = λ/(kμ) = 10/(2×7.5) = 0.666667");
  expect(paso("Suma para P0")?.sustitucion).toBe("1 + 1.333333 = 2.333333");
  expect(paso("Término de cola para P0 = a^k/(k!(1-ρ))")?.sustitucion).toBe("1.333333^2/(2!×(1-0.666667)) = 2.666667");
  expect(paso("Normalizar P0 = 1/(Σ + cola)")?.sustitucion).toBe("1/(2.333333 + 2.666667) = 0.2");
  expect(paso("Numerador de Erlang C = a^k")?.sustitucion).toBe("1.333333^2 = 1.777778");
  expect(paso("Denominador de Erlang C = k!(1-ρ)")?.sustitucion).toBe("2!×(1-0.666667) = 0.666667");
  expect(paso("Pk (Erlang C) = [a^k / (k!(1-ρ))] × P0")?.sustitucion).toBe("Pk = [1.777778/0.666667] × 0.2 = 0.533333");
});
