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

function Metric({ label, value, unit, color = "text-white" }: {
  label: string;
  value?: number;
  unit?: string;
  color?: string;
}) {
  if (value === undefined) return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-xs text-white/20 font-mono">—</span>
    </div>
  );
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5">
      <span className="text-xs text-white/50">{label}</span>
      <span className={`text-xs font-mono font-bold ${color}`}>
        {!isFinite(value) ? "∞" : value.toFixed(4)}
        {unit && <span className="text-white/30 font-normal ml-1">{unit}</span>}
      </span>
    </div>
  );
}

export function ResumenPanel({ metricas, metricasHeterogeneo, general }: Props) {
  const lambda = getLambdaPerHour(general);
  const mu = getMuPerHour(general);
  const mus = getMusAsArray(general);
  const esHeterogeneo = general.model === "mmk_het";

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Resumen</h2>

      {/* Parámetros normalizados */}
      <div className="rounded-lg bg-white/5 border border-white/10 p-3 space-y-1">
        <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-2">Parámetros (c/h)</div>
        <div className="flex items-center justify-between">
          <span className="text-orange-400 font-mono text-xs font-bold">λ</span>
          <span className="font-mono text-xs">{lambda.toFixed(4)}</span>
        </div>
        {esHeterogeneo ? (
          mus.map((m, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sky-400 font-mono text-xs font-bold">μ{idx + 1}</span>
              <span className="font-mono text-xs">{m.toFixed(4)}</span>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sky-400 font-mono text-xs font-bold">μ</span>
            <span className="font-mono text-xs">{mu.toFixed(4)}</span>
          </div>
        )}
        {general.k > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-blue-400 font-mono text-xs font-bold">k</span>
            <span className="font-mono text-xs">{general.k}</span>
          </div>
        )}
        {isFinite(general.M) && (
          <div className="flex items-center justify-between">
            <span className="text-violet-400 font-mono text-xs font-bold">M</span>
            <span className="font-mono text-xs">{general.M}</span>
          </div>
        )}
      </div>

      {/* Métricas heterogéneas */}
      {metricasHeterogeneo ? (
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-2">Métricas (Heterogéneo)</div>
          <Metric label="P0" value={metricasHeterogeneo.P0} unit="prob" color="text-purple-300" />
          <Metric label="Pk (esperar)" value={metricasHeterogeneo.Pk} unit="prob" color="text-amber-300" />
          <Metric label="P(ambos ocupa.)" value={metricasHeterogeneo.P_ambos_ocupados} unit="prob" color="text-amber-300" />
          <Metric label="P(alguno disp.)" value={metricasHeterogeneo.P_alguno_disponible} unit="prob" color="text-emerald-300" />
          <Metric label="Lq" value={metricasHeterogeneo.Lq} unit="c" color="text-sky-300" />
          <Metric label="L" value={metricasHeterogeneo.L} unit="c" color="text-sky-300" />
          <Metric label="Wq" value={metricasHeterogeneo.Wq * 60} unit="min" color="text-green-300" />
          <Metric label="W" value={metricasHeterogeneo.W * 60} unit="min" color="text-green-300" />
          {metricasHeterogeneo.enOperacion !== undefined && (
            <Metric label="En operación" value={metricasHeterogeneo.enOperacion} unit="u" color="text-cyan-300" />
          )}
          {metricasHeterogeneo.advertencias.length > 0 && (
            <div className="mt-2 space-y-1">
              {metricasHeterogeneo.advertencias.map((w, i) => (
                <div key={i} className="text-[10px] text-amber-400 bg-amber-400/10 rounded px-2 py-1">{w}</div>
              ))}
            </div>
          )}
        </div>
      ) : metricas ? (
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-2">Métricas</div>
          <Metric label="ρ (utilización)" value={metricas.rho} color={metricas.rho >= 1 ? "text-red-400" : metricas.rho > 0.8 ? "text-yellow-400" : "text-emerald-400"} />
          <Metric label="P0" value={metricas.P0} unit="prob" color="text-purple-300" />
          <Metric label="Pk (esperar)" value={metricas.Pk} unit="prob" color="text-amber-300" />
          <Metric label="Lq" value={metricas.Lq} unit="c" color="text-sky-300" />
          <Metric label="L" value={metricas.L} unit="c" color="text-sky-300" />
          <Metric label="Wq" value={metricas.Wq * 60} unit="min" color="text-green-300" />
          <Metric label="W" value={metricas.W * 60} unit="min" color="text-green-300" />
          {metricas.advertencias.length > 0 && (
            <div className="mt-2 space-y-1">
              {metricas.advertencias.map((w, i) => (
                <div key={i} className="text-[10px] text-amber-400 bg-amber-400/10 rounded px-2 py-1">{w}</div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-center">
          <p className="text-xs text-white/30">Calcula un literal para ver el resumen</p>
        </div>
      )}

      {/* Tips */}
      <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
        <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2">Guía rápida</div>
        <div className="space-y-1.5 text-[10px] text-white/40">
          <p>• <span className="text-orange-400">Tasa</span>: c/h, c/min, c/seg, c/día</p>
          <p>• <span className="text-sky-400">Intervalo</span>: "cada 4 min" → 15 c/h</p>
          <p>• <span className="text-emerald-400">Pk</span> = prob. de esperar (Erlang C)</p>
          <p>• <span className="text-violet-400">M</span> = tamaño de población finita</p>
          <p>• Usa <b className="text-white/60">Calcular Todo</b> para resolver todo de una vez</p>
        </div>
      </div>
    </div>
  );
}
