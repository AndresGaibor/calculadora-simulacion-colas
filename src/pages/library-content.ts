export interface FormulaCardItem {
  label: string;
  formula: string;
  description?: string;
}

export interface ExampleStep {
  description: string;
  formula?: string;
  result?: string;
}

export interface ExampleItem {
  title: string;
  description?: string;
  given?: string[];
  steps: ExampleStep[];
  finalResult?: string;
}

export interface LibrarySection {
  title: string;
  subtitle?: string;
  paragraphs?: string[];
  bullets?: string[];
  formulas?: FormulaCardItem[];
  examples?: ExampleItem[];
  note?: string;
}

export const librarySections: LibrarySection[] = [
  {
    title: "Teoría de Colas — Introducción",
    subtitle: "Técnicas de Simulación",
    paragraphs: [
      "La teoría de colas (o línea de espera) es una de las técnicas de investigación operacional con mayor aplicación potencial. Todos los negocios, gobierno, industria, escuelas y hospitales tienen problemas de colas.",
      "El objetivo principal es obtener el máximo rendimiento del sistema de servicio.",
    ],
    bullets: [
      "Sistema de colas: sistema donde los elementos intentan utilizar un recurso, llegan a un punto de servicio, esperan en una cola, utilizan el recurso y abandonan el sistema.",
      "Problemas de análisis: conocer si un sistema funciona correctamente.",
      "Problemas de diseño: diseñar características que satisfagan un objetivo global.",
    ],
    note: "El sistema es estable solo cuando la tasa de llegada es menor que la tasa de servicio (λ < μ).",
  },
  {
    title: "Componentes de un Sistema de Colas",
    bullets: [
      "Proceso de llegada: proceso estocástico que describe cómo llegan los elementos al sistema.",
      "Proceso de servicio: proceso estocástico que describe la longitud del tiempo de servicio.",
      "Número de servidores: cantidad de canales de servicio disponibles.",
      "Disciplina de cola: reglas para decidir qué trabajo será atendido (FIFO, LIFO, prioridad, etc.).",
      "Capacidad del sitio de espera: número máximo de clientes que pueden esperar.",
      "Población de posibles usuarios: tamaño del grupo que proporciona clientes (finita o infinita).",
    ],
  },
  {
    title: "Notación de Kendall",
    subtitle: "A/B/c/n/p",
    paragraphs: [
      "Forma estándar para representar sistemas de colas.",
      "A = distribución de llegadas, B = distribución de servicio, c = número de servidores, n = capacidad del sistema, p = población.",
      "Si n y p no aparecen, se supone ambos infinitos.",
    ],
    bullets: [
      "D = tiempos fijos entre llegadas",
      "M = distribución exponencial / proceso Poisson",
      "G = distribución general (distinta de la exponencial)",
    ],
  },
  {
    title: "Definiciones de Términos",
    bullets: [
      "λ (lambda): tasa de llegada, clientes por unidad de tiempo",
      "μ (mu): tasa de servicio, clientes por unidad de tiempo",
      "Lq: número esperado de clientes en la cola",
      "L: número esperado de clientes en el sistema",
      "Wq: tiempo esperado en la cola",
      "W: tiempo esperado en el sistema (W = Wq + 1/μ)",
      "Ln: número esperado en cola no vacía",
      "Wn: tiempo estimado de espera en cola no vacía",
      "ρ: utilización del sistema (rho)",
      "P0: probabilidad de sistema vacío",
      "Pn: probabilidad de tener exactamente n clientes en el sistema",
    ],
  },
  {
    title: "Modelo M/M/1",
    subtitle: "Población infinita, canal simple",
    paragraphs: [
      "El modelo más fácil de resolver. Población infinita, un servidor, llegadas Poisson, tiempos de servicio exponenciales.",
      "Condición de estabilidad: λ/μ < 1",
    ],
    formulas: [
      { label: "Utilización (ρ)", formula: String.raw`\rho = \frac{\lambda}{\mu}`, description: "Porcentaje de tiempo que el servidor está ocupado" },
      { label: "Prob. sistema vacío", formula: String.raw`P_0 = 1 - \frac{\lambda}{\mu}`, description: "Probabilidad de que no haya clientes en el sistema" },
      { label: "Probabilidad Pn", formula: String.raw`P_n = \left(\frac{\lambda}{\mu}\right)^n P_0`, description: "Probabilidad de exactamente n clientes en el sistema" },
      { label: "Lq", formula: String.raw`L_q = \frac{\lambda^2}{\mu(\mu - \lambda)}`, description: "Número esperado de clientes en cola" },
      { label: "L", formula: String.raw`L = \frac{\lambda}{\mu - \lambda}`, description: "Número esperado de clientes en el sistema" },
      { label: "Wq", formula: String.raw`W_q = \frac{\lambda}{\mu(\mu - \lambda)}`, description: "Tiempo esperado en cola" },
      { label: "W", formula: String.raw`W = \frac{1}{\mu - \lambda}`, description: "Tiempo esperado en el sistema" },
      { label: "Ln", formula: String.raw`L_n = \frac{\mu}{\mu - \lambda}`, description: "Número esperado en cola no vacía" },
      { label: "Wn", formula: String.raw`W_n = \frac{1}{\mu - \lambda}`, description: "Tiempo estimado en cola no vacía" },
      { label: "Relación W", formula: String.raw`W = W_q + \frac{1}{\mu}`, description: "Tiempo en sistema = tiempo en cola + tiempo de servicio" },
    ],
    examples: [
      {
        title: "Ejemplo 1: Máquina duplicadora",
        description: "Una máquina con tasa media de servicio de 10 trabajos/hora. Las llegadas son a razón de 5/hora. Si el tiempo de una secretaria está valorado en $3.50/hora:",
        given: ["λ = 5 clientes/hora", "μ = 10 clientes/hora", "Costo tiempo = $3.50/hora", "Día = 8 horas"],
        steps: [
          { description: "Utilización del equipo", formula: String.raw`\rho = \frac{\lambda}{\mu} = \frac{5}{10} = 0.50`, result: "50%" },
          { description: "Tiempo que una llegada debe esperar", formula: String.raw`50\%` },
          { description: "Tiempo promedio en el sistema", formula: String.raw`W = \frac{1}{\mu - \lambda} = \frac{1}{10 - 5} = 0.20 \text{ h/c}` },
          { description: "Costo por día", formula: String.raw`8 \times 5 \times 0.20 \times 3.50 = \$28/\text{día}` },
        ],
        finalResult: "Costo total por espera y funcionamiento: $28/día",
      },
      {
        title: "Ejemplo 2: Refinería",
        description: "Terminal de carga con tasa de llegada de 2 camiones/hora y tasa de servicio de 3 camiones/hora. El 30% son independientes.",
        given: ["λ = 2 c/hora", "μ = 3 c/hora", "30% independientes", "8 horas/día"],
        steps: [
          { description: "Utilización", formula: String.raw`\rho = \frac{2}{3} = 0.66` },
          { description: "Tiempo en sistema", formula: String.raw`W = \frac{1}{\mu - \lambda} = \frac{1}{3 - 2} = 1 \text{ h/c}` },
          { description: "Tiempo independientes/día", formula: String.raw`(2 \times 8)(0.30)(0.67)(1) = 3.2 \text{ h/día}` },
        ],
        finalResult: "Tiempo estimado de espera camiones independientes: 3.2 horas/día",
      },
      {
        title: "Ejemplo 3: Grúa de carga",
        description: "Una grúa con media de 1 llamada cada 30 min y tiempo de servicio de 10 min. Tiempo de máquina = $8.50/hora.",
        given: ["λ = 2 llamadas/hora", "μ = 6 clientes/hora", "8 horas/día"],
        steps: [
          { description: "Tiempo promedio en sistema", formula: String.raw`W = \frac{1}{\mu - \lambda} = \frac{1}{6 - 2} = 0.25 \text{ horas/llamada}` },
          { description: "Demanda diaria", formula: String.raw`8 \times 2 = 16 \text{ llamadas/día}` },
          { description: "Costo total/día", formula: String.raw`8.50 \times 0.25 \times 16 = \$34/\text{día}` },
        ],
        finalResult: "Costo por tiempo perdido: $34/día",
      },
    ],
  },
  {
    title: "Modelo M/M/k",
    subtitle: "Población infinita, canal múltiple",
    paragraphs: [
      "Modelo con k servidores en paralelo. Población infinita, k servidores, llegadas Poisson, tiempos de servicio exponenciales.",
      "Condición de estabilidad: λ/(kμ) < 1",
    ],
    formulas: [
      { label: "P0", formula: String.raw`P_0 = \left[\sum_{n=0}^{k-1} \frac{1}{n!}\left(\frac{\lambda}{\mu}\right)^n + \frac{1}{k!}\left(\frac{\lambda}{\mu}\right)^k\left(\frac{k\mu}{k\mu - \lambda}\right)\right]^{-1}`, description: "Probabilidad de sistema vacío" },
      { label: "Pn (n ≤ k)", formula: String.raw`P_n = \frac{1}{n!}\left(\frac{\lambda}{\mu}\right)^n P_0`, description: "Probabilidad de n clientes (n menor o igual a k)" },
      { label: "Pn (n ≥ k)", formula: String.raw`P_n = \frac{1}{k!k^{\,n-k}}\left(\frac{\lambda}{\mu}\right)^n P_0`, description: "Probabilidad de n clientes (n mayor a k)" },
      { label: "Pk (espera)", formula: String.raw`P_k = \frac{1}{k!}\left(\frac{\lambda}{\mu}\right)^k\left(\frac{k\mu}{k\mu - \lambda}\right)P_0`, description: "Probabilidad de que una llegada tenga que esperar" },
      { label: "L", formula: String.raw`L = \frac{\lambda\mu\left(\frac{\lambda}{\mu}\right)^k P_0}{(k-1)!(k\mu - \lambda)^2} + \frac{\lambda}{\mu}`, description: "Número esperado de clientes en el sistema" },
      { label: "Lq", formula: String.raw`L_q = \frac{\lambda\mu\left(\frac{\lambda}{\mu}\right)^k P_0}{(k-1)!(k\mu - \lambda)^2}`, description: "Número esperado de clientes en cola" },
      { label: "Wq", formula: String.raw`W_q = \frac{L_q}{\lambda}`, description: "Tiempo esperado en cola" },
      { label: "W", formula: String.raw`W = W_q + \frac{1}{\mu}`, description: "Tiempo esperado en el sistema" },
    ],
    examples: [
      {
        title: "Ejemplo 1: Máquina duplicadora (2 máquinas)",
        description: "Dos máquinas pequeñas con μ=10 c/hora cada una vs una máquina grande con μ=15 c/hora.",
        given: ["λ = 5/hora", "Pequeña: μ=10, $5/día", "Grande: μ=15, $10/día"],
        steps: [
          { description: "Costo 1 máquina pequeña", formula: String.raw`\$5 + \$28 = \$33/\text{día}` },
          { description: "Costo 1 máquina grande", formula: String.raw`W = \frac{1}{15-5} = 0.10`, result: "$10 + $14 = $24/día" },
          { description: "Costo 2 máquinas pequeñas", formula: String.raw`P_0 = \frac{1}{1 + 0.5 + 0.167} = 0.60`, result: "W = 0.107", result: "$10 + $14.98 = $24.98/día" },
        ],
        finalResult: "Mejor opción: máquina grande ($24/día)",
      },
      {
        title: "Ejemplo 2: Teléfonos en aeropuerto",
        description: "Demanda Poisson con promedio de 30/hora, tiempo medio de llamada 5 min. Objetivo: no esperar más del 10%.",
        given: ["λ = 30 c/h", "μ = 12 c/h", "Pk < 0.10"],
        steps: [
          { description: "Con k=5", formula: String.raw`P_5 = 0.13` },
          { description: "Con k=6", formula: String.raw`P_6 = 0.047 < 0.10` },
        ],
        finalResult: "Mínimo 6 teléfonos necesarios",
      },
    ],
  },
  {
    title: "Modelo M/M/1/M/M",
    subtitle: "Población finita, canal simple",
    paragraphs: [
      "Modelo cuando el número de clientes potenciales es pequeño (población finita). La llegada de un cliente afecta la probabilidad de futuras llegadas.",
      "Como regla empírica: si la población es menor que 30, usar este modelo.",
    ],
    formulas: [
      { label: "P0", formula: String.raw`P_0 = \left[\sum_{n=0}^{M}\left(\frac{\lambda}{\mu}\right)^n \frac{M!}{(M-n)!}\right]^{-1}`, description: "Probabilidad de sistema vacío" },
      { label: "Pn", formula: String.raw`P_n = \left(\frac{\lambda}{\mu}\right)^n \frac{M!}{(M-n)!} P_0`, description: "Probabilidad de n clientes en el sistema" },
      { label: "L", formula: String.raw`L = \sum_{n=0}^{M} nP_n`, description: "Número esperado de clientes en sistema" },
      { label: "L (alternativa)", formula: String.raw`L = M - \frac{\mu}{\lambda}(1 - P_0)`, description: "Forma alternativa de calcular L" },
      { label: "Lq", formula: String.raw`L_q = L - \frac{\lambda}{\lambda + \mu}(M - L)`, description: "Número esperado en cola" },
    ],
  },
  {
    title: "Modelo M/M/k/M/M",
    subtitle: "Población finita, canal múltiple",
    paragraphs: [
      "Modelo con k servidores y población finita M, donde 1 < k ≤ M.",
    ],
    formulas: [
      { label: "P0", formula: String.raw`P_0 = \left[\sum_{n=0}^{k-1}\left(\frac{\lambda}{\mu}\right)^n \frac{M!}{(M-n)!\,n!} + \sum_{n=k}^{M}\left(\frac{\lambda}{\mu}\right)^n \frac{M!}{(M-n)!\,k!\,k^{\,n-k}}\right]^{-1}`, description: "Probabilidad de sistema vacío" },
      { label: "Pn (n ≤ k)", formula: String.raw`P_n = \left(\frac{\lambda}{\mu}\right)^n \frac{M!}{(M-n)!\,n!} P_0`, description: "Probabilidad cuando n ≤ k" },
      { label: "Pn (n ≥ k)", formula: String.raw`P_n = \left(\frac{\lambda}{\mu}\right)^n \frac{M!}{(M-n)!\,k!\,k^{\,n-k}} P_0`, description: "Probabilidad cuando n ≥ k" },
      { label: "L", formula: String.raw`L = \sum_{n=0}^{M} nP_n`, description: "Número esperado en el sistema" },
      { label: "Lq", formula: String.raw`L_q = \sum_{n=k}^{M}(n-k)P_n`, description: "Número esperado en cola" },
    ],
    examples: [
      {
        title: "Ejemplo: Mantenimiento de máquinas",
        description: "Un mecánico atiende 4 máquinas. Tiempo medio entre requerimientos: 10h, tiempo medio de reparación: 2h. Costo механизо: $20/h, servicio: $50/día.",
        given: ["M = 4 máquinas", "λ = 0.1/hora", "μ = 0.5/hora", "$20/h tiempo perdido", "$50/día mecánico"],
        steps: [
          { description: "Calcular P0", formula: String.raw`P_0 = \left[\sum_{n=0}^{4}\left(\frac{0.1}{0.5}\right)^n \frac{4!}{(4-n)!}\right]^{-1} = 0.4` },
          { description: "L (máquinas fuera de servicio)", formula: String.raw`L = 4 - \frac{0.5}{0.1}(1-0.4) = 1` },
          { description: "Máquinas en operación", formula: String.raw`4 - 1 = 3` },
          { description: "Horas perdidas/día", formula: String.raw`8 \times 1 = 8 \text{ h/día}` },
          { description: "Costo tiempo perdido", formula: String.raw`20 \times 8 = \$160/\text{día}` },
          { description: "Dos mecánicos (sistema separado)", formula: String.raw`\$228/\text{día}` },
          { description: "Dos mecánicos (sistema compartido)", formula: String.raw`\$208.80/\text{día}` },
        ],
        finalResult: "Mejor: sistema con k=2, M=4 ($208.80/día)",
      },
    ],
  },
  {
    title: "Relaciones Fundamentales",
    bullets: [
      "Ley de Little: L = λW",
      "Ley de Little (cola): Lq = λWq",
      "Tiempo en sistema: W = Wq + 1/μ",
      "Clientes en sistema: L = Lq + λ/μ",
    ],
    formulas: [
      { label: "Ley de Little", formula: String.raw`L = \lambda W`, description: "Relación entre clientes y tiempo en sistema" },
      { label: "Ley de Little (cola)", formula: String.raw`L_q = \lambda W_q`, description: "Relación entre clientes en cola y tiempo en cola" },
      { label: "Tiempo total", formula: String.raw`W = W_q + \frac{1}{\mu}`, description: "Tiempo en sistema = tiempo en cola + tiempo de servicio" },
      { label: "Clientes total", formula: String.raw`L = L_q + \frac{\lambda}{\mu}`, description: "Clientes en sistema = clientes en cola + en servicio" },
      { label: "Espera condicional (Wn)", formula: String.raw`W_n = \frac{W_q}{P(\text{esperar})}`, description: "Tiempo promedio de espera sólo para los que SÍ deben esperar" },
    ],
  },
  {
    title: "Métricas Derivadas y de Jornada",
    paragraphs: [
      "Fórmulas útiles para calcular tiempos totales, fracciones y estimaciones en base a una jornada laboral de H horas y D días.",
    ],
    formulas: [
      { label: "Horas-caja desocupadas", formula: String.raw`k(1 - \rho)H`, description: "Tiempo total que pasan todos los servidores desocupados, concurrentemente o no" },
      { label: "Todos los servidores ocupados (min/día)", formula: String.raw`P_k \times H \times 60`, description: "Minutos diarios en que todos los servidores están ocupados al mismo tiempo" },
      { label: "Clientes que NO esperan (por semana)", formula: String.raw`\lambda \times H \times D \times (1 - P_k)`, description: "Clientes que son atendidos de inmediato durante una semana" },
      { label: "Tiempo total en sistema (horas/semana)", formula: String.raw`\lambda \times W \times H \times D`, description: "Horas totales que pasan todos los clientes en el sistema a lo largo de una semana" },
    ],
  },
  {
    title: "Conversión de Unidades",
    paragraphs: [
      "En muchos ejercicios primero debes convertir los datos a unidades consistentes.",
    ],
    formulas: [
      { label: "1 cliente cada 30 min", formula: String.raw`\lambda = \frac{1}{30\,min} = 2\,clientes/hora`, description: "Convertir tiempo entre llegadas a tasa" },
      { label: "Servicio de 10 min", formula: String.raw`\mu = \frac{1}{10\,min} = 6\,clientes/hora`, description: "Convertir tiempo de servicio a tasa" },
      { label: "Horas a minutos", formula: String.raw`\text{minutos} = \text{horas} \times 60`, description: "Multiplicar por 60" },
      { label: "Por día", formula: String.raw`\text{cantidad diaria} = \text{cantidad por hora} \times 8`, description: "Para jornada de 8 horas" },
    ],
  },
];
