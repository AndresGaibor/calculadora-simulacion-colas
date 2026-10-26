import { navigate } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Modelos M/M clásicos",
    description: "M/M/1, M/M/k, M/M/1/M, M/M/k/M y heterogéneos con tasas distintas por servidor.",
  },
  {
    title: "Entrada flexible",
    description: "λ y μ como tasa, intervalo, tiempo medio, capacidad por período o compuesto.",
  },
  {
    title: "Literales guiados",
    description: "Agrega sub-preguntas a, b, c… con desarrollo paso a paso y resultados formateados.",
  },
  {
    title: "Optimización y costos",
    description: "Busca el k o M óptimo bajo condiciones y calcula costos de operación y espera.",
  },
];

export function HomePage() {
  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
      <section className="text-center max-w-3xl mx-auto py-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-4">
          Teoría de colas
        </p>
        <h1 className="font-headline font-extrabold text-4xl md:text-6xl text-foreground tracking-tight leading-tight mb-5">
          Resuelve ejercicios de colas, paso a paso
        </h1>
        <p className="text-muted-foreground text-lg leading-7 mb-8 max-w-2xl mx-auto">
          Modela llegadas y servicios, agrega literales del enunciado y obtén métricas, desarrollo y
          optimización con el mismo lenguaje del curso.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={() => navigate("/new")}>
            Crear nuevo ejercicio
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/library")}>
            Ver fórmulas
          </Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mt-12">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <h2 className="font-headline text-lg font-semibold text-foreground mb-2">
              {f.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-6">{f.description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
