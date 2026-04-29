/**
 * Panel de preprocesadores para datos especiales del enunciado.
 *
 * Permite manejar:
 * - Flujo por porcentajes
 * - Reproceso / retorno
 * - Servicio ponderado
 */

import React, { useState } from "react";
import type { GeneralState, ParametroEntrada } from "@/pages/new-exercise-flow";
import { flujoPorPorcentajes, flujoEfectivoConReproceso, servicioPonderado } from "@/domain/cola/preprocesadores";
import { crearEntradaTasa } from "@/domain/cola/normalizar-entrada";
import { AYUDAS_PREPROCESADOR } from "@/domain/cola/literales/entrada-flexible-ayuda";

interface Props {
  general: GeneralState;
  onChange: (patch: Partial<GeneralState>) => void;
  onLambdaCambio?: (lambda: number) => void;
  onMuCambio?: (mu: number) => void;
}

type TipoPreprocesador = "ninguno" | "flujo_porcentajes" | "reproceso" | "servicio_ponderado";

export function PreprocesadorPanel({ general, onChange, onLambdaCambio, onMuCambio }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState<TipoPreprocesador>("ninguno");

  const [flujoBase, setFlujoBase] = useState(50);
  const [porcentaje1, setPorcentaje1] = useState(0.20);
  const [porcentaje2, setPorcentaje2] = useState(0.10);

  const [lambdaExt, setLambdaExt] = useState(6);
  const [probRetorno, setProbRetorno] = useState(0.0455);

  const [tipoServicio, setTipoServicio] = useState<"simple" | "compuesto">("simple");
  const [tiempoA, setTiempoA] = useState(4);
  const [probA, setProbA] = useState(0.6);
  const [tiempoB, setTiempoB] = useState(8);
  const [probB, setProbB] = useState(0.4);
  const [unidadTiempo, setUnidadTiempo] = useState<"minutos" | "segundos">("minutos");

  const aplicarFlujoPorcentajes = () => {
    const resultado = flujoPorPorcentajes(flujoBase, [porcentaje1, porcentaje2]);
    onLambdaCambio?.(resultado.lambda);
    setAbierto(false);
    setTipo("ninguno");
  };

  const aplicarReproceso = () => {
    const resultado = flujoEfectivoConReproceso({
      lambdaExterna: lambdaExt,
      probabilidadRetorno: probRetorno,
    });
    onLambdaCambio?.(resultado.lambdaEfectiva);
    setAbierto(false);
    setTipo("ninguno");
  };

  const aplicarServicioPonderado = () => {
    const tiempos = tipoServicio === "compuesto"
      ? [
          { tiempo: tiempoA, probabilidad: probA },
          { tiempo: tiempoB, probabilidad: probB },
        ]
      : [{ tiempo: tiempoA, probabilidad: 1.0 }];

    const resultado = servicioPonderado({ tiempos, unidad: unidadTiempo });
    onMuCambio?.(resultado.mu);
    setAbierto(false);
    setTipo("ninguno");
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-2 px-3 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 rounded-lg text-xs font-semibold text-violet-400 transition-colors"
      >
        <span>Datos especiales del enunciado</span>
        <span className="text-violet-300">{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className="mt-2 space-y-3 bg-white/5 rounded-lg border border-white/10 p-3">
          <div className="text-[10px] text-white/40 leading-snug">
            {AYUDAS_PREPROCESADOR.intro}
          </div>

          <div>
            <label className="text-[10px] text-white/50 uppercase tracking-widest mb-1 block">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoPreprocesador)}
              className="w-full h-8 bg-white/5 border border-white/15 rounded px-2 text-xs"
            >
              <option value="ninguno">Ninguno</option>
              <option value="flujo_porcentajes">Flujo por porcentajes</option>
              <option value="reproceso">Reproceso / retorno</option>
              <option value="servicio_ponderado">Servicio ponderado</option>
            </select>
          </div>

          {tipo === "flujo_porcentajes" && (
            <div className="space-y-2">
              <div className="text-[10px] text-white/40">Ej: "20% entra directo + 10% renueva → λ = 50 × 0.30 = 15/h"</div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-white/60 w-16">Flujo base</label>
                <input type="number" value={flujoBase} onChange={(e) => setFlujoBase(Number(e.target.value))} className="flex-1 h-8 bg-white/5 border border-white/15 rounded px-2 text-xs font-mono" />
                <span className="text-white/40 text-xs">clientes/h</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-white/60 w-16">% 1</label>
                <input type="number" step="0.01" value={porcentaje1} onChange={(e) => setPorcentaje1(Number(e.target.value))} className="flex-1 h-8 bg-white/5 border border-white/15 rounded px-2 text-xs font-mono" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-white/60 w-16">% 2</label>
                <input type="number" step="0.01" value={porcentaje2} onChange={(e) => setPorcentaje2(Number(e.target.value))} className="flex-1 h-8 bg-white/5 border border-white/15 rounded px-2 text-xs font-mono" />
              </div>
              <button onClick={aplicarFlujoPorcentajes} className="w-full py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 rounded text-xs font-semibold text-emerald-300">
                Calcular λ efectiva
              </button>
            </div>
          )}

          {tipo === "reproceso" && (
            <div className="space-y-2">
              <div className="text-[10px] text-white/40">Ej: "5% reprocesa" → λe = λ / (1 - r)</div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-white/60 w-20">λ externa</label>
                <input type="number" value={lambdaExt} onChange={(e) => setLambdaExt(Number(e.target.value))} className="flex-1 h-8 bg-white/5 border border-white/15 rounded px-2 text-xs font-mono" />
                <span className="text-white/40 text-xs">clientes/h</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-white/60 w-20">Prob. retorno</label>
                <input type="number" step="0.001" value={probRetorno} onChange={(e) => setProbRetorno(Number(e.target.value))} className="flex-1 h-8 bg-white/5 border border-white/15 rounded px-2 text-xs font-mono" />
              </div>
              <button onClick={aplicarReproceso} className="w-full py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 rounded text-xs font-semibold text-emerald-300">
                Calcular λ efectiva
              </button>
            </div>
          )}

          {tipo === "servicio_ponderado" && (
            <div className="space-y-2">
              <div className="text-[10px] text-white/40">Ej: "60% tarda 4 min, 40% tarda 8 min"</div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-white/60 w-16">Tipo</label>
                <select value={tipoServicio} onChange={(e) => setTipoServicio(e.target.value as "simple" | "compuesto")} className="flex-1 h-8 bg-white/5 border border-white/15 rounded px-2 text-xs">
                  <option value="simple">Simple (1 tiempo)</option>
                  <option value="compuesto">Compuesto (2+ tiempos)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-white/60 w-16">Tiempo A</label>
                <input type="number" value={tiempoA} onChange={(e) => setTiempoA(Number(e.target.value))} className="flex-1 h-8 bg-white/5 border border-white/15 rounded px-2 text-xs font-mono" />
                <select value={unidadTiempo} onChange={(e) => setUnidadTiempo(e.target.value as "minutos" | "segundos")} className="h-8 bg-white/5 border border-white/15 rounded px-2 text-xs">
                  <option value="minutos">min</option>
                  <option value="segundos">seg</option>
                </select>
              </div>
              {tipoServicio === "compuesto" && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-white/60 w-16">Prob A</label>
                    <input type="number" step="0.01" value={probA} onChange={(e) => setProbA(Number(e.target.value))} className="flex-1 h-8 bg-white/5 border border-white/15 rounded px-2 text-xs font-mono" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-white/60 w-16">Tiempo B</label>
                    <input type="number" value={tiempoB} onChange={(e) => setTiempoB(Number(e.target.value))} className="flex-1 h-8 bg-white/5 border border-white/15 rounded px-2 text-xs font-mono" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-white/60 w-16">Prob B</label>
                    <input type="number" step="0.01" value={probB} onChange={(e) => setProbB(Number(e.target.value))} className="flex-1 h-8 bg-white/5 border border-white/15 rounded px-2 text-xs font-mono" />
                  </div>
                </>
              )}
              <button onClick={aplicarServicioPonderado} className="w-full py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 rounded text-xs font-semibold text-emerald-300">
                Calcular μ efectivo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
