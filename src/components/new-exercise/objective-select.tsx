import { cn } from "@/lib/utils";

export type ObjectiveId = "P0" | "Pn" | "Lq" | "L" | "Wq" | "W";

interface ObjectiveSelectProps {
  value: ObjectiveId;
  onChange: (objective: ObjectiveId) => void;
  compact?: boolean;
}

const objectives: { id: ObjectiveId; label: string; description: string }[] = [
  { id: "P0", label: "P₀", description: "Probabilidad de sistema vacío" },
  { id: "Pn", label: "Pₙ", description: "Probabilidad de n clientes" },
  { id: "Lq", label: "Lq", description: "Clientes en cola" },
  { id: "L", label: "L", description: "Clientes en sistema" },
  { id: "Wq", label: "Wq", description: "Tiempo en cola" },
  { id: "W", label: "W", description: "Tiempo en sistema" },
];

export function ObjectiveSelect({ value, onChange, compact }: ObjectiveSelectProps) {
  if (compact) {
    return (
      <div className="flex gap-1">
        {objectives.map((objective) => (
          <button
            key={objective.id}
            onClick={() => onChange(objective.id)}
            className={cn(
              "px-2 py-1 rounded text-xs font-mono transition-colors",
              value === objective.id
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {objective.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <section className="bg-card rounded-lg p-4 border border-border">
      <div className="grid grid-cols-3 gap-2">
        {objectives.map((objective) => (
          <button
            key={objective.id}
            onClick={() => onChange(objective.id)}
            className={cn(
              "text-left rounded-md border p-3 transition-colors",
              value === objective.id
                ? "border-secondary-container bg-secondary-container/10"
                : "border-border hover:border-secondary-container/50"
            )}
          >
            <span className="font-mono font-bold text-foreground">{objective.label}</span>
            <p className="text-xs text-muted-foreground mt-1">{objective.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
