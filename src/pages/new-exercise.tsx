import React from "react";
import { ParametrosPanel } from "@/components/new-exercise/parametros-panel";
import { LiteralesPanel } from "@/components/new-exercise/literales-panel";
import { ResumenPanel } from "@/components/new-exercise/resumen-panel";
import { PlantillasRapidas } from "@/components/new-exercise/plantillas-rapidas";
import { Button } from "@/components/ui/button";
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

  const handleGeneralChange = (patch: Partial<GeneralState>) => {
    setState(s => actualizarGeneral(s, patch));
  };

  const rhoColor =
    rho >= 1
      ? "text-destructive"
      : rho > 0.8
        ? "text-chart-4"
        : "text-chart-2";

  return (
    <main className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      {/* Barra de estado del modelo */}
      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              Modelo
            </span>
            <span className="font-mono font-bold text-primary">{modelName}</span>
          </div>
          <span className="hidden sm:block w-px h-4 bg-outline-variant" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant">λ =</span>
            <span className="font-mono font-medium text-foreground">{lambda.toFixed(4)} c/h</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant">μ =</span>
            <span className="font-mono font-medium text-foreground">{mu.toFixed(4)} c/h</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant">ρ =</span>
            <span className={`font-mono font-bold ${rhoColor}`}>{rho.toFixed(4)}</span>
            {rho >= 1 && (
              <span className="text-[10px] font-semibold uppercase tracking-widest text-destructive bg-error-container/60 px-1.5 py-0.5 rounded">
                ⚠ Inestable
              </span>
            )}
          </div>
          <div className="ml-auto">
            <Button onClick={() => setState(s => calcularTodosLiterales(s))}>
              Calcular todo
            </Button>
          </div>
        </div>
      </div>

      {/* Cuerpo: 3 columnas */}
      <div className="grid gap-4 lg:grid-cols-[20rem_1fr_18rem] xl:grid-cols-[22rem_1fr_20rem]">
        {/* Izquierda: Parámetros */}
        <div className="rounded-xl border border-border bg-card p-4 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto">
          <PlantillasRapidas
            state={state}
            onChange={(newState) => setState(() => newState)}
          />
          <div className="mt-4" />
          <ParametrosPanel
            general={state.general}
            onChange={handleGeneralChange}
          />
        </div>

        {/* Centro: Literales */}
        <div className="rounded-xl border border-border bg-card p-4 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto">
          <LiteralesPanel
            literales={state.literales}
            onAdd={(tipo) => setState(s => agregarLiteral(s, tipo))}
            onDelete={(id) => setState(s => eliminarLiteral(s, id))}
            onUpdateExtra={(id, patch) => setState(s => actualizarExtra(s, id, patch))}
            onCalcular={(id) => setState(s => calcularLiteralById(s, id))}
          />
        </div>

        {/* Derecha: Resumen */}
        <div className="rounded-xl border border-border bg-card p-4 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto">
          <ResumenPanel metricas={state.metricas} metricasHeterogeneo={state.metricasHeterogeneo} general={state.general} />
        </div>
      </div>
    </main>
  );
}
