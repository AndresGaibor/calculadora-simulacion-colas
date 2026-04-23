import { cn } from "@/lib/utils";

type ModelId = "mm1" | "mmk" | "mm1m" | "mmkm";
type RateUnit = "perHour" | "perMinute";
type InputMode = "rate" | "time";

interface ParametersSectionProps {
  model: ModelId;
  lambda: number;
  mu: number;
  k: number;
  population?: number;
  lambdaUnit?: RateUnit;
  muUnit?: RateUnit;
  muInputMode?: InputMode;
  onLambdaChange: (value: number) => void;
  onMuChange: (value: number) => void;
  onKChange: (value: number) => void;
  onPopulationChange?: (value: number) => void;
  onLambdaUnitChange?: (unit: RateUnit) => void;
  onMuUnitChange?: (unit: RateUnit) => void;
  onMuInputModeChange?: (mode: InputMode) => void;
}

const isInfinitePopulation = (model: ModelId) => model === "mm1" || model === "mmk";
const isMultiServer = (model: ModelId) => model === "mmk" || model === "mmkm";

function convertRate(value: number, fromUnit: string): number {
  return fromUnit === "perMinute" ? value * 60 : value;
}

function convertTimeToRate(value: number, timeUnit: string): number {
  if (value === 0) return 0;
  return timeUnit === "min" ? 60 / value : 1 / value;
}

export function ParametersSection({
  model,
  lambda,
  mu,
  k,
  population,
  lambdaUnit = "perHour",
  muUnit = "perHour",
  muInputMode = "rate",
  onLambdaChange,
  onMuChange,
  onKChange,
  onPopulationChange,
  onLambdaUnitChange,
  onMuUnitChange,
  onMuInputModeChange,
}: ParametersSectionProps) {
  const showPopulation = !isInfinitePopulation(model);
  const isMultichannel = model === "mmk" || model === "mmkm";

  const lambdaPerHour = convertRate(lambda, lambdaUnit);
  
  let muPerHour: number;
  let displayLabel: string;
  let displayValue: number;
  let displayUnit: string;
  
  if (muInputMode === "time") {
    displayLabel = "Tiempo por cliente";
    displayValue = mu;
    displayUnit = muUnit === "perHour" ? "hora" : "min";
    muPerHour = convertTimeToRate(mu, displayUnit);
  } else {
    displayLabel = "Tasa de servicio";
    displayValue = mu;
    displayUnit = muUnit === "perHour" ? "c/h" : "c/min";
    muPerHour = convertRate(mu, muUnit);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", padding: "12px", backgroundColor: "#1a1a1a", borderRadius: "8px", border: "1px solid #444" }}>
      <div>
        <div style={{ fontSize: "11px", color: "#fb923c", fontWeight: 700, marginBottom: "4px", fontFamily: "monospace" }}>λ llegadas/h</div>
        <div style={{ display: "flex", gap: "4px" }}>
          <input
            type="number"
            step="0.01"
            min="0"
            value={lambda}
            onChange={(e) => onLambdaChange(Number(e.target.value))}
            style={{ flex: 1, height: "32px", borderRadius: "4px", border: "1px solid #555", padding: "0 8px", fontSize: "14px", fontFamily: "monospace", backgroundColor: "#111", color: "#fff" }}
          />
          {onLambdaUnitChange && (
            <select
              value={lambdaUnit}
              onChange={(e) => onLambdaUnitChange(e.target.value as RateUnit)}
              style={{ width: "50px", height: "32px", borderRadius: "4px", border: "1px solid #555", fontSize: "11px", padding: "0 4px", backgroundColor: "#222", color: "#fff" }}
            >
              <option value="perHour" style={{color: "#fff"}}>c/h</option>
              <option value="perMinute" style={{color: "#fff"}}>c/min</option>
            </select>
          )}
        </div>
        <div style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>= {lambdaPerHour.toFixed(1)} c/h</div>
      </div>

      <div>
        <div style={{ fontSize: "11px", color: "#4ade80", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px", fontFamily: "monospace" }}>
          <span style={{color: "#4ade80"}}>{displayLabel}</span>
          {onMuInputModeChange && (
            <button
              type="button"
              onClick={() => onMuInputModeChange(muInputMode === "rate" ? "time" : "rate")}
              style={{ fontSize: "9px", color: "#888", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontWeight: 400 }}
            >
              [{muInputMode === "rate" ? "tasa" : "tiempo"}]
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          <input
            type="number"
            step="0.01"
            min="0"
            value={displayValue}
            onChange={(e) => onMuChange(Number(e.target.value))}
            style={{ flex: 1, height: "32px", borderRadius: "4px", border: "1px solid #555", padding: "0 8px", fontSize: "14px", fontFamily: "monospace", backgroundColor: "#111", color: "#fff" }}
          />
          {muInputMode === "time" && onMuUnitChange && (
            <select
              value={displayUnit === "min" ? "min" : "hour"}
              onChange={(e) => onMuUnitChange(e.target.value === "hour" ? "perHour" : "perMinute")}
              style={{ width: "50px", height: "32px", borderRadius: "4px", border: "1px solid #555", fontSize: "11px", padding: "0 4px", backgroundColor: "#222", color: "#fff" }}
            >
              <option value="min" style={{color: "#fff"}}>min</option>
              <option value="hour" style={{color: "#fff"}}>hora</option>
            </select>
          )}
        </div>
        <div style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>= {muPerHour.toFixed(1)} c/h</div>
      </div>

      {isMultichannel && (
        <div>
          <div style={{ fontSize: "11px", color: "#60a5fa", fontWeight: 700, marginBottom: "4px", fontFamily: "monospace" }}>k servidores</div>
          <input
            type="number"
            min="1"
            value={k}
            onChange={(e) => onKChange(Number(e.target.value))}
            style={{ width: "100%", height: "32px", borderRadius: "4px", border: "1px solid #555", padding: "0 8px", fontSize: "14px", fontFamily: "monospace", backgroundColor: "#111", color: "#fff" }}
          />
        </div>
      )}

      {showPopulation && onPopulationChange && (
        <div>
          <div style={{ fontSize: "11px", color: "#c084fc", fontWeight: 700, marginBottom: "4px", fontFamily: "monospace" }}>M población</div>
          <input
            type="number"
            min="1"
            value={population}
            onChange={(e) => onPopulationChange(Number(e.target.value))}
            style={{ width: "100%", height: "32px", borderRadius: "4px", border: "1px solid #555", padding: "0 8px", fontSize: "14px", fontFamily: "monospace", backgroundColor: "#111", color: "#fff" }}
          />
        </div>
      )}
    </div>
  );
}