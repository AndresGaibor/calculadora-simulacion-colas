import { navigate } from "@/lib/navigation";

export function HomePage() {
  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-8">
      <div className="text-center py-20">
        <h1 className="font-headline font-bold text-4xl mb-4">Bienvenido a QueueLab</h1>
        <p className="text-muted-foreground text-lg mb-8">Modelado de teoría de colas interactivo</p>
        <button
          onClick={() => navigate("/new")}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          Crear nuevo ejercicio
        </button>
      </div>
    </main>
  );
}
