import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LiteralCard } from "./literal-card";
import { LITERALES_DISPONIBLES } from "@/domain/cola/literales/catalogo";

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
