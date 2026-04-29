import { expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { InfoHint } from "../ui/info-hint";
import { LiteralHelpContent } from "./literal-help-content";
import { LiteralOptionButton } from "./literal-option-button";

test("InfoHint renderiza la ayuda con botón separado", () => {
  const html = renderToStaticMarkup(
    <InfoHint label="P0">
      <LiteralHelpContent resumen="Resumen breve de prueba" usarCuando="Usar cuando necesites probar la ayuda" />
    </InfoHint>,
  );

  expect(html).toContain('aria-label="Ver ayuda de P0"');
  expect(html).not.toContain(">?</button>");
  expect(html).not.toContain("Resumen breve de prueba");
});

test("LiteralOptionButton renderiza la opción y su ayuda separada", () => {
  const html = renderToStaticMarkup(
    <LiteralOptionButton
      label="P0"
      help={{ resumen: "Resumen de ayuda", usarCuando: "Usar para verificar el botón de ayuda" }}
      onSelect={() => undefined}
    />,
  );

  expect((html.match(/<button/g) ?? []).length).toBe(2);
  expect(html).toContain("P0");
  expect(html).not.toContain("Resumen de ayuda");
});
