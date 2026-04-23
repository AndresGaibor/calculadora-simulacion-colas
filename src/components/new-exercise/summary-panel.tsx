interface SummaryPanelProps {
  modelName: string;
  lambda: number;
  mu: number;
  k: number;
  population?: number;
  rho: string;
  onAddCalculation: () => void;
}

export function SummaryPanel({
  modelName,
  lambda,
  mu,
  k,
  population,
  rho,
  onAddCalculation,
}: SummaryPanelProps) {
  const showPopulation = population !== undefined;
  const parseRho = parseFloat(rho);
  const isStable = !isNaN(parseRho) && parseRho < 1;

  return (
    <aside className="w-full md:w-1/4">
      <div className="sticky top-[100px] flex flex-col gap-6">
        <div className="bg-tertiary text-on-tertiary-fixed rounded-xl p-6 flex flex-col gap-5 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-lg">Resumen</h3>
            <span
              className={`inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-wider px-2 py-1 rounded-sm ${
                isStable
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isStable ? "bg-green-400 animate-pulse" : "bg-red-400"
                }`}
              />
              {isStable ? "Estable" : "Inestable"}
            </span>
          </div>

          <div className="bg-on-tertiary-fixed/10 rounded-lg p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl">functions</span>
            <div>
              <p className="text-xs uppercase tracking-wide opacity-70">Modelo</p>
              <p className="font-mono font-bold text-xl mt-0.5">{modelName}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <div className="flex justify-between items-center border-b border-on-tertiary-fixed/10 pb-2">
              <span className="font-mono text-sm opacity-80">λ</span>
              <span className="font-mono text-sm font-medium">
                {lambda} <span className="text-xs opacity-60">c/h</span>
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-on-tertiary-fixed/10 pb-2">
              <span className="font-mono text-sm opacity-80">μ</span>
              <span className="font-mono text-sm font-medium">
                {mu} <span className="text-xs opacity-60">c/h</span>
              </span>
            </div>

            {k > 1 && (
              <div className="flex justify-between items-center border-b border-on-tertiary-fixed/10 pb-2">
                <span className="font-mono text-sm opacity-80">k</span>
                <span className="font-mono text-sm font-medium">{k}</span>
              </div>
            )}

            {showPopulation && (
              <div className="flex justify-between items-center border-b border-on-tertiary-fixed/10 pb-2">
                <span className="font-mono text-sm opacity-80">M</span>
                <span className="font-mono text-sm font-medium">{population}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-1">
              <span className="font-mono text-sm opacity-80">ρ</span>
              <span className={`font-mono text-sm font-bold ${!isStable ? "text-red-400" : ""}`}>
                {rho}
              </span>
            </div>

            {!isStable && (
              <p className="text-xs text-red-400 mt-2">
                ⚠️ El sistema no es estable. λ debe ser menor que k×μ.
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onAddCalculation}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold text-sm shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          Agregar cálculo
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </aside>
  );
}