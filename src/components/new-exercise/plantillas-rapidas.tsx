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
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-2 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-xs font-semibold text-emerald-400 transition-colors"
      >
        <span>+ Plantilla rápida</span>
        <span className="text-emerald-300">{abierto ? "▲" : "▼"}</span>
      </button>

      <div className="mt-1 text-[10px] text-white/35 leading-snug">
        {AYUDA_PLANTILLAS_RAPIDAS}
      </div>

      {abierto && (
        <div className="mt-2 space-y-1 bg-white/5 rounded-lg border border-white/10 p-2">
          {TODAS_PLANTILLAS.map(plantilla => (
            <button
              key={plantilla.id}
              onClick={() => handleAplicar(plantilla.id)}
              className="w-full text-left px-3 py-2 hover:bg-white/10 rounded transition-colors"
            >
              <div className="text-xs font-semibold text-white/90">{plantilla.nombre}</div>
              <div className="text-[10px] text-white/40">{plantilla.descripcion}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
