import { expect, test } from "bun:test";
import { renderFormula } from "./formula";

test("renderFormula genera markup KaTeX", () => {
  const html = renderFormula("\\frac{L}{\\lambda}", false);

  expect(html).toContain("katex");
  expect(html).toContain("mathml");
});
