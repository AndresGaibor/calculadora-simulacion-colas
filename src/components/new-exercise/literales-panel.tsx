import React from "react";
import { LITERALES_DISPONIBLES, type TipoLiteral, type LiteralState, type LiteralExtra } from "@/pages/new-exercise-flow";
import { LiteralCard } from "./literal-card";

interface Props {
  literales: LiteralState[];
  onAdd: (tipo: TipoLiteral) => void;
  onDelete: (id: string) => void;
  onUpdateExtra: (id: string, patch: Partial<LiteralExtra>) => void;
  onCalcular: (id: string) => void;
}

const GRUPOS = [
  {
    label: "Probabilidades",
    tipos: ["P0", "Pn", "Pk", "fraccion_espera", "fraccion_sin_espera"] as TipoLiteral[],
  },
  {
    label: "Longitudes (clientes)",
    tipos: ["Lq", "L", "Ln", "en_operacion", "fraccion_operacion"] as TipoLiteral[],
  },
  {
    label: "Tiempos",
    tipos: ["Wq_min", "W_min", "Wq_h", "W_h", "Wn_min", "rho"] as TipoLiteral[],
  },
  {
    label: "Con jornada laboral",
    tipos: [
      "minutos_al_menos_un_libre", "minutos_diarios_vacio", "horas_diarias_vacio", "horas_diarias_desocupados_todos",
      "horas_semanales_vacio", "horas_semanales_ocupado",
      "clientes_diarios_esperan", "clientes_semanales_esperan", "clientes_diarios_total",
      "tiempo_total_semanal_en_sistema",
    ] as TipoLiteral[],
  },
  {
    label: "Costos",
    tipos: ["costo_total_diario"] as TipoLiteral[],
  },
  {
    label: "Optimización",
    tipos: ["optimizar_k_costo", "optimizar_k_condicion", "optimizar_m_condicion"] as TipoLiteral[],
  },
];

export function LiteralesPanel({ literales, onAdd, onDelete, onUpdateExtra, onCalcular }: Props) {
  const [showPicker, setShowPicker] = React.useState(false);
  const [grupoActivo, setGrupoActivo] = React.useState(0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Literales del ejercicio</h2>
          <p className="text-sm text-white/40">Agrega cada sub-pregunta (a, b, c...) y calcula</p>
        </div>
        <button
          onClick={() => setShowPicker(p => !p)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Agregar literal
        </button>
      </div>

      {/* Picker */}
      {showPicker && (
        <div className="rounded-xl border border-white/15 bg-[#111118] overflow-hidden">
          {/* Grupo tabs */}
          <div className="flex gap-1 p-3 border-b border-white/10 flex-wrap">
            {GRUPOS.map((g, i) => (
              <button
                key={g.label}
                onClick={() => setGrupoActivo(i)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  grupoActivo === i ? "bg-blue-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          {/* Opciones */}
          <div className="grid grid-cols-2 gap-2 p-3">
            {GRUPOS[grupoActivo].tipos.map(tipo => {
              const cfg = LITERALES_DISPONIBLES.find(l => l.tipo === tipo);
              if (!cfg) return null;
              return (
                <button
                  key={tipo}
                  onClick={() => { onAdd(tipo); setShowPicker(false); }}
                  className="text-left px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 transition-all group"
                >
                  <div className="text-sm font-medium text-white/90 group-hover:text-white leading-tight">
                    {cfg.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cards de literales */}
      {literales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4 opacity-20">∑</div>
          <p className="text-white/30 text-sm max-w-xs">
            Agrega los literales del ejercicio para comenzar a calcular
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {literales.map((lit, idx) => (
            <LiteralCard
              key={lit.id}
              index={idx}
              literal={lit}
              onDelete={() => onDelete(lit.id)}
              onUpdateExtra={(patch) => onUpdateExtra(lit.id, patch)}
              onCalcular={() => onCalcular(lit.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
