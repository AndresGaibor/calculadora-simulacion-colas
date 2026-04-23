import { CalculationCard } from "./calculation-card";
import type { CalculationCardState, CalculationResult } from "@/pages/new-exercise-flow";
import type { ObjectiveId } from "./objective-select";

interface CalculationsSectionProps {
  cards: CalculationCardState[];
  results: Record<string, CalculationResult | undefined>;
  onAdd: () => void;
  onToggleExpanded: (cardId: string) => void;
  onChangeObjective: (cardId: string, objective: ObjectiveId) => void;
  onChangeN: (cardId: string, n: number | undefined) => void;
  onCalculate: (cardId: string) => void;
}

export function CalculationsSection({
  cards,
  results,
  onAdd,
  onToggleExpanded,
  onChangeObjective,
  onChangeN,
  onCalculate,
}: CalculationsSectionProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-foreground hover:bg-secondary-container/10"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          + Cálculo
        </button>
      </div>

      <div className="space-y-2">
        {cards.map((card) => (
          <CalculationCard
            key={card.id}
            card={card}
            result={results[card.id]}
            onToggleExpanded={onToggleExpanded}
            onChangeObjective={onChangeObjective}
            onChangeN={onChangeN}
            onCalculate={onCalculate}
          />
        ))}
      </div>
    </section>
  );
}
