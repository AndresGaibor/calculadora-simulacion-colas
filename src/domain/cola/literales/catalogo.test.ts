import { describe, expect, test } from "bun:test";
import { LITERALES_DISPONIBLES, GRUPOS_LITERALES } from "@/pages/new-exercise-flow";

describe("Catálogo de literales", () => {
  test("Todos los literales tienen ayuda", () => {
    for (const literal of LITERALES_DISPONIBLES) {
      expect(literal.help).toBeDefined();
      expect(literal.help.resumen.length).toBeGreaterThan(5);
      expect(literal.help.usarCuando.length).toBeGreaterThan(5);
    }
  });

  test("Todos los tipos usados en grupos existen en el catálogo", () => {
    const tipos = new Set(LITERALES_DISPONIBLES.map((l) => l.tipo));

    for (const grupo of GRUPOS_LITERALES) {
      for (const tipo of grupo.tipos) {
        expect(tipos.has(tipo)).toBe(true);
      }
    }
  });

  test("No hay literales duplicados", () => {
    const tipos = LITERALES_DISPONIBLES.map((l) => l.tipo);
    const unicos = new Set(tipos);
    expect(unicos.size).toBe(tipos.length);
  });
});
