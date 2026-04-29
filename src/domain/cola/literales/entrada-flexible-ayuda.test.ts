import { describe, expect, test } from "bun:test";
import { AYUDAS_ENTRADA_FLEXIBLE, AYUDAS_PREPROCESADOR, AYUDA_PLANTILLAS_RAPIDAS } from "./entrada-flexible-ayuda";

describe("ayudas contextuales de entrada flexible", () => {
  test("incluye ayuda por modo de tasa", () => {
    expect(AYUDAS_ENTRADA_FLEXIBLE.tasa).toContain("Tasa directa");
    expect(AYUDAS_ENTRADA_FLEXIBLE.intervalo).toContain("1 cada");
    expect(AYUDAS_ENTRADA_FLEXIBLE.tiempo_servicio).toContain("Tiempo medio");
  });

  test("incluye ayuda breve para preprocesadores y plantillas", () => {
    expect(AYUDAS_PREPROCESADOR.intro).toContain("λ");
    expect(AYUDAS_PREPROCESADOR.intro).toContain("μ");
    expect(AYUDA_PLANTILLAS_RAPIDAS).toContain("ajusta");
  });
});
