import React from "react";
import { GRUPOS_LITERALES, type TipoLiteral, type LiteralState, type LiteralExtra } from "@/pages/new-exercise-flow";
import { LITERALES_DISPONIBLES } from "@/domain/cola/literales/catalogo";
import { LiteralCard } from "./literal-card";
import { LiteralOptionButton } from "./literal-option-button";
import { Sigma } from "lucide-react";

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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-headline font-bold text-lg text-foreground">Literales del ejercicio</h2>
          <p className="text-sm text-on-surface-variant">Agrega cada sub-pregunta (a, b, c...) y calcula</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPicker(p => !p)}
          aria-expanded={showPicker}
          aria-controls="literal-picker"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="text-lg leading-none" aria-hidden="true">+</span>
          Agregar literal
        </button>
      </div>

      {/* Picker */}
      <div id="literal-picker" hidden={!showPicker} className="rounded-xl border border-border bg-surface-container-lowest overflow-visible">
          {/* Grupo tabs */}
          <div className="flex gap-1 p-3 border-b border-border flex-wrap">
            {GRUPOS_LITERALES.map((g, i) => (
            <button
              key={g.label}
              type="button"
              onClick={() => setGrupoActivo(i)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  grupoActivo === i ? "bg-primary text-primary-foreground" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
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

      {/* Cards de literales */}
      {literales.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-4 py-12 text-center">
          <Sigma aria-hidden="true" size={30} strokeWidth={1.5} className="mb-4 text-primary/70" />
          <h3 className="font-semibold text-foreground">Empieza por las preguntas del ejercicio</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-on-surface-variant">
            Añade cada apartado (a, b, c…) y calcula sus resultados. El desarrollo paso a paso queda disponible en cada literal.
          </p>
          {!showPicker && (
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="mt-5 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Elegir literal
            </button>
          )}
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
