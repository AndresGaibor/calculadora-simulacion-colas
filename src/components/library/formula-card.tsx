import { Formula } from "@/components/ui/formula";

interface Formula {
  name: string;
  formula: string;
}

interface FormulaCardProps {
  title: string;
  description?: string;
  stabilityCondition?: string;
  formulas: Formula[];
}

export function FormulaCard({ title, description, stabilityCondition, formulas }: FormulaCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
        {stabilityCondition && (
          <div className="bg-tertiary-container text-on-tertiary-container rounded-2xl p-5 font-mono text-sm border border-tertiary-fixed/20 shadow-sm">
            <div className="text-[0.6875rem] uppercase tracking-wider text-tertiary-fixed-dim/70 mb-2 font-sans font-medium">
              Condición de Estabilidad
            </div>
            <Formula math={stabilityCondition} displayMode className="w-full text-[1.15rem] md:text-[1.25rem]" />
          </div>
        )}
      </div>
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {formulas.map((f) => (
          <div
            key={f.name}
            className="bg-surface-container-lowest p-5 rounded-lg border border-outline-variant/15 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-surface-container-highest group-hover:bg-secondary-container transition-colors" />
            <h3 className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-4">{f.name}</h3>
            <div className="font-mono text-xl text-on-background flex items-center justify-center py-5 bg-surface-container-low/50 rounded-xl overflow-x-auto">
              <Formula math={f.formula} displayMode className="w-full text-[1.15rem] md:text-[1.25rem]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
