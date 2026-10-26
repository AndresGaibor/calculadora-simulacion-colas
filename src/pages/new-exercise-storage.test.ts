import { expect, test } from "bun:test";
import { calcularTodosLiterales, crearEstadoInicial } from "./new-exercise-flow";
import { deserializarEstado, serializarEstado } from "./new-exercise-storage";

test("persiste y restaura el estado calculado, incluida la población infinita", () => {
  const state = calcularTodosLiterales(crearEstadoInicial());
  const restored = deserializarEstado(serializarEstado(state));

  expect(restored?.general.M).toBe(Infinity);
  expect(restored?.metricas?.rho).toBe(state.metricas?.rho);
  expect(restored?.literales).toEqual(state.literales);
});

test("ignora datos guardados inválidos", () => {
  expect(deserializarEstado("no es json")).toBeUndefined();
  expect(deserializarEstado(JSON.stringify({ general: {}, literales: [] }))).toBeUndefined();
});
