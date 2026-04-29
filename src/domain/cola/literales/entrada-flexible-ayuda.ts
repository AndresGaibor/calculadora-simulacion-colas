export const AYUDAS_ENTRADA_FLEXIBLE = {
  tasa: "Tasa directa: escribe 18/h, 10 por hora o una equivalencia similar.",
  intervalo: "Intervalo: usa 1 cada 50 min o 5 cada 2 h.",
  tiempo_servicio: "Tiempo medio: indica cuánto tarda 1 cliente en ser atendido.",
  capacidad_periodo: "Capacidad por período: clientes atendidos dentro de una ventana de tiempo.",
  compuesto_tiempo_unidad: "Compuesto: combina cantidad de unidades con tiempo por unidad.",
  capacidad_por_unidad_cliente: "Capacidad por cliente: relación entre unidades disponibles y unidades consumidas.",
} as const;

export const AYUDAS_PREPROCESADOR = {
  intro: "Aplica un ajuste previo para convertir el enunciado en λ o μ efectivos.",
  flujo_porcentajes: "Útil cuando una parte del flujo entra directo y otra se deriva.",
  reproceso: "Convierte un retorno en una λ efectiva mayor.",
  servicio_ponderado: "Promedia tiempos alternativos para obtener una μ efectiva.",
} as const;

export const AYUDA_PLANTILLAS_RAPIDAS = "Carga una base y luego ajusta λ, μ y población sin empezar de cero.";
