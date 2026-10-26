import React from "react";
import type { MetricasCompletas } from "@/domain/cola/calcular-todo";
import type { MetricasHeterogeneo } from "@/domain/cola/calcular-heterogeneo";
import type { GeneralState } from "@/pages/new-exercise-flow";
import { getLambdaPerHour, getMuPerHour, getMusAsArray } from "@/pages/new-exercise-flow";

interface Props {
  metricas?: MetricasCompletas;
  metricasHeterogeneo?: MetricasHeterogeneo;
  general: GeneralState;
}

function Metric({ label, value, unit, color = "text-foreground" }: {
  label: string;
  value?: number;
  unit?: string;
  color?: string;
}) {
  if (value === undefined) return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/60">
      <span className="text-xs text-on-surface-variant">{label}</span>
      <span className="text-xs text-on-surface-variant/50 font-mono">—</span>
    </div>
  );
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/60">
      <span className="text-xs text-on-surface-variant">{label}</span>
      <span className={`text-xs font-mono font-bold ${color}`}>
        {!isFinite(value) ? "∞" : value.toFixed(4)}
        {unit && <span className="text-on-surface-variant/70 font-normal ml-1">{unit}</span>}
      </span>
    </div>
  );
}

export function ResumenPanel({ metricas, metricasHeterogeneo, general }: Props) {
  const lambda = getLambdaPerHour(general);
  const mu = getMuPerHour(general);
  const mus = getMusAsArray(general);
  const esHeterogeneo = general.model === "mmk_het";

  const cardClass = "rounded-lg bg-surface-container border border-border p-3";
  const subHead = "text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-2";

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Resumen</h2>

      {/* Parámetros normalizados */}
      <div className={`${cardClass} space-y-1`}>
        <div className={subHead}>Parámetros (c/h)</div>
        <div className="flex items-center justify-between">
          <span className="text-chart-1 font-mono text-xs font-bold">λ</span>
          <span className="font-mono text-xs">{lambda.toFixed(4)}</span>
        </div>
        {esHeterogeneo ? (
          mus.map((m, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-chart-3 font-mono text-xs font-bold">μ{idx + 1}</span>
              <span className="font-mono text-xs">{m.toFixed(4)}</span>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-chart-3 font-mono text-xs font-bold">μ</span>
            <span className="font-mono text-xs">{mu.toFixed(4)}</span>
          </div>
        )}
        {general.k > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-chart-1 font-mono text-xs font-bold">k</span>
            <span className="font-mono text-xs">{general.k}</span>
          </div>
        )}
        {isFinite(general.M) && (
          <div className="flex items-center justify-between">
            <span className="text-tertiary font-mono text-xs font-bold">M</span>
            <span className="font-mono text-xs">{general.M}</span>
          </div>
        )}
      </div>

      {/* Métricas heterogéneas */}
      {metricasHeterogeneo ? (
        <div className={cardClass}>
          <div className={subHead}>Métricas (Heterogéneo)</div>
          <Metric label="P0" value={metricasHeterogeneo.P0} unit="prob" color="text-tertiary" />
          <Metric label="Pk (esperar)" value={metricasHeterogeneo.Pk} unit="prob" color="text-chart-4" />
          <Metric label="P(ambos ocupa.)" value={metricasHeterogeneo.P_ambos_ocupados} unit="prob" color="text-chart-4" />
          <Metric label="P(alguno disp.)" value={metricasHeterogeneo.P_alguno_disponible} unit="prob" color="text-chart-2" />
          <Metric label="Lq" value={metricasHeterogeneo.Lq} unit="c" color="text-chart-3" />
          <Metric label="L" value={metricasHeterogeneo.L} unit="c" color="text-chart-3" />
          <Metric label="Wq" value={metricasHeterogeneo.Wq * 60} unit="min" color="text-chart-2" />
          <Metric label="W" value={metricasHeterogeneo.W * 60} unit="min" color="text-chart-2" />
          {metricasHeterogeneo.enOperacion !== undefined && (
            <Metric label="En operación" value={metricasHeterogeneo.enOperacion} unit="u" color="text-chart-1" />
          )}
          {metricasHeterogeneo.advertencias.length > 0 && (
            <div className="mt-2 space-y-1">
              {metricasHeterogeneo.advertencias.map((w, i) => (
                <div key={i} className="text-[10px] text-on-error-container bg-error-container rounded px-2 py-1">{w}</div>
              ))}
            </div>
          )}
        </div>
      ) : metricas ? (
        <div className={cardClass}>
          <div className={subHead}>Métricas</div>
          <Metric label="ρ (utilización)" value={metricas.rho} color={metricas.rho >= 1 ? "text-destructive" : metricas.rho > 0.8 ? "text-chart-4" : "text-chart-2"} />
          <Metric label="P0" value={metricas.P0} unit="prob" color="text-tertiary" />
          <Metric label="Pk (esperar)" value={metricas.Pk} unit="prob" color="text-chart-4" />
          <Metric label="Lq" value={metricas.Lq} unit="c" color="text-chart-3" />
          <Metric label="L" value={metricas.L} unit="c" color="text-chart-3" />
          <Metric label="Wq" value={metricas.Wq * 60} unit="min" color="text-chart-2" />
          <Metric label="W" value={metricas.W * 60} unit="min" color="text-chart-2" />
          {metricas.advertencias.length > 0 && (
            <div className="mt-2 space-y-1">
              {metricas.advertencias.map((w, i) => (
                <div key={i} className="text-[10px] text-on-error-container bg-error-container rounded px-2 py-1">{w}</div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={`${cardClass} text-center`}>
          <p className="text-xs text-on-surface-variant">Calcula un literal para ver el resumen</p>
        </div>
      )}

      {/* Tips */}
      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
        <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-2">Guía rápida</div>
        <div className="space-y-1.5 text-[10px] text-on-surface-variant">
          <p>• <span className="text-chart-1">Tasa</span>: c/h, c/min, c/seg, c/día</p>
          <p>• <span className="text-chart-3">Intervalo</span>: "cada 4 min" → 15 c/h</p>
          <p>• <span className="text-chart-2">Pk</span> = prob. de esperar (Erlang C)</p>
          <p>• <span className="text-tertiary">M</span> = tamaño de población finita</p>
          <p>• Usa <b className="text-on-surface">Calcular todo</b> para resolver todo de una vez</p>
        </div>
      </div>
    </div>
  );
}
