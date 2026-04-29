import type { TipoLiteral } from "@/pages/new-exercise-flow";

export interface LiteralHelp {
  resumen: string;
  usarCuando: string;
}

export interface LiteralConfig {
  tipo: TipoLiteral;
  label: string;
  help: LiteralHelp;
  requiereN?: boolean;
  requiereJornada?: boolean;
  requiereCostos?: boolean;
  requiereCondicion?: boolean;
  requierePoblacion?: boolean;
}

const ayuda = (resumen: string, usarCuando: string): LiteralHelp => ({ resumen, usarCuando });

export const LITERALES_DISPONIBLES: LiteralConfig[] = [
  { tipo: "P0", label: "P0 — Prob. sistema vacío / servidores libres", help: ayuda("Probabilidad de que el sistema esté vacío.", "Úsalo cuando necesitas saber qué tan seguido no hay clientes en el sistema.") },
  { tipo: "Pn", label: "Pn — Prob. de exactamente n en el sistema", help: ayuda("Probabilidad de encontrar exactamente n clientes en el sistema.", "Úsalo cuando el ejercicio pide una probabilidad puntual para un valor n."), requiereN: true },
  { tipo: "Pk", label: "Pk — Prob. de que haya línea de espera (Erlang C)", help: ayuda("Probabilidad de que todos los servidores estén ocupados.", "Úsalo para medir la probabilidad de que se forme cola." ) },
  { tipo: "fraccion_espera", label: "Fracción de clientes que deben esperar", help: ayuda("Fracción esperada de clientes que no reciben servicio inmediato.", "Úsalo cuando el ejercicio pide el porcentaje de clientes que esperan." ) },
  { tipo: "fraccion_sin_espera", label: "Fracción de clientes atendidos de inmediato", help: ayuda("Fracción de clientes atendidos al llegar.", "Úsalo cuando necesitas el complemento de la fracción de espera." ) },
  { tipo: "prob_al_menos_un_servidor_libre", label: "P(al menos un servidor libre)", help: ayuda("Probabilidad de que exista al menos un servidor desocupado.", "Úsalo para preguntas de disponibilidad inmediata de servicio." ) },
  { tipo: "prob_al_menos_un_servidor_ocupado", label: "P(al menos un servidor ocupado)", help: ayuda("Probabilidad de que haya trabajo en ejecución.", "Úsalo cuando importa saber si el sistema está activo." ) },
  { tipo: "prob_mas_de_q_esperando", label: "P(Nq ≥ q) — Prob. de al menos q esperando", help: ayuda("Probabilidad de que la cola tenga al menos q clientes.", "Úsalo para límites de cola mínima." ) },
  { tipo: "prob_exacto_q_esperando", label: "P(Nq = q) — Prob. de exactamente q esperando", help: ayuda("Probabilidad de que haya exactamente q clientes en cola.", "Úsalo cuando el ejercicio pide una cola puntual." ) },
  { tipo: "prob_entre_q1_q2_esperando", label: "P(q1 ≤ Nq ≤ q2) — Prob. entre q1 y q2 esperando", help: ayuda("Probabilidad de que la cola caiga dentro de un rango.", "Úsalo cuando el ejercicio pide un intervalo de cola." ) },
  { tipo: "minutos_diarios_cola_positiva", label: "Min. diarios con cola positiva (Nq > 0)", help: ayuda("Tiempo diario con cola activa.", "Úsalo cuando quieres minutos de espera en un día de trabajo."), requiereJornada: true },
  { tipo: "Lq", label: "Lq — Longitud media de la cola", help: ayuda("Número promedio de clientes esperando.", "Úsalo para medir la cola promedio." ) },
  { tipo: "L", label: "L — Número medio de clientes en el sistema", help: ayuda("Número promedio de clientes en cola más servicio.", "Úsalo para el tamaño promedio total del sistema." ) },
  { tipo: "Ln", label: "Ln — Longitud de cola (sólo cuando hay cola)", help: ayuda("Esperanza condicional de la cola cuando existe espera.", "Úsalo cuando interesa la cola solo en los instantes con congestión." ) },
  { tipo: "total_sistemas_identicos", label: "Total para N sistemas idénticos (N × L o N × Lq)", help: ayuda("Escala una métrica por cantidad de sistemas idénticos.", "Úsalo para multiplicar L o Lq por varios sistemas iguales." ) },
  { tipo: "porcentaje_fuera_sistema", label: "% fuera del sistema dado un total M externo", help: ayuda("Porcentaje de clientes fuera del sistema respecto de una población externa.", "Úsalo para ejercicios de población finita o externa." ) },
  { tipo: "Wq_min", label: "Wq — Tiempo medio de espera en cola (minutos)", help: ayuda("Tiempo medio de espera antes de ser atendido.", "Úsalo cuando la respuesta debe expresarse en minutos." ) },
  { tipo: "Wq_h", label: "Wq — Tiempo medio de espera en cola (horas)", help: ayuda("Tiempo medio de espera antes de ser atendido, en horas.", "Úsalo cuando la respuesta debe expresarse en horas." ) },
  { tipo: "W_min", label: "W — Tiempo medio en el sistema (minutos)", help: ayuda("Tiempo medio total dentro del sistema.", "Úsalo cuando la respuesta debe incluir espera y servicio en minutos." ) },
  { tipo: "W_h", label: "W — Tiempo medio en el sistema (horas)", help: ayuda("Tiempo medio total dentro del sistema, en horas.", "Úsalo cuando la respuesta debe incluir espera y servicio en horas." ) },
  { tipo: "Wn_min", label: "Wn — Tiempo de espera en cola no vacía (minutos)", help: ayuda("Tiempo medio de espera condicionando a que sí hubo cola.", "Úsalo para la espera promedio cuando el cliente efectivamente espera." ) },
  { tipo: "Wn_h", label: "Wn — Tiempo de espera en cola no vacía (horas)", help: ayuda("Tiempo medio de espera condicionado, expresado en horas.", "Úsalo cuando la espera condicional se trabaje en horas." ) },
  { tipo: "rho", label: "ρ — Factor de utilización del sistema", help: ayuda("Proporción de utilización de los servidores.", "Úsalo para medir qué tan ocupado está el sistema." ) },
  { tipo: "minutos_diarios_vacio", label: "Min. diarios sistema completamente vacío (P0 × H × 60)", help: ayuda("Minutos al día con el sistema completamente vacío.", "Úsalo para tiempo ocioso diario del sistema."), requiereJornada: true },
  { tipo: "horas_diarias_vacio", label: "Horas diarias sistema completamente vacío (P0 × H)", help: ayuda("Horas al día con el sistema completamente vacío.", "Úsalo para tiempo ocioso diario en horas."), requiereJornada: true },
  { tipo: "minutos_al_menos_un_libre", label: "Min. diarios con al menos un servidor desocupado (P0+P1+... × H × 60)", help: ayuda("Minutos diarios con disponibilidad parcial en el sistema.", "Úsalo cuando importa saber cuánto dura la disponibilidad de al menos un servidor."), requiereJornada: true },
  { tipo: "horas_al_menos_un_libre", label: "Horas diarias con al menos un servidor desocupado", help: ayuda("Horas diarias con al menos un servidor libre.", "Úsalo cuando la disponibilidad se pide en horas."), requiereJornada: true },
  { tipo: "horas_diarias_desocupados_todos", label: "Horas diarias TODOS los servidores desocupados simultáneamente", help: ayuda("Horas al día en que todo el sistema está libre.", "Úsalo cuando el ejercicio pide vacío total simultáneo."), requiereJornada: true },
  { tipo: "horas_totales_servidores_desocupados", label: "Horas totales que pasan todos los servidores desocupados, concurrentemente o no", help: ayuda("Suma de tiempo ocioso de todos los servidores.", "Úsalo cuando el tiempo ocioso se acumula por servidor."), requiereJornada: true },
  { tipo: "minutos_diarios_todos_ocupados", label: "Minutos diarios que TODOS los servidores están ocupados al mismo tiempo", help: ayuda("Minutos con el sistema completamente ocupado.", "Úsalo cuando interesa el tramo diario con cola segura."), requiereJornada: true },
  { tipo: "horas_diarias_todos_ocupados", label: "Horas diarias que TODOS los servidores están ocupados al mismo tiempo", help: ayuda("Horas con todos los servidores ocupados a la vez.", "Úsalo cuando la ocupación simultánea se mide en horas."), requiereJornada: true },
  { tipo: "horas_semanales_vacio", label: "Horas semanales que el sistema pasa vacío", help: ayuda("Tiempo semanal con el sistema vacío.", "Úsalo para acumulados semanales de inactividad."), requiereJornada: true },
  { tipo: "horas_semanales_ocupado", label: "Horas semanales que el sistema está ocupado", help: ayuda("Tiempo semanal con el sistema activo.", "Úsalo para acumulados semanales de ocupación."), requiereJornada: true },
  { tipo: "clientes_diarios_esperan", label: "Estimación de clientes diarios que deben esperar", help: ayuda("Cantidad esperada de clientes que esperan por día.", "Úsalo cuando el ejercicio pide volumen diario de espera."), requiereJornada: true },
  { tipo: "clientes_semanales_esperan", label: "Clientes semanales que deben esperar", help: ayuda("Cantidad esperada de clientes que esperan por semana.", "Úsalo para volumen semanal de espera."), requiereJornada: true },
  { tipo: "clientes_semanales_no_esperan", label: "Clientes semanales que NO deben esperar (atendidos de inmediato)", help: ayuda("Cantidad semanal atendida sin espera.", "Úsalo cuando piden clientes atendidos al instante."), requiereJornada: true },
  { tipo: "clientes_diarios_total", label: "Total de clientes atendidos por día", help: ayuda("Cantidad diaria total de clientes atendidos.", "Úsalo cuando interesa el total atendido por jornada."), requiereJornada: true },
  { tipo: "tiempo_total_semanal_en_sistema", label: "Tiempo total semanal en el sistema (horas)", help: ayuda("Tiempo total acumulado semanal dentro del sistema.", "Úsalo para sumar permanencia semanal en el sistema."), requiereJornada: true },
  { tipo: "fraccion_operacion", label: "Fracción de unidades en operación (M finita)", help: ayuda("Porcentaje de población que está activa.", "Úsalo para población finita cuando quieres la fracción operando."), requierePoblacion: true },
  { tipo: "en_operacion", label: "Número medio de unidades en operación (M finita)", help: ayuda("Cantidad promedio de unidades activas.", "Úsalo para población finita cuando quieres el número operando."), requierePoblacion: true },
  { tipo: "het_prob_ambos_ocupados", label: "P(ambos ocupados) — Prob. de que TODOS los servidores estén ocupados", help: ayuda("Probabilidad de ocupación simultánea en sistemas heterogéneos.", "Úsalo cuando todos los servidores deben estar ocupados." ) },
  { tipo: "het_prob_alguno_disponible", label: "P(alguno disponible) — Prob. de que al menos un servidor esté libre", help: ayuda("Probabilidad de que exista disponibilidad en sistemas heterogéneos.", "Úsalo cuando necesitas al menos un servidor libre." ) },
  { tipo: "het_en_operacion", label: "Número en operación (heterogéneo, M finita)", help: ayuda("Cantidad media en operación para población finita heterogénea.", "Úsalo cuando el sistema es heterogéneo y la población es finita."), requierePoblacion: true },
  { tipo: "het_fraccion_operacion", label: "Fracción en operación (heterogéneo, M finita)", help: ayuda("Fracción operativa en sistemas heterogéneos con población finita.", "Úsalo cuando interesa la proporción de elementos activos."), requierePoblacion: true },
  { tipo: "het_minutos_ambos_ocupados", label: "Min. diarios con TODOS ocupados (P(ambos) × H × 60)", help: ayuda("Minutos diarios con todos los servidores ocupados en heterogéneos.", "Úsalo para tiempo de saturación diaria."), requiereJornada: true },
  { tipo: "het_minutos_alguno_disponible", label: "Min. diarios con alguno libre (P(alguno) × H × 60)", help: ayuda("Minutos diarios con al menos un servidor libre en heterogéneos.", "Úsalo cuando importa el tiempo diario con disponibilidad."), requiereJornada: true },
  { tipo: "costo_total_diario", label: "Costo total diario (salario/día/servidor + costo espera/cliente/hora)", help: ayuda("Costo total de operación diaria.", "Úsalo para evaluar el costo del sistema por día."), requiereCostos: true, requiereJornada: true },
  { tipo: "optimizar_k_costo", label: "¿Cuántos servidores para minimizar costos?", help: ayuda("Busca el k que minimiza el costo total.", "Úsalo cuando el objetivo es encontrar el número óptimo de servidores."), requiereCostos: true, requiereJornada: true },
  { tipo: "optimizar_k_condicion", label: "¿Cuántos servidores para cumplir una condición?", help: ayuda("Busca el menor k que satisface una condición dada.", "Úsalo cuando tienes una restricción de desempeño."), requiereCondicion: true },
  { tipo: "optimizar_m_condicion", label: "¿Cuántos en la población para cumplir condición? (M)", help: ayuda("Busca la población M que cumple la condición.", "Úsalo cuando el sistema es de población finita."), requiereCondicion: true },
  { tipo: "costo_total_semanal", label: "Costo total semanal (costo fijo diario × días + costo espera)", help: ayuda("Costo acumulado del sistema por semana.", "Úsalo cuando el costo debe medirse semanalmente."), requiereCostos: true, requiereJornada: true },
  { tipo: "multiplicar", label: "Multiplicar resultado por N (ej: 5 × Lq)", help: ayuda("Escala un resultado por un factor externo.", "Úsalo cuando el literal pide multiplicar por un número." ) },
  { tipo: "calcular_con_lambda_alternativo", label: "¿Y si λ cambia a X? Recalcular con lambda alternativa", help: ayuda("Recalcula el sistema con una tasa de llegada distinta.", "Úsalo para escenarios hipotéticos con λ nuevo." ) },
];

