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

test("muestra la utilización M/M/k con dos decimales y coma decimal", () => {
  const r = calcularTodo({ modelo: "MMK", lambda: 10, mu: 15, k: 2, M: Infinity });
  const paso = r.desarrollo.find(({ formula }) => formula === "Factor de utilización");

  expect(r.rho).toBeCloseTo(1 / 3, 6);
  expect(paso?.sustitucion).toBe("ρ = λ/(kμ) = 10/(2×15) = 0,33");
  expect(paso?.resultado).toBe("0,33");
});
