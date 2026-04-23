import { expect, test } from "bun:test";
import { calcularP0MM1, resolverMM1 } from "./mm1";
import { calcularP0MMK, resolverMMK } from "./mmk";

test("calcularP0MM1 devuelve la probabilidad de vacío", () => {
  expect(calcularP0MM1(4, 5)).toBeCloseTo(0.2, 6);
});

test("resolverMM1 calcula Lq para un sistema estable", () => {
  const resultado = resolverMM1({ modelo: "MM1", lambda: 4, mu: 5, objetivo: "Lq" });

  expect(resultado.modelo).toBe("MM1");
  expect(resultado.objetivo).toBe("Lq");
  expect(resultado.estable).toBe(true);
  expect(resultado.valor).toBeCloseTo(3.2, 6);
});

test("calcularP0MMK devuelve la probabilidad de vacío", () => {
  expect(calcularP0MMK(4, 3, 2)).toBeCloseTo(0.2, 6);
});

test("resolverMMK calcula P0 para un sistema estable", () => {
  const resultado = resolverMMK({ modelo: "MMK", lambda: 4, mu: 3, k: 2, objetivo: "P0" });

  expect(resultado.modelo).toBe("MMK");
  expect(resultado.objetivo).toBe("P0");
  expect(resultado.estable).toBe(true);
  expect(resultado.valor).toBeCloseTo(0.2, 6);
});
