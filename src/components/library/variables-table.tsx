import { Formula } from "@/components/ui/formula";

interface Variable {
  symbol: string;
  name: string;
  meaning: string;
  unit: string;
}

interface VariablesTableProps {
  title?: string;
  tag?: string;
  columns?: { symbol: string; name: string; meaning: string; unit: string };
  variables: Variable[];
}

export function VariablesTable({
  title = "Variables y Métricas",
  tag = "Core Notation",
  columns = { symbol: "Symbol", name: "Name", meaning: "Meaning", unit: "Unit" },
  variables,
}: VariablesTableProps) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="text-2xl font-headline font-bold text-on-background tracking-tight">{title}</h2>
        <span className="text-[0.6875rem] font-label uppercase tracking-widest text-on-secondary-container bg-secondary-container px-2 py-1 rounded">{tag}</span>
      </div>
      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/15 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-low border-b border-outline-variant/10 text-[0.6875rem] font-label uppercase tracking-widest text-on-surface-variant">
          <div className="col-span-2">{columns.symbol}</div>
          <div className="col-span-3">{columns.name}</div>
          <div className="col-span-5">{columns.meaning}</div>
          <div className="col-span-2">{columns.unit}</div>
        </div>
        <div className="divide-y divide-outline-variant/5">
          {variables.map((v, idx) => (
            <div
              key={v.symbol}
              className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${
                idx % 2 === 0 ? "bg-surface-container-lowest hover:bg-surface-container-low/50" : "bg-surface-container-low hover:bg-surface-container-low/80"
              }`}
            >
              <div className="col-span-2">
                <Formula math={v.symbol} displayMode={false} className="text-lg font-mono font-medium text-on-background" />
              </div>
              <div className="col-span-3 text-sm font-medium text-on-background">{v.name}</div>
              <div className="col-span-5 text-sm text-on-surface-variant">{v.meaning}</div>
              <div className="col-span-2 text-xs font-mono text-on-surface-variant">{v.unit}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
