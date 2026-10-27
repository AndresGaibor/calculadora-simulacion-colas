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
  const buscarPaso = (pasos: typeof r.desarrollo, formula: string): typeof r.desarrollo[number] | undefined => {
    for (const item of pasos) {
      if (item.formula === formula) return item;
      const hijo = item.desglose ? buscarPaso(item.desglose.pasos, formula) : undefined;
      if (hijo) return hijo;
    }
  };
  const paso = (formula: string) => buscarPaso(r.desarrollo, formula);
  const pasoP0 = r.desarrollo.find((item) => item.formula.startsWith("P0 = ["));

  expect(r.rho).toBeCloseTo(2 / 3, 6);
  expect(r.P0).toBeCloseTo(0.2, 6);
  expect(r.Pk).toBeCloseTo(8 / 15, 6);
  expect(pasoP0?.sustitucion).toBe("P0 = 1/(2.333333 + 2.666667) = 0.2");
  expect(pasoP0?.desglose?.resumen).toBe("Desglosar P₀");
  expect(pasoP0?.desglose?.pasos.map(({ formula }) => formula)).toEqual([
    "Suma para P0",
    "Término de cola para P0 = a^k/(k!(1-ρ))",
    "Normalizar P0 = 1/(Σ + cola)",
  ]);
  expect(paso("Suma para P0")?.desglose?.resumen).toBe("Desglosar términos de Σ");
  expect(paso("Término de cola para P0 = a^k/(k!(1-ρ))")?.desglose?.resumen).toBe("Desglosar término de cola");
  expect(paso("Capacidad de servicio total")?.sustitucion).toBe("kμ = 2×7.5 = 15 c/h");
  expect(paso("Factor de utilización")?.sustitucion).toBe("ρ = λ/(kμ) = 10/(2×7.5) = 0.666667");
  expect(paso("Término n=0 de Σ para P0")?.sustitucion).toBe("a^0/0! = 1/1 = 1");
  expect(paso("Término n=1 de Σ para P0")?.sustitucion).toBe("1.333333^1/1! = 1.333333/1 = 1.333333");
  expect(paso("Suma para P0")?.sustitucion).toBe("1 + 1.333333 = 2.333333");
  expect(paso("Término de cola para P0 = a^k/(k!(1-ρ))")?.sustitucion).toBe("1.777778/0.666667 = 2.666667");
  expect(paso("Normalizar P0 = 1/(Σ + cola)")?.sustitucion).toBe("1/(2.333333 + 2.666667) = 0.2");
  expect(paso("Numerador de Erlang C = a^k")?.sustitucion).toBe("1.333333^2 = 1.777778");
  expect(paso("Factorial de servidores = k!")?.sustitucion).toBe("2! = 2");
  expect(paso("Capacidad libre = 1-ρ")?.sustitucion).toBe("1-0.666667 = 0.333333");
  expect(paso("Denominador de Erlang C = k!(1-ρ)")?.sustitucion).toBe("2×0.333333 = 0.666667");
  expect(paso("Pk (Erlang C) = [a^k / (k!(1-ρ))] × P0")?.sustitucion).toBe("Pk = [1.777778/0.666667] × 0.2 = 0.533333");
});
