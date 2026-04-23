interface IdentificationSectionProps {
  exerciseName: string;
  description: string;
  onExerciseNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function IdentificationSection({
  exerciseName,
  description,
  onExerciseNameChange,
  onDescriptionChange,
}: IdentificationSectionProps) {
  return (
    <section className="bg-card rounded-xl p-6 md:p-8 flex flex-col gap-6 border border-border">
      <h2 className="font-headline font-bold text-xl text-foreground">1. Identificación</h2>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">Nombre del ejercicio</label>
          <input
            type="text"
            placeholder="Ej. Sistema bancario sucursal norte"
            value={exerciseName}
            onChange={(e) => onExerciseNameChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Descripción <span className="text-muted-foreground font-normal">(Opcional)</span>
          </label>
          <textarea
            placeholder="Notas sobre el contexto del problema..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={2}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
        </div>
      </div>
    </section>
  );
}
