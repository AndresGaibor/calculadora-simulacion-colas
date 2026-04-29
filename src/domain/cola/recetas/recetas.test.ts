import { expect, test, describe } from "bun:test";
import {
  plantillaMM1Completo,
  plantillaMMKCompleto,
  plantillaPoblacionFinita,
  plantillaOptimizarCosto,
  plantillaOptimizarCondicion,
  TODAS_PLANTILLAS,
  getPlantillaPorId,
} from "./plantillas-generales";

describe("plantillas-generales", () => {
  test("plantillaMM1Completo tiene literales", () => {
    expect(plantillaMM1Completo.literales.length).toBeGreaterThan(0);
  });

  test("plantillaMM1Completo contiene P0 y rho", () => {
    const tipos = plantillaMM1Completo.literales.map(l => l.tipo);
    expect(tipos).toContain("P0");
    expect(tipos).toContain("rho");
  });

  test("plantillaMMKCompleto contiene Pk", () => {
    expect(plantillaMMKCompleto.literales.some(l => l.tipo === "Pk")).toBe(true);
  });

  test("plantillaPoblacionFinita contiene en_operacion", () => {
    expect(plantillaPoblacionFinita.literales.some(l => l.tipo === "en_operacion")).toBe(true);
  });

  test("plantillaOptimizarCosto tiene extra con costos", () => {
    const optimizar = plantillaOptimizarCosto.literales.find(l => l.tipo === "optimizar_k_costo");
    expect(optimizar?.extra?.costos).toBeDefined();
    expect(optimizar?.extra?.costos?.costoServidorDia).toBe(100);
  });

  test("plantillaOptimizarCondicion tiene condicion", () => {
    const optimizar = plantillaOptimizarCondicion.literales.find(l => l.tipo === "optimizar_k_condicion");
    expect(optimizar?.extra?.condicion).toBeDefined();
    expect(optimizar?.extra?.condicion?.tipo).toBe("Pk_maximo");
  });

  test("TODAS_PLANTILLAS tiene todas las plantillas", () => {
    expect(TODAS_PLANTILLAS.length).toBe(9);
  });

  test("getPlantillaPorId encuentra plantilla correcta", () => {
    const found = getPlantillaPorId("mm1_completo");
    expect(found).toBeDefined();
    expect(found?.id).toBe("mm1_completo");
  });

  test("getPlantillaPorId retorna undefined para id inexistente", () => {
    const found = getPlantillaPorId("no_existe");
    expect(found).toBeUndefined();
  });
});