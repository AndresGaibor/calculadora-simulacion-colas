import React from "react";
import type { GeneralState, ParametroEntrada } from "@/pages/new-exercise-flow";
import type { UnidadTiempo } from "@/domain/cola/convertir";

const UNIDADES: { value: UnidadTiempo; label: string }[] = [
  { value: "segundos", label: "segundos" },
  { value: "minutos", label: "minutos" },
  { value: "horas", label: "horas" },
  { value: "dias", label: "días" },
];

function EntradaTasa({
  label, color, value, onChange,
}: {
  label: string;
  color: string;
  value: ParametroEntrada;
  onChange: (p: ParametroEntrada) => void;
}) {
  return (
    <div className="space-y-1">
      <div className={`text-xs font-bold font-mono ${color} flex items-center gap-2`}>
        {label}
      </div>
      <div className="text-[10px] text-white/40 mb-1">
        Tasa (clientes por {value.unidad})
      </div>
      <div className="flex gap-1.5">
        <input
          type="number"
          min="0"
          step="any"
          value={value.valor}
          onChange={(e) => onChange({ ...value, valor: Number(e.target.value) })}
          className="flex-1 h-9 bg-white/5 border border-white/15 rounded-lg px-3 text-sm font-mono focus:outline-none focus:border-white/40 transition-colors"
        />
        <select
          value={value.unidad}
          onChange={(e) => onChange({ ...value, unidad: e.target.value as UnidadTiempo })}
          className="h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-xs focus:outline-none focus:border-white/40 transition-colors"
        >
          {UNIDADES.map(u => <option key={u.value} value={u.value} className="bg-[#1a1a2e]">{u.label}</option>)}
        </select>
      </div>
    </div>
  );
}

interface Props {
  general: GeneralState;
  onChange: (patch: Partial<GeneralState>) => void;
}

export function ParametrosPanel({ general, onChange }: Props) {
  const esFinita = isFinite(general.M);
  const esMulti = general.k > 1;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Parámetros</h2>

        {/* Modelo */}
        <div className="space-y-1 mb-4">
          <div className="text-xs font-bold text-white/60 mb-1">Tipo de población</div>
          <div className="grid grid-cols-2 gap-1">
            {[
              { label: "∞ Infinita", finite: false },
              { label: "M Finita", finite: true },
            ].map(opt => (
              <button
                key={String(opt.finite)}
                onClick={() => onChange({ M: opt.finite ? 10 : Infinity })}
                className={`py-1.5 px-2 rounded text-xs font-semibold transition-colors ${
                  esFinita === opt.finite
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Servidores */}
        <div className="space-y-1 mb-4">
          <div className="text-xs font-bold text-white/60 mb-1">Servidores (k)</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChange({ k: Math.max(1, general.k - 1) })}
              className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg text-lg font-bold transition-colors"
            >−</button>
            <input
              type="number"
              min="1"
              value={general.k}
              onChange={(e) => onChange({ k: Math.max(1, Math.round(Number(e.target.value))) })}
              className="flex-1 h-8 bg-white/5 border border-white/15 rounded-lg text-center text-sm font-mono font-bold focus:outline-none focus:border-white/40"
            />
            <button
              onClick={() => onChange({ k: general.k + 1 })}
              className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg text-lg font-bold transition-colors"
            >+</button>
          </div>
          <div className="text-[10px] text-white/30">
            {general.k === 1 ? "M/M/1 — un servidor" : `M/M/${general.k} — ${general.k} servidores en paralelo`}
          </div>
        </div>

        {/* Población M */}
        {esFinita && (
          <div className="space-y-1 mb-4">
            <div className="text-xs font-bold text-violet-400 mb-1">Población (M)</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onChange({ M: Math.max(general.k, general.M - 1) })}
                className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg text-lg font-bold transition-colors"
              >−</button>
              <input
                type="number"
                min={general.k}
                value={general.M}
                onChange={(e) => onChange({ M: Math.max(general.k, Math.round(Number(e.target.value))) })}
                className="flex-1 h-8 bg-white/5 border border-violet-500/30 rounded-lg text-center text-sm font-mono font-bold focus:outline-none focus:border-violet-400"
              />
              <button
                onClick={() => onChange({ M: general.M + 1 })}
                className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg text-lg font-bold transition-colors"
              >+</button>
            </div>
          </div>
        )}

        {/* Lambda */}
        <EntradaTasa
          label="λ — Tasa de llegada"
          color="text-orange-400"
          value={general.lambdaEntrada}
          onChange={(v) => onChange({ lambdaEntrada: v })}
        />

        <div className="mt-4" />

        {/* Mu */}
        <EntradaTasa
          label="μ — Tasa de servicio (por servidor)"
          color="text-sky-400"
          value={general.muEntrada}
          onChange={(v) => onChange({ muEntrada: v })}
        />
      </div>

      {/* Modelo resultante */}
      <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs space-y-1">
        <div className="text-white/40 font-bold uppercase tracking-widest text-[10px] mb-1">Modelo detectado</div>
        <div className="font-mono text-emerald-400 font-bold text-base">
          {esFinita && esMulti ? `M/M/${general.k}/${general.M}` :
           esFinita ? `M/M/1/${general.M}` :
           esMulti ? `M/M/${general.k}` : "M/M/1"}
        </div>
        <div className="text-white/40 text-[10px]">
          {esFinita ? "Población finita" : "Población infinita"} ·{" "}
          {esMulti ? `${general.k} servidores` : "1 servidor"}
        </div>
      </div>
    </div>
  );
}
