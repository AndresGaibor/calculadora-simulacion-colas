import React from "react";
import { GRUPOS_LITERALES, type TipoLiteral, type LiteralState, type LiteralExtra } from "@/pages/new-exercise-flow";
import { LITERALES_DISPONIBLES } from "@/domain/cola/literales/catalogo";
import { LiteralCard } from "./literal-card";
import { LiteralOptionButton } from "./literal-option-button";

interface Props {
  literales: LiteralState[];
  onAdd: (tipo: TipoLiteral) => void;
  onDelete: (id: string) => void;
  onUpdateExtra: (id: string, patch: Partial<LiteralExtra>) => void;
  onCalcular: (id: string) => void;
}

export function LiteralesPanel({ literales, onAdd, onDelete, onUpdateExtra, onCalcular }: Props) {
  const [showPicker, setShowPicker] = React.useState(false);
  const [grupoActivo, setGrupoActivo] = React.useState(0);
  const grupo = GRUPOS_LITERALES[grupoActivo] ?? GRUPOS_LITERALES[0];

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
        <div className="rounded-xl border border-white/15 bg-[#111118] overflow-visible">
          {/* Grupo tabs */}
          <div className="flex gap-1 p-3 border-b border-white/10 flex-wrap">
            {GRUPOS_LITERALES.map((g, i) => (
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
          <div className="grid gap-2 p-3 sm:grid-cols-2">
            {grupo.tipos.map((tipo) => {
              const cfg = LITERALES_DISPONIBLES.find((literal) => literal.tipo === tipo);
              if (!cfg) return null;

              return (
                <LiteralOptionButton
                  key={tipo}
                  label={cfg.label}
                  help={cfg.help}
                  onSelect={() => {
                    onAdd(tipo);
                    setShowPicker(false);
                  }}
                />
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
