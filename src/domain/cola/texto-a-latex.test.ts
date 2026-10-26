import { expect, test } from "bun:test";
import { toLatex } from "./texto-a-latex";

test("toLatex convierte griegos a comandos LaTeX", () => {
  expect(toLatex("λ/(μ-λ)")).toBe("\\lambda/(\\mu-\\lambda)");
  expect(toLatex("P0 = 1 - ρ")).toBe("P_{0} = 1 - \\rho");
});

test("toLatex convierte superíndices Unicode", () => {
  expect(toLatex("λ²")).toBe("\\lambda^{2}");
});

test("toLatex convierte subíndices de métricas", () => {
  expect(toLatex("Lq")).toBe("L_{q}");
  expect(toLatex("Wn")).toBe("W_{n}");
  expect(toLatex("Pk")).toBe("P_{k}");
});

test("toLatex envuelve palabras en \\text{}", () => {
  expect(toLatex("min")).toBe("\\text{min}");
  expect(toLatex("clientes")).toBe("\\text{clientes}");
});

test("toLatex deja variables matemáticas de un carácter sin \\text", () => {
  expect(toLatex("L = 2")).toBe("L = 2");
  expect(toLatex("k = 1")).toBe("k = 1");
});

test("toLatex inserta espacio fino entre número y unidad", () => {
  expect(toLatex("0.2 h")).toBe("0.2\\,\\text{h}");
});

test("toLatex maneja cadena vacía", () => {
  expect(toLatex("")).toBe("");
});
