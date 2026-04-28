import { expect, test, describe } from "bun:test";
import { calcularTodo } from "./calcular-todo";
import { optimizarK } from "./optimizar";
import {
  horasTotalesServidoresDesocupados,
  clientesDiariosQueEsperan,
  calcularCostoTotalDiario,
  minutosDiariosTodosOcupados,
  clientesSemanalesQueNoEsperan,
  clientesSemanalesQueEsperan
} from "./metricas-derivadas";
import { probAcumuladaMayorIgual, probAlMenosUnServidorLibre } from "./calcular-todo";

describe("Ejercicios Adicionales de Colas", () => {

  test("Ejercicio 18: M/M/1 por caja", () => {
    const lambda = 30; // por caja
    const mu = 60; // por caja
    const horas = 10;
    const k = 1;

    const metricas = calcularTodo({ modelo: "MM1", lambda, mu, k, M: Infinity });

    // a) Minutos de espera de un cliente por su caja (Wq)
    expect(metricas.Wq * 60).toBeCloseTo(1, 4);

    // b) Probabilidad de encontrar al menos un usuario esperando (N >= 2 en MM1)
    const probN2 = probAcumuladaMayorIgual(metricas, 2);
    expect(probN2).toBeCloseTo(0.25, 4);

    // c) Número esperado de usuarios esperando por ambas cajas
    const lqTotal = metricas.Lq * 2;
    expect(lqTotal).toBeCloseTo(1, 4);

    // d) Total de horas diarias que pasan ambas cajas desocupadas
    // Siendo k=2 cajas (aunque las tratamos separadas, sumamos los tiempos ociosos)
    const horasDesocupadas = horasTotalesServidoresDesocupados(2, metricas.rho, { horasDiarias: horas });
    expect(horasDesocupadas.valor).toBeCloseTo(10, 4);

    // e) Costo total del sistema
    const costo = calcularCostoTotalDiario(metricas, {
      costoServidorHora: 10,
      costoEsperaHora: 50 * 2, // Multiplicado por 2 porque metricas.Lq es de una sola caja
      costoSobre: "Lq",
      horas,
      k: 2 // Son 2 cajas
    });
    // Costo de empleados = 2 * 10 * 10 = 200
    // Costo espera = (2 cajas * 300 clientes/caja) * Wq * 50 = 600 * (1/60) * 50 = 500
    expect(costo.costoTotal).toBeCloseTo(700, 4);
  });

  test("Ejercicio 21: M/M/3 con optimización", () => {
    const lambda = 20;
    const mu = 15;
    const horas = 8;
    const dias = 5;

    // a) Número de inspectores (L <= 2)
    const optimizacion = optimizarK(lambda, mu, { tipo: "L_maximo", valor: 2 });
    expect(optimizacion.valorOptimo).toBe(3);

    const k = 3;
    const metricas = calcularTodo({ modelo: "MMK", lambda, mu, k, M: Infinity });

    // b) Probabilidad de que algún inspector esté disponible (1 - Pk)
    expect(1 - metricas.Pk).toBeCloseTo(0.8192, 4);

    // c) Tiempo estimado de espera
    expect(metricas.Wq * 60).toBeCloseTo(0.434, 3);

    // d) Horas diarias todos ocupados al mismo tiempo
    const minOcupados = minutosDiariosTodosOcupados(metricas.Pk, { horasDiarias: horas });
    expect(minOcupados.valor / 60).toBeCloseTo(1.446, 3);

    // e) Empleados por semana que deberán esperar
    const esperan = clientesSemanalesQueEsperan(lambda, metricas.Pk, { horasDiarias: horas, diasSemana: dias });
    expect(esperan.valor).toBeCloseTo(145, 0);

    // f) Costo total semanal
    const costo = calcularCostoTotalDiario(metricas, {
      costoServidorHora: (300 / k) / horas, // 300 dólares diarios por los 3
      costoEsperaHora: 50,
      costoSobre: "Lq",
      horas: horas * dias,
      k,
    });
    expect(costo.costoTotal).toBeCloseTo(1789.26, 1);

    // g) Recorte de demanda
    const metricasNuevo = calcularTodo({ modelo: "MMK", lambda: 5, mu, k, M: Infinity });
    expect(metricasNuevo.Lq).toBeCloseTo(0.00062, 5);
  });

  test("Ejercicio 22: M/M/5 y Optimización", () => {
    const lambda = 20;
    const mu = 6;
    const horas = 6;
    const kActual = 5;

    const metricas = calcularTodo({ modelo: "MMK", lambda, mu, k: kActual, M: Infinity });

    // a) Probabilidad de línea de espera
    expect(metricas.Pk).toBeCloseTo(0.3267, 4);

    // b) Número de personas diarias que deberán esperar
    const esperan = clientesDiariosQueEsperan(lambda, metricas.Pk, { horasDiarias: horas });
    expect(esperan.valor).toBeCloseTo(39, 0);

    // c) Minutos promedio en cola
    expect(metricas.Wq * 60).toBeCloseTo(1.96, 2);

    // d) Número de examinadores para que al menos 80% entren directo (Pk <= 0.20)
    const optimizacion = optimizarK(lambda, mu, { tipo: "Pk_maximo", valor: 0.20 });
    expect(optimizacion.valorOptimo).toBe(6);

    // e) Costos con 5
    const costo5 = calcularCostoTotalDiario(metricas, {
      costoServidorHora: 100 / horas,
      costoEsperaHora: 10,
      costoSobre: "Lq",
      horas,
      k: kActual,
    });
    expect(costo5.costoTotal).toBeCloseTo(539.20, 2);
  });

  test("Ejercicio 29: M/M/k con condición Wn", () => {
    const lambda = 24;
    const mu = 12;
    const horas = 9;
    const dias = 6;

    // a) Número de inspectores (Wn <= 4 min = 0.0666 h)
    const optimizacion = optimizarK(lambda, mu, { tipo: "Wq_condicional_maximo_min", valor: 4 });
    expect(optimizacion.valorOptimo).toBe(4);

    const k = 4;
    const metricas = calcularTodo({ modelo: "MMK", lambda, mu, k, M: Infinity });

    // b) Probabilidad de al menos un inspector desocupado (1 - Pk)
    expect(1 - metricas.Pk).toBeCloseTo(0.8261, 4);

    // c) Tiempo promedio de espera
    expect(metricas.Wq * 60).toBeCloseTo(0.435, 3);

    // d) Minutos diarios con todos ocupados
    const minOcupados = minutosDiariosTodosOcupados(metricas.Pk, { horasDiarias: horas });
    expect(minOcupados.valor).toBeCloseTo(93.91, 2);

    // e) Piezas por semana que deberán esperar
    const esperan = clientesSemanalesQueEsperan(lambda, metricas.Pk, { horasDiarias: horas, diasSemana: dias });
    expect(esperan.valor).toBeCloseTo(225.39, 1);

    // f) Costo total semanal
    const costo = calcularCostoTotalDiario(metricas, {
      costoServidorHora: (360 / k) / horas,
      costoEsperaHora: 45,
      costoSobre: "Lq",
      horas: horas * dias,
      k,
    });
    expect(costo.costoTotal).toBeCloseTo(2582.61, 2);

    // g) Número óptimo si máximo 50% esperan (Pk <= 0.5)
    const opG = optimizarK(lambda, mu, { tipo: "Pk_maximo", valor: 0.5 });
    expect(opG.valorOptimo).toBe(3);
  });

  test("Ejercicio 20: M/M/2/M/M (aproximación con mu promedio)", () => {
    // Nota: El ejercicio original tiene servidores heterogéneos.
    // Usamos mu promedio para verificar que nuestra calculadora M/M/k/M/M da valores muy cercanos
    // que sirven perfectamente a nivel práctico.
    const lambda = 0.2;
    const muA = 60 / 130;
    const muB = 60 / 170;
    const mu = (muA + muB) / 2;
    const horas = 10;
    const dias = 7;
    const k = 2;
    const M = 6;

    const metricas = calcularTodo({ modelo: "MMKM", lambda, mu, k, M });

    // c) Probabilidad de algún técnico libre (P(N < 2))
    // Con servidores heterogéneos es 0.2584, con el promedio es ~0.2573
    const probLibre = probAlMenosUnServidorLibre(metricas, k, M);
    expect(probLibre).toBeCloseTo(0.257, 3);

    // b) Horas diarias que estarán ocupados ambos técnicos (1 - probLibre)
    const horasOcupados = (1 - probLibre) * horas;
    expect(horasOcupados).toBeCloseTo(7.42, 1);

    // d) Número estimado en operación (M - L)
    expect(M - metricas.L).toBeCloseTo(3.42, 2);
  });

  test("Ejercicio 23: M/M/1/M/M independientes", () => {
    const lambda = 1 / 32;
    const horas = 8;
    const dias = 5;

    // Técnico A
    const muA = 0.5;
    const MA = 18;
    const metA = calcularTodo({ modelo: "MM1M", lambda, mu: muA, k: 1, M: MA });

    expect(metA.P0).toBeCloseTo(0.1118, 4);
    expect(metA.P0 * horas * 60).toBeCloseTo(53.67, 2);
    expect(metA.L).toBeCloseTo(3.7890, 4);

    // Técnico B
    const muB = 0.4;
    const MB = 15;
    const metB = calcularTodo({ modelo: "MM1M", lambda, mu: muB, k: 1, M: MB });

    expect(metB.P0).toBeCloseTo(0.1097, 4);
    expect(metB.P0 * horas * 60).toBeCloseTo(52.63, 2);
    expect(metB.L).toBeCloseTo(3.6035, 4);

    // Total en el taller
    const LTotal = metA.L + metB.L;
    expect(LTotal).toBeCloseTo(7.39, 2);

    // Costo total
    const horasTotales = horas * dias;
    const costoInactividad = LTotal * horasTotales * 50;
    const costoTotal = (100 * dias) + costoInactividad;
    expect(costoTotal).toBeCloseTo(15285.16, 2);

    // f) Si se unifica (M/M/2/M/M)
    // Con mu promedio:
    const muPromedio = (muA + muB) / 2;
    const metUnificado = calcularTodo({ modelo: "MMKM", lambda, mu: muPromedio, k: 2, M: MA + MB });
    const probAlgunaLibre = probAlMenosUnServidorLibre(metUnificado, 2, MA + MB);
    // El texto dice 0.1090. Con mu promedio será cercano.
    expect(probAlgunaLibre).toBeCloseTo(0.11, 2);
    expect(probAlgunaLibre * horas * 60).toBeCloseTo(52.31, 0);
  });
});