export const GRUPOS_LITERALES = [
  {
    label: "Probabilidades",
    tipos: [
      "P0", "Pn", "Pk", "fraccion_espera", "fraccion_sin_espera",
      "prob_mas_de_q_esperando", "prob_exacto_q_esperando", "prob_entre_q1_q2_esperando",
      "prob_al_menos_un_servidor_libre", "prob_al_menos_un_servidor_ocupado",
    ] as TipoLiteral[],
  },
  {
    label: "Longitudes (clientes)",
    tipos: ["Lq", "L", "Ln", "en_operacion", "fraccion_operacion", "porcentaje_fuera_sistema", "total_sistemas_identicos"] as TipoLiteral[],
  },
  {
    label: "Tiempos",
    tipos: ["Wq_min", "W_min", "Wq_h", "W_h", "Wn_min", "rho"] as TipoLiteral[],
  },
  {
    label: "Con jornada laboral",
    tipos: [
      "minutos_al_menos_un_libre", "minutos_diarios_vacio", "horas_diarias_vacio", "horas_diarias_desocupados_todos",
      "horas_al_menos_un_libre",
      "horas_semanales_vacio", "horas_semanales_ocupado",
      "clientes_diarios_esperan", "clientes_semanales_esperan", "clientes_diarios_total",
      "clientes_semanales_no_esperan", "tiempo_total_semanal_en_sistema",
      "minutos_diarios_todos_ocupados", "horas_diarias_todos_ocupados",
    ] as TipoLiteral[],
  },
  {
    label: "Costos",
    tipos: ["costo_total_diario", "costo_total_semanal"] as TipoLiteral[],
  },
  {
    label: "Escenarios",
    tipos: ["multiplicar", "calcular_con_lambda_alternativo"] as TipoLiteral[],
  },
  {
    label: "Optimización",
    tipos: ["optimizar_k_costo", "optimizar_k_condicion", "optimizar_m_condicion"] as TipoLiteral[],
  },
] as const;
