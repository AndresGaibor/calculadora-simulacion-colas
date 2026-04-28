import { expect, test, describe } from "bun:test";
import { calcularTodo } from "./calcular-todo";
import { optimizarK } from "./optimizar";
import {
  clientesDiariosQueEsperan,
  calcularCostoTotalDiario,
  minutosDiariosVacio,
  horasTotalesServidoresDesocupados,
  minutosDiariosTodosOcupados,
  clientesSemanalesQueNoEsperan,
  fraccionEnOperacion,
} from "./metricas-derivadas";
import { probAcumuladaMayorIgual, probEsperandoExacto } from "./calcular-todo";

describe("Resolución de Ejercicios de Clase", () => {
  test("Ejercicio 17: M/M/1 y M/M/k con Costos", () => {
    const lambda = 10;
    const mu = 60 / 4; // 15
    const horas = 12;

    const metricas = calcularTodo({ modelo: "MM1", lambda, mu, k: 1, M: Infinity });

    // a) Probabilidad de que el cajero esté ocioso
    expect(metricas.P0).toBeCloseTo(0.3333, 4);

    // b) Número promedio de automóviles en la cola
    expect(metricas.Lq).toBeCloseTo(1.3333, 4);

    // c) Tiempo promedio en el sistema (minutos)
    expect(metricas.W * 60).toBeCloseTo(12, 4);

    // d) Cantidad de autos diarios que deberán esperar
    const esperan = clientesDiariosQueEsperan(lambda, metricas.Pk, { horasDiarias: horas });
    expect(esperan.valor).toBeCloseTo(80, 0);

    // e) Costo total diario del sistema
    const costo1 = calcularCostoTotalDiario(metricas, {
      costoServidorHora: 100 / horas, // El costo es 100 diario, por lo que por hora es 100/12
      costoEsperaHora: 10,
      costoSobre: "Lq", // El costo es por espera
      horas,
      k: 1,
    });
    expect(costo1.costoTotal).toBeCloseTo(260, 0);

    // f) ¿Cuántos servidores minimizan el costo?
    const resultadoOp = optimizarK(lambda, mu, {
      tipo: "minimizar_costo",
      costos: {
        costoServidor: 100 / horas,
        costoEspera: 10,
        costoSobre: "cola",
      },
    });

    expect(resultadoOp.valorOptimo).toBe(2);
    
    // Verificamos el costo con 2 servidores
    const metricas2 = calcularTodo({ modelo: "MMK", lambda, mu, k: 2, M: Infinity });
    const costo2 = calcularCostoTotalDiario(metricas2, {
      costoServidorHora: 100 / horas,
      costoEsperaHora: 10,
      costoSobre: "Lq",
      horas,
      k: 2,
    });
    expect(costo2.costoTotal).toBeCloseTo(210, 0);
  });

  test("Ejercicio 19: M/M/2", () => {
    const lambda = 50;
    const mu = 60 / 0.5; // 120
    const horas = 10;
    const k = 2;

    const metricas = calcularTodo({ modelo: "MMK", lambda, mu, k, M: Infinity });

    // a) Minutos diarios que ambas cajas están desocupadas al mismo tiempo
    const minVacios = minutosDiariosVacio(metricas.P0, { horasDiarias: horas });
    expect(minVacios.valor).toBeCloseTo(393.10, 1);

    // b) Probabilidad de encontrar al menos un usuario esperando (P(N >= 3))
    const probN3 = probAcumuladaMayorIgual(metricas, 3);
    expect(probN3 * 100).toBeCloseTo(1.50, 2);

    // c) Tiempo promedio de espera de un usuario (segundos)
    expect(metricas.Wq * 3600).toBeCloseTo(1.36, 2); // 1.36 segundos

    // d) Total de horas diarias que pasan ambas cajas desocupadas, concurrentemente o no
    const horasDesocupadas = horasTotalesServidoresDesocupados(k, metricas.rho, { horasDiarias: horas });
    expect(horasDesocupadas.valor).toBeCloseTo(15.83, 2);

    // e) Costo total del sistema
    const costo = calcularCostoTotalDiario(metricas, {
      costoServidorHora: 10,
      costoEsperaHora: 50,
      costoSobre: "L", // costo por cliente esperando o siendo atendido
      horas,
      k,
    });
    expect(costo.costoTotal).toBeCloseTo(417.79, 2);
  });

  test("Ejercicio 26: M/M/3 con restricciones de tiempo", () => {
    const lambda = 18;
    const mu = 10;
    const horas = 8;
    const dias = 5;

    // a) Número de inspectores (W <= 10 min = 0.1666 h)
    const optimizacion = optimizarK(lambda, mu, { tipo: "W_maximo_min", valor: 10 });
    expect(optimizacion.valorOptimo).toBe(3);

    const k = 3;
    const metricas = calcularTodo({ modelo: "MMK", lambda, mu, k, M: Infinity });

    // b) Probabilidad de que algún inspector esté ocupado (1 - P0)
    expect((1 - metricas.P0) * 100).toBeCloseTo(85.40, 2);

    // c) Tiempo estimado de espera por el inspector (minutos)
    expect(metricas.Wq * 60).toBeCloseTo(1.77, 2);

    // d) Minutos diarios que estarán ocupados todos los inspectores al mismo tiempo
    const minOcupados = minutosDiariosTodosOcupados(metricas.Pk, { horasDiarias: horas });
    expect(minOcupados.valor).toBeCloseTo(170.28, 2);

    // e) Número estimado de empleados por semana que no esperarían
    const noEsperan = clientesSemanalesQueNoEsperan(lambda, metricas.Pk, { horasDiarias: horas, diasSemana: dias });
    expect(noEsperan.valor).toBeCloseTo(464.58, 0);

    // f) Costo total semanal
    const costo = calcularCostoTotalDiario(metricas, {
      costoServidorHora: (300 / k) / horas, // 300 dólares/día por el departamento entero
      costoEsperaHora: 50,
      costoSobre: "Lq",
      horas: horas * dias,
      k,
    });
    expect(costo.costoTotal).toBeCloseTo(2564.23, 2);

    // g) Porcentaje estimado de empleados fuera del departamento
    const lambdaNuevo = 9;
    const metricasNuevo = calcularTodo({ modelo: "MMK", lambda: lambdaNuevo, mu, k, M: Infinity });
    const fuera = fraccionEnOperacion(15, metricasNuevo.L);
    expect(fuera.valor * 100).toBeCloseTo(93.80, 2);
  });

  test("Ejercicio 27: M/M/3 con restricciones de probabilidad", () => {
    const lambda = 18;
    const mu = 10; // 6 min por cliente

    // a) Número de ventanillas (Pk <= 0.5)
    const optimizacion = optimizarK(lambda, mu, { tipo: "Pk_maximo", valor: 0.5 });
    expect(optimizacion.valorOptimo).toBe(3);

    const metricas = calcularTodo({ modelo: "MMK", lambda, mu, k: 3, M: Infinity });

    // b) Porcentaje de tiempo que estarán desocupadas una o varias ventanillas (1 - Pk)
    expect((1 - metricas.Pk) * 100).toBeCloseTo(64.53, 2);

    // c) Tiempo de espera de un cliente
    expect(metricas.Wq * 60).toBeCloseTo(1.77, 2);

    // d) Número medio de clientes en la oficina (L)
    expect(metricas.L).toBeCloseTo(2.33, 2);

    // e) Probabilidad de que se encuentren uno o dos clientes esperando (P4 + P5)
    const p4 = probEsperandoExacto(metricas, 3, 1); // 1 esperando -> N=4
    const p5 = probEsperandoExacto(metricas, 3, 2); // 2 esperando -> N=5
    expect((p4 + p5) * 100).toBeCloseTo(13.62, 2);
  });
});
