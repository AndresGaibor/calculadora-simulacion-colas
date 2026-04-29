import { describe, test, expect } from "bun:test";
import { probAcumuladaMayorIgual, probEsperandoExacto, probMasDeEsperando } from "./calcular-todo";
import { calcularTodo } from "./calcular-todo";

describe("Métricas de probabilidad de cola", () => {
  test("Ejercicio 6c: P(Nq ≥ 3) con M/M/1, λ=8, μ=9", () => {
    // ρ = 8/9 ≈ 0.8889
    // P(Nq ≥ 3) = P(N ≥ 4) = ρ^4 = (8/9)^4 ≈ 0.6243
    const metricas = calcularTodo({ modelo: "MM1", lambda: 8, mu: 9, k: 1, M: Infinity });
    
    const pNqMayor3 = probMasDeEsperando(metricas, 1, 2); // P(Nq > 2) = P(N > 3)
    
    console.log("Ejercicio 6c:");
    console.log("ρ =", metricas.rho);
    console.log("P(Nq ≥ 3) = P(N > 3) = ρ^4 =", Math.pow(metricas.rho, 4));
    console.log("Calculado:", pNqMayor3);
    
    expect(pNqMayor3).toBeCloseTo(Math.pow(8/9, 4), 4);
  });

  test("Ejercicio 27e: P(1 ≤ Nq ≤ 2) con M/M/3, λ=18, μ=10", () => {
    // k=3, λ=18, μ=10
    // P(1 ≤ Nq ≤ 2) = P(N = 4) + P(N = 5)
    const metricas = calcularTodo({ modelo: "MMK", lambda: 18, mu: 10, k: 3, M: Infinity });
    
    const p1 = probEsperandoExacto(metricas, 3, 1); // P(Nq = 1) = P(N = 4)
    const p2 = probEsperandoExacto(metricas, 3, 2); // P(Nq = 2) = P(N = 5)
    const total = p1 + p2;
    
    console.log("Ejercicio 27e:");
    console.log("P(Nq=1) = P(N=4) =", p1);
    console.log("P(Nq=2) = P(N=5) =", p2);
    console.log("Total =", total, "=", (total * 100).toFixed(2) + "%");
    
    // El resultado debe ser aproximadamente 13.62%
    expect(total * 100).toBeCloseTo(13.62, 1);
  });

  test("P(Nq > 0) para M/M/1 con ρ=0.8", () => {
    const metricas = calcularTodo({ modelo: "MM1", lambda: 8, mu: 10, k: 1, M: Infinity });
    
    // Para M/M/1: P(Nq > 0) = P(N > 1) = ρ²
    const rho = metricas.rho;
    const pNqPositiva = probMasDeEsperando(metricas, 1, 0);
    
    console.log("M/M/1 con ρ=0.8:");
    console.log("P(Nq > 0) = ρ² =", rho * rho);
    console.log("Calculado:", pNqPositiva);
    
    expect(pNqPositiva).toBeCloseTo(rho * rho, 6);
  });

  test("P(1 ≤ Nq ≤ 2) para M/M/2", () => {
    const metricas = calcularTodo({ modelo: "MMK", lambda: 80, mu: 50, k: 2, M: Infinity });
    
    const p1 = probEsperandoExacto(metricas, 2, 1); // P(Nq=1) = P(N=3)
    const p2 = probEsperandoExacto(metricas, 2, 2); // P(Nq=2) = P(N=4)
    const total = p1 + p2;
    
    console.log("M/M/2 con λ=80, μ=50:");
    console.log("P(Nq=1) =", p1);
    console.log("P(Nq=2) =", p2);
    console.log("P(1≤Nq≤2) =", total, "=", (total * 100).toFixed(2) + "%");
    
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(1);
  });
});
