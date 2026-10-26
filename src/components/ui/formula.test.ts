import { expect, test } from "bun:test";
import { renderFormula } from "./formula";

test("renderFormula genera markup KaTeX", () => {
  const html = renderFormula("\\frac{L}{\\lambda}", false);

  expect(html).toContain("katex");
  expect(html).toContain("mathml");
});

test("escapa texto no confiable en el fallback de KaTeX", () => {
  const html = renderFormula("\\notACommand <img src=x onerror=alert(1)>");

  expect(html).not.toContain("<img");
  expect(html).toContain("&lt;img");
});
