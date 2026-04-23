import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { navigate } from "@/lib/navigation";

const optimizationAreas = [
  {
    title: "Minimización de costos",
    description: "Encuentra el número de servidores que equilibra costo de servicio y costo de espera.",
  },
  {
    title: "Condiciones sobre P0 y Pk",
    description: "Busca configuraciones que cumplan umbrales de disponibilidad o de espera.",
  },
  {
    title: "Población finita",
    description: "Optimiza escenarios M/M/1/M/M y M/M/k/M/M con límites de población.",
  },
  {
    title: "Análisis rápido",
    description: "Revisa métricas de utilización, colas y tiempos antes de tomar una decisión.",
  },
];

export function OptimizationPage() {
  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 space-y-8">
      <header className="space-y-3 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          Optimización
        </p>
        <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
          Simulador de carga y optimización
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant leading-7">
          Esta vista resume los criterios de optimización disponibles en el motor de teoría de colas.
          Para calcular escenarios concretos, abre la calculadora principal.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {optimizationAreas.map((area) => (
          <Card key={area.title}>
            <CardHeader>
              <CardTitle className="text-lg">{area.title}</CardTitle>
              <CardDescription>{area.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-2xl">Abrir la calculadora</CardTitle>
          <CardDescription>
            La calculadora principal ya incluye los literales de optimización y el motor de resolución.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => navigate("/new")}>Ir a calcular</Button>
          <Button variant="secondary" onClick={() => navigate("/library")}>
            Ver fórmulas
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default OptimizationPage;
