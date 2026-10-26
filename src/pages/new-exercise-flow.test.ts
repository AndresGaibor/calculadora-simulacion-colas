import { expect, test } from "bun:test";
import {
  agregarLiteral,
  actualizarGeneral,
  calcularLiteralById,
  crearEstadoInicial,
} from "./new-exercise-flow";

test("crearEstadoInicial empieza sin literales", () => {
  expect(crearEstadoInicial().literales).toEqual([]);
});

test("agregarLiteral añade un literal calculable", () => {
  const state = agregarLiteral(crearEstadoInicial(), "P0");
  const literal = state.literales[0]!;
  const calculated = calcularLiteralById(state, literal.id);

  expect(calculated.literales[0]?.resultado?.valor).toBeCloseTo(1 / 3);
});

test("actualizarGeneral invalida resultados previos", () => {
  const state = agregarLiteral(crearEstadoInicial(), "P0");
  const literal = state.literales[0]!;
  const calculated = calcularLiteralById(state, literal.id);
  const nextState = actualizarGeneral(calculated, { lambdaEntrada: { valor: 12, unidad: "horas" } });

  expect(nextState.metricas).toBeUndefined();
  expect(nextState.literales[0]?.resultado).toBeUndefined();
});
