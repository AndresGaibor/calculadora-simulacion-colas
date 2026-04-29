import { cn } from "@/lib/utils";

type ModelId = "mm1" | "mmk" | "mm1m" | "mmkm" | "mmk_het";
type Mode = "manual" | "assistant";

interface ModelSelectionSectionProps {
  selectedModel: ModelId;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onModelChange: (modelId: ModelId) => void;
}

const models: {
  id: ModelId;
  name: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "mm1",
    name: "M/M/1",
    description:
      "Población infinita, 1 servidor, llegadas y servicio exponencial.",
    icon: "person",
  },
  {
    id: "mmk",
    name: "M/M/k",
    description:
      "Población infinita, k servidores, llegadas y servicio exponencial.",
    icon: "groups",
  },
  {
    id: "mm1m",
    name: "M/M/1/M/M",
    description:
      "Población finita, 1 servidor, llegadas y servicio exponencial.",
    icon: "person",
  },
  {
    id: "mmkm",
    name: "M/M/k/M/M",
    description:
      "Población finita, k servidores, llegadas y servicio exponencial.",
    icon: "groups",
  },
  {
    id: "mmk_het",
    name: "M/M/k HET",
    description:
      "Servidores con tasas distintas (μ₁, μ₂, ...), población finita o infinita.",
    icon: "groups",
  },
];

export function ModelSelectionSection({
  selectedModel,
  mode,
  onModeChange,
  onModelChange,
}: ModelSelectionSectionProps) {
  return (
    <section className="bg-card rounded-lg border border-border">
      <div className="grid grid-cols-4 gap-1 p-1">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-mono font-medium transition-colors",
              selectedModel === model.id
                ? "bg-secondary-container text-on-secondary-container"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary-container/20",
            )}
          >
            {model.name}
          </button>
        ))}
      </div>
    </section>
  );
}
