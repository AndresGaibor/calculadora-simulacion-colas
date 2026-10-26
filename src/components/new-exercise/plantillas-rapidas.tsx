/**
 * Panel de plantillas rápidas.
 * Permite cargar una configuración predefinida de literales con un clic.
 */

import React, { useState } from "react";
import type { NewExerciseState } from "@/pages/new-exercise-flow";
import { TODAS_PLANTILLAS } from "@/domain/cola/recetas/plantillas-generales";
import { aplicarReceta } from "@/domain/cola/recetas/aplicar-receta";
import { AYUDA_PLANTILLAS_RAPIDAS } from "@/domain/cola/literales/entrada-flexible-ayuda";

interface Props {
  state: NewExerciseState;
  onChange: (state: NewExerciseState) => void;
}

export function PlantillasRapidas({ state, onChange }: Props) {
  const [abierto, setAbierto] = useState(false);

  const handleAplicar = (plantillaId: string) => {
    const receta = TODAS_PLANTILLAS.find(p => p.id === plantillaId);
    if (!receta) return;
    const nuevo = aplicarReceta(state, receta);
    onChange(nuevo);
    setAbierto(false);
  };

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/15 border border-primary/30 rounded-lg text-xs font-semibold text-primary transition-colors w-full justify-between"
        aria-expanded={abierto}
      >
        <span>+ Plantilla rápida</span>
        <span className="text-primary" aria-hidden="true">{abierto ? "▲" : "▼"}</span>
      </button>

      <div className="mt-1 text-[10px] text-on-surface-variant leading-snug">
        {AYUDA_PLANTILLAS_RAPIDAS}
      </div>

      {abierto && (
        <div className="mt-2 space-y-1 bg-surface-container rounded-lg border border-border p-2">
          {TODAS_PLANTILLAS.map(plantilla => (
            <button
              key={plantilla.id}
              type="button"
              onClick={() => handleAplicar(plantilla.id)}
              className="w-full text-left px-3 py-2 hover:bg-surface-container-high rounded transition-colors"
            >
              <div className="text-xs font-semibold text-foreground">{plantilla.nombre}</div>
              <div className="text-[10px] text-on-surface-variant">{plantilla.descripcion}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
