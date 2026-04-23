import { expect, test } from "bun:test";
import { addCalculationCard, calculateCalculationCard, createInitialNewExerciseState, updateGeneralParameters } from "./new-exercise-flow";

test("createInitialNewExerciseState crea una tarjeta abierta", () => {
  const state = createInitialNewExerciseState();

  expect(state.cards).toHaveLength(1);
  expect(state.cards[0].expanded).toBe(true);
  expect(state.cards[0].objective).toBe("W");
});

test("addCalculationCard agrega una nueva tarjeta al final", () => {
  const state = createInitialNewExerciseState();
  const nextState = addCalculationCard(state);

  expect(nextState.cards).toHaveLength(2);
  expect(nextState.cards[1].expanded).toBe(true);
});

test("calculateCalculationCard resuelve la tarjeta con el motor", () => {
  const state = createInitialNewExerciseState();
  const nextState = calculateCalculationCard(state, state.cards[0].id);

  expect(nextState.cards[0].result?.value).toBe("3.33");
  expect(nextState.cards[0].result?.unit).toBe("minutos");
});

test("calculateCalculationCard incluye desarrollo del cálculo", () => {
  const state = createInitialNewExerciseState();
  const nextState = calculateCalculationCard(state, state.cards[0].id);

  expect(nextState.cards[0].result?.development).toHaveLength(2);
  expect(nextState.cards[0].result?.development?.[0].formula).toContain("W");
});

test("updateGeneralParameters invalida resultados previos", () => {
  const state = calculateCalculationCard(createInitialNewExerciseState(), "card-1");
  const nextState = updateGeneralParameters(state, { lambda: 70 });

  expect(nextState.general.lambda).toBe(70);
  expect(nextState.cards[0].result).toBeUndefined();
});
