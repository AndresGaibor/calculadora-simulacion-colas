import React from "react";
import { ParametrosPanel } from "@/components/new-exercise/parametros-panel";
import { LiteralesPanel } from "@/components/new-exercise/literales-panel";
import { ResumenPanel } from "@/components/new-exercise/resumen-panel";
import {
  crearEstadoInicial, actualizarGeneral, agregarLiteral, eliminarLiteral,
  actualizarExtra, calcularLiteralById, calcularTodosLiterales,
  getLambdaPerHour, getMuPerHour, getRho, getModelName,
  type GeneralState, type TipoLiteral, type LiteralExtra,
} from "./new-exercise-flow";

export function NewExercisePage() {
  const [state, setState] = React.useState(crearEstadoInicial);

  const lambda = getLambdaPerHour(state.general);
  const mu = getMuPerHour(state.general);
  const rho = getRho(state.general);
  const modelName = getModelName(state.general);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">∑</span>
          <span className="font-bold text-lg tracking-tight">Cola Calc</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3 text-sm text-white/50">
          <span>Modelo:</span>
          <span className="font-mono text-emerald-400 font-bold">{modelName}</span>
          <span className="w-px h-4 bg-white/20" />
          <span>λ =</span>
          <span className="font-mono text-orange-400">{lambda.toFixed(4)} c/h</span>
          <span>μ =</span>
          <span className="font-mono text-sky-400">{mu.toFixed(4)} c/h</span>
          <span>ρ =</span>
          <span className={`font-mono font-bold ${rho >= 1 ? "text-red-400" : rho > 0.8 ? "text-yellow-400" : "text-emerald-400"}`}>
            {rho.toFixed(4)}
          </span>
          {rho >= 1 && <span className="text-red-400 text-xs">⚠ INESTABLE</span>}
        </div>
        <button
          onClick={() => setState(calcularTodosLiterales)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold transition-colors"
        >
          Calcular Todo
        </button>
      </div>

      {/* Body */}
      <div className="flex h-[calc(100vh-61px)]">
        {/* Left: Parámetros */}
        <div className="w-80 border-r border-white/10 overflow-y-auto p-4 flex-shrink-0">
          <ParametrosPanel
            general={state.general}
            onChange={(patch) => setState(s => actualizarGeneral(s, patch))}
          />
        </div>

        {/* Center: Literales */}
        <div className="flex-1 overflow-y-auto p-6">
          <LiteralesPanel
            literales={state.literales}
            onAdd={(tipo) => setState(s => agregarLiteral(s, tipo))}
            onDelete={(id) => setState(s => eliminarLiteral(s, id))}
            onUpdateExtra={(id, patch) => setState(s => actualizarExtra(s, id, patch))}
            onCalcular={(id) => setState(s => calcularLiteralById(s, id))}
          />
        </div>

        {/* Right: Resumen */}
        <div className="w-72 border-l border-white/10 overflow-y-auto p-4 flex-shrink-0">
          <ResumenPanel metricas={state.metricas} general={state.general} />
        </div>
      </div>
    </main>
  );
}