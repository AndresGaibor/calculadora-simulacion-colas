import React from "react";
import { cn } from "@/lib/utils";
import katex from "katex";
import { ObjectiveSelect, type ObjectiveId } from "./objective-select";
import type { CalculationCardState, CalculationResult } from "@/pages/new-exercise-flow";

interface CalculationCardProps {
  card: CalculationCardState;
  result?: CalculationResult;
  onToggleExpanded: (cardId: string) => void;
  onChangeObjective: (cardId: string, objective: ObjectiveId) => void;
  onChangeN: (cardId: string, n: number | undefined) => void;
  onCalculate: (cardId: string) => void;
}

function renderKaTeX(formula: string): string {
  try {
    return katex.renderToString(formula, { throwOnError: false, displayMode: false });
  } catch {
    return formula;
  }
}

export function CalculationCard({
  card,
  result,
  onToggleExpanded,
  onChangeObjective,
  onChangeN,
  onCalculate,
}: CalculationCardProps) {
  return (
    <article style={{ backgroundColor: "#1a1a1a", borderRadius: "8px", border: "1px solid #444", overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => onToggleExpanded(card.id)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", textAlign: "left", backgroundColor: "transparent", border: "none", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "#fff" }}>{card.objective}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {result && (
            <span style={{ fontSize: "14px", fontFamily: "monospace", fontWeight: 600, color: "#4ade80" }}>
              {result.value} <span style={{ fontSize: "12px", color: "#888" }}>{result.unit}</span>
            </span>
          )}
          <span className={cn("material-symbols-outlined text-[18px]")} style={{ color: "#888" }}>expand_more</span>
        </div>
      </button>

      {card.expanded && (
        <div style={{ padding: "12px", borderTop: "1px solid #444" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <ObjectiveSelect value={card.objective} onChange={(objective) => onChangeObjective(card.id, objective)} compact />
            {card.objective === "Pn" && (
              <input
                type="number"
                min={0}
                value={card.n ?? 0}
                onChange={(e) => onChangeN(card.id, e.target.value === "" ? undefined : Number(e.target.value))}
                style={{ width: "48px", height: "28px", borderRadius: "4px", border: "1px solid #555", padding: "0 8px", fontSize: "12px", fontFamily: "monospace", backgroundColor: "#111", color: "#fff" }}
                placeholder="n"
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => onCalculate(card.id)}
            style={{ backgroundColor: "#2563eb", color: "#fff", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer", marginBottom: "12px" }}
          >
            Calcular
          </button>

          {result?.development?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {result.development.map((step, index) => (
                <div key={`${card.id}-step-${index}`} style={{ borderRadius: "6px", border: "1px solid #333", padding: "12px", fontSize: "12px", backgroundColor: "#0d0d0d", marginBottom: "4px" }}>
                  <div style={{ fontWeight: 600, color: "#fb923c", marginBottom: "8px", textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.5px" }}>{step.operacion}</div>
                  <div 
                    style={{ fontFamily: "monospace", color: "#fff", fontSize: "14px", marginBottom: "6px", fontWeight: 500 }}
                    dangerouslySetInnerHTML={{ __html: renderKaTeX(step.formula) }}
                  />
                  <div style={{ fontFamily: "monospace", color: "#888", fontSize: "12px", marginBottom: "4px" }}>{step.sustitucion}</div>
                  <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#4ade80", fontSize: "14px", paddingTop: "4px", borderTop: "1px solid #222" }}>= {step.resultado}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </article>
  );
}
