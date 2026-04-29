import { describe, expect, test } from "bun:test";
import {
  calcularTodosLiterales,
  LITERALES_DISPONIBLES,
  type NewExerciseState,
  type TipoLiteral,
} from "./new-exercise-flow";

function calcularLiteral(tipo: TipoLiteral, extra: NewExerciseState["literales"][number]["extra"], overrides: Partial<NewExerciseState["general"]> = {}) {
  const state: NewExerciseState = {
    general: {
      model: "mmk",
      lambdaEntrada: { valor: 18, unidad: "horas" },
      muEntrada: { valor: 10, unidad: "horas" },
      k: 3,
      M: Infinity,
      ...overrides,
    },
    literales: [{ id: "literal", tipo, label: tipo, extra }],
  };

  return calcularTodosLiterales(state).literales[0].resultado!;
}

describe("literales generales para ejercicios directos", () => {
  test("expone botones generales para probabilidades de cola", () => {
    const tipos = LITERALES_DISPONIBLES.map(l => l.tipo);

    expect(tipos).toContain("prob_mas_de_q_esperando");
    expect(tipos).toContain("prob_entre_q1_q2_esperando");
    expect(tipos).toContain("prob_al_menos_un_servidor_libre");
    expect(tipos).toContain("prob_al_menos_un_servidor_ocupado");
  });

  test("calcula probabilidad de al menos un servidor libre y ocupado", () => {
    const libre = calcularLiteral("prob_al_menos_un_servidor_libre", {});
    const ocupado = calcularLiteral("prob_al_menos_un_servidor_ocupado", {});

    expect(libre.valor).toBeCloseTo(0.6453, 3);
    expect(ocupado.valor).toBeCloseTo(0.854, 3);
  });

  test("calcula horas con al menos un servidor libre y horas con todos ocupados", () => {
    const libre = calcularLiteral("horas_al_menos_un_libre", { jornada: { horasDiarias: 8 } });
    const ocupados = calcularLiteral("horas_diarias_todos_ocupados", { jornada: { horasDiarias: 8 } });

    expect(libre.valor).toBeCloseTo(5.162, 3);
    expect(ocupados.valor).toBeCloseTo(2.838, 3);
  });

  test("calcula total para N sistemas idénticos", () => {
    const resultado = calcularLiteral("total_sistemas_identicos", { fuente: "Lq", factor: 5 }, {
      model: "mm1",
      lambdaEntrada: { valor: 8, unidad: "horas" },
      muEntrada: { valor: 9, unidad: "horas" },
      k: 1,
    });

    expect(resultado.valor).toBeCloseTo(35.5556, 4);
  });

  test("calcula porcentaje fuera del sistema con total externo", () => {
    const resultado = calcularLiteral("porcentaje_fuera_sistema", { poblacionExterna: 15 });

    expect(resultado.valor).toBeGreaterThan(0);
    expect(resultado.valor).toBeLessThan(1);
  });

  test("calcula costo diario por tiempo en sistema usando W", () => {
    const resultado = calcularLiteral("costo_total_diario", {
      costos: {
        costoServidorDia: 100,
        costoEsperaHoraCliente: 50,
        horasPeriodo: 10,
        costoSobre: "L",
      },
      jornada: { horasDiarias: 10 },
    }, {
      lambdaEntrada: { valor: 50, unidad: "horas" },
      muEntrada: { valor: 120, unidad: "horas" },
      k: 2,
    });

    expect(resultado.valor).toBeCloseTo(417.79, 2);
  });
});
