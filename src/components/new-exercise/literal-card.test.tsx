import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LiteralCard } from "./literal-card";
import { LITERALES_DISPONIBLES } from "@/domain/cola/literales/catalogo";
import { actualizarResultadosP0Antiguos, calcularTodosLiterales } from "@/pages/new-exercise-flow";

function crearLiteral(tipo: string) {
  return {
    id: "lit-1",
    tipo,
    label: "Literal de prueba",
    extra: {},
  } as any;
}

test("muestra ayuda contextual en el título y en costos", () => {
  const literal = crearLiteral("costo_total_diario");
  const ayuda = LITERALES_DISPONIBLES.find((item) => item.tipo === literal.tipo)?.help;

  const html = renderToStaticMarkup(
    <LiteralCard
      index={0}
      literal={literal}
      onDelete={() => {}}
      onUpdateExtra={() => {}}
      onCalcular={() => {}}
    />,
  );

  expect(ayuda).toBeDefined();
  expect(html).toContain(ayuda?.resumen ?? "");
  expect(html).toContain("Configuración de costos");
  expect(html).toContain("?");
});

test("ofrece un desarrollo desplegable con fórmulas KaTeX por literal", () => {
  const state = calcularTodosLiterales({
    general: {
      model: "mmk",
      lambdaEntrada: { valor: 10, unidad: "horas" },
      muEntrada: { valor: 7.5, unidad: "horas" },
      k: 2,
      M: Infinity,
    },
    literales: [{ id: "lit-1", tipo: "P0", label: "P0", extra: {} }],
  });
  const html = renderToStaticMarkup(
    <LiteralCard
      index={0}
      literal={state.literales[0]!}
      onDelete={() => {}}
      onUpdateExtra={() => {}}
      onCalcular={() => {}}
    />,
  );

  expect(html).toContain("<details");
  expect(html).toContain("Desarrollo del cálculo");
  expect((html.match(/<summary/g) ?? []).length).toBe(4);
  expect(html.match(/<details\b[^>]*\bopen\b/g) ?? []).toHaveLength(0);
  expect(html).toContain("Desglosar P₀");
  expect(html).toContain("Desglosar términos de Σ");
  expect(html).toContain("Desglosar término de cola");
  expect(html).toContain("Término n=0 de Σ para P0");
  expect(html).toContain("Sustitución");
  expect(html).toContain('class="katex"');
  expect(html).toContain("mfrac");
});

test("muestra el desglose para un resultado P0 guardado con el formato anterior", () => {
  const state = calcularTodosLiterales({
    general: {
      model: "mmk",
      lambdaEntrada: { valor: 10, unidad: "horas" },
      muEntrada: { valor: 7.5, unidad: "horas" },
      k: 2,
      M: Infinity,
    },
    literales: [{ id: "lit-1", tipo: "P0", label: "P0", extra: {} }],
  });
  const literal = state.literales[0]!;
  const resultado = literal.resultado!;
  const desarrolloAnterior = resultado.desarrollo.map((step) =>
    step.formula.startsWith("P0 = [")
      ? {
          formula: step.formula,
          sustitucion: "Σ = 2.333333, cola = 2.666667",
          operacion: "Fórmula de normalización",
          resultado: "0.2",
        }
      : step,
  );
  const restored = actualizarResultadosP0Antiguos({
    ...state,
    literales: [
      { ...literal, resultado: { ...resultado, desarrollo: desarrolloAnterior } },
      { id: "lit-2", tipo: "Lq", label: "Lq", extra: {} },
    ],
  });
  const restoredLiteral = restored.literales[0]!;
  const pasoP0 = restoredLiteral.resultado?.desarrollo.find(step => step.formula.startsWith("P0 = ["));
  const html = renderToStaticMarkup(
    <LiteralCard
      index={0}
      literal={restoredLiteral}
      onDelete={() => {}}
      onUpdateExtra={() => {}}
      onCalcular={() => {}}
    />,
  );

  expect(pasoP0?.sustitucion).toBe("P0 = 1/(2.333333 + 2.666667) = 0.2");
  expect(pasoP0?.desglose?.resumen).toBe("Desglosar P₀");
  expect(restored.literales[1]?.resultado).toBeUndefined();
  expect(html).toContain("Desglosar P₀");
});

test("muestra ayuda contextual en condición", () => {
  const literal = crearLiteral("optimizar_k_condicion");
  const ayuda = LITERALES_DISPONIBLES.find((item) => item.tipo === literal.tipo)?.help;

  const html = renderToStaticMarkup(
    <LiteralCard
      index={0}
      literal={literal}
      onDelete={() => {}}
      onUpdateExtra={() => {}}
      onCalcular={() => {}}
    />,
  );

  expect(ayuda).toBeDefined();
  expect(html).toContain(ayuda?.resumen ?? "");
  expect(html).toContain("Condición de Optimización");
  expect(html).toContain("?");
});
