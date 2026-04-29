import React from "react";
import type { LiteralState, LiteralExtra } from "@/pages/new-exercise-flow";
import type { UnidadTiempo } from "@/domain/cola/convertir";

const LETRAS = "abcdefghijklmnopqrstuvwxyz";

interface Props {
  index: number;
  literal: LiteralState;
  onDelete: () => void;
  onUpdateExtra: (patch: Partial<LiteralExtra>) => void;
  onCalcular: () => void;
}

function StepRow({ step }: { step: import("@/domain/cola/tipos").PasoDesarrollo }) {
  return (
    <div className="rounded-lg bg-black/30 border border-white/8 px-3 py-2 text-xs space-y-0.5">
      <div className="text-white/40 uppercase tracking-wide text-[9px] font-bold">{step.operacion}</div>
      <div className="font-mono text-white/90 text-sm">{step.formula}</div>
      {step.sustitucion && <div className="font-mono text-white/50">{step.sustitucion}</div>}
      {step.resultado && (
        <div className="font-mono text-emerald-400 font-bold border-t border-white/10 pt-1 mt-1">
          = {step.resultado}
        </div>
      )}
    </div>
  );
}

function CostosForm({ costos, jornada, onChange }: {
  costos?: LiteralExtra["costos"];
  jornada?: LiteralExtra["jornada"];
  onChange: (c: LiteralExtra["costos"]) => void;
}) {
  const v = costos ?? { costoServidorDia: 50, costoEsperaHoraCliente: 10, horasPeriodo: jornada?.horasDiarias ?? 8, dias: jornada?.diasSemana ?? 5, costoSobre: "Lq" as const };
  return (
    <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-black/20 border border-white/10">
      <label className="col-span-2 text-[10px] text-white/40 font-bold uppercase tracking-widest">Configuración de costos</label>
      {[
        { label: "Salario/servidor/día ($)", key: "costoServidorDia" as const },
        { label: "Pérdida/hora-cliente espera ($)", key: "costoEsperaHoraCliente" as const },
        { label: "Horas del período (H)", key: "horasPeriodo" as const },
      ].map(({ label, key }) => (
        <div key={key} className={key === "horasPeriodo" ? "col-span-2" : "col-span-1"}>
          <div className="text-[10px] text-white/50 mb-1">{label}</div>
          <input
            type="number" min="0" step="any"
            value={v[key] as number}
            onChange={e => onChange({ ...v, [key]: Number(e.target.value) })}
            className="w-full h-8 bg-white/5 border border-white/15 rounded px-2 text-xs font-mono focus:outline-none focus:border-white/40"
          />
        </div>
      ))}
      <div>
        <div className="text-[10px] text-white/50 mb-1">Días del período</div>
        <input
          type="number" min="1" max="7" step="1"
          value={v.dias ?? jornada?.diasSemana ?? 5}
          onChange={e => onChange({ ...v, dias: Number(e.target.value) })}
          className="w-full h-8 bg-white/5 border border-white/15 rounded px-2 text-xs font-mono focus:outline-none focus:border-white/40"
        />
      </div>
      <div>
        <div className="text-[10px] text-white/50 mb-1">Costo calculado sobre</div>
        <select
          value={v.costoSobre ?? "Lq"}
          onChange={e => onChange({ ...v, costoSobre: e.target.value as "Lq" | "L" })}
          className="w-full h-8 bg-[#111118] border border-white/15 rounded px-2 text-xs focus:outline-none focus:border-white/40 text-white/80"
        >
          <option value="Lq">Espera en cola (Lq)</option>
          <option value="L">Tiempo en sistema (L)</option>
        </select>
      </div>
    </div>
  );
}

function FuenteMetricaForm({ extra, onChange, label = "Métrica fuente" }: {
  extra: LiteralExtra;
  onChange: (patch: Partial<LiteralExtra>) => void;
  label?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-black/20 border border-white/10">
      <label className="col-span-2 text-[10px] text-white/40 font-bold uppercase tracking-widest">{label}</label>
      <div>
        <div className="text-[10px] text-white/50 mb-1">Fuente</div>
        <select
          value={extra.fuente ?? "Lq"}
          onChange={e => onChange({ fuente: e.target.value })}
          className="w-full h-8 bg-[#111118] border border-white/15 rounded px-2 text-xs focus:outline-none focus:border-white/40 text-white/80"
        >
          <option value="Lq">Lq</option>
          <option value="L">L</option>
          <option value="Wq">Wq (horas)</option>
          <option value="W">W (horas)</option>
        </select>
      </div>
      <div>
        <div className="text-[10px] text-white/50 mb-1">Factor N</div>
        <input
          type="number" min="0" step="any" value={extra.factor ?? 1}
          onChange={e => onChange({ factor: Number(e.target.value) })}
          className="w-full h-8 bg-white/5 border border-white/15 rounded px-2 text-xs font-mono focus:outline-none focus:border-white/40"
        />
      </div>
    </div>
  );
}

function JornadaForm({ jornada, soloHoras, onChange }: {
  jornada?: LiteralExtra["jornada"];
  soloHoras?: boolean;
  onChange: (j: LiteralExtra["jornada"]) => void;
}) {
  const v = jornada ?? { horasDiarias: 8, diasSemana: 5 };
  return (
    <div className={`grid ${soloHoras ? "grid-cols-1" : "grid-cols-2"} gap-2 p-3 rounded-lg bg-black/20 border border-white/10`}>
      <label className={`${soloHoras ? "col-span-1" : "col-span-2"} text-[10px] text-white/40 font-bold uppercase tracking-widest`}>Jornada laboral</label>
      <div>
        <div className="text-[10px] text-white/50 mb-1">Horas/día</div>
        <input type="number" min="1" max="24" value={v.horasDiarias}
          onChange={e => onChange({ ...v, horasDiarias: Number(e.target.value) })}
          className="w-full h-8 bg-white/5 border border-white/15 rounded px-2 text-xs font-mono focus:outline-none focus:border-white/40" />
      </div>
      {!soloHoras && (
        <div>
          <div className="text-[10px] text-white/50 mb-1">Días/semana</div>
          <input type="number" min="1" max="7" value={v.diasSemana ?? 5}
            onChange={e => onChange({ ...v, diasSemana: Number(e.target.value) })}
            className="w-full h-8 bg-white/5 border border-white/15 rounded px-2 text-xs font-mono focus:outline-none focus:border-white/40" />
        </div>
      )}
    </div>
  );
}

function CondicionForm({ condicion, onChange }: {
  condicion?: LiteralExtra["condicion"];
  onChange: (c: LiteralExtra["condicion"]) => void;
}) {
  const c = condicion ?? { tipo: "Pk_maximo", valor: 0.20 } as any;

  const opciones = [
    { value: "L_maximo", label: "L máximo (Clientes en sistema ≤ X)" },
    { value: "Lq_maximo", label: "Lq máximo (Clientes en cola ≤ X)" },
    { value: "Wq_maximo_min", label: "Wq máximo en minutos (Tiempo en cola ≤ X)" },
    { value: "W_maximo_min", label: "W máximo en minutos (Tiempo en sistema ≤ X)" },
    { value: "Wq_condicional_maximo_min", label: "Wn máximo en minutos (Espera condicional ≤ X)" },
    { value: "Pk_maximo", label: "Pk máximo (Prob. de esperar ≤ X, ej. 0.20 para 20%)" },
    { value: "P0_minimo", label: "P0 mínimo (Prob. sistema vacío ≥ X, ej. 0.50)" },
    { value: "fraccion_no_espera_minima", label: "1 - Pk mínimo (% que no espera ≥ X, ej. 0.80)" },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 p-3 rounded-lg bg-black/20 border border-white/10 mt-1">
      <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Condición de Optimización</label>
      <div className="flex flex-col gap-2">
        <select
          value={c.tipo}
          onChange={e => onChange({ ...c, tipo: e.target.value as any })}
          className="w-full h-8 bg-[#111118] border border-white/15 rounded px-2 text-xs focus:outline-none focus:border-white/40 text-white/80"
        >
          {opciones.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">Valor X =</span>
          <input
            type="number" min="0" step="any" value={c.valor ?? 0}
            onChange={e => onChange({ ...c, valor: Number(e.target.value) })}
            className="w-24 h-8 bg-white/5 border border-white/15 rounded px-2 text-xs font-mono focus:outline-none focus:border-white/40"
          />
        </div>
      </div>
    </div>
  );
}

export function LiteralCard({ index, literal, onDelete, onUpdateExtra, onCalcular }: Props) {
  const [expanded, setExpanded] = React.useState(true);
  const { resultado, tipo, extra } = literal;

  const necesitaJornada = [
    "minutos_al_menos_un_libre","minutos_diarios_vacio","horas_diarias_vacio","horas_diarias_desocupados_todos",
    "horas_semanales_vacio","horas_semanales_ocupado","clientes_diarios_esperan",
    "clientes_semanales_esperan","clientes_diarios_total","tiempo_total_semanal_en_sistema",
    "costo_total_diario","costo_total_semanal","optimizar_k_costo",
    "horas_totales_servidores_desocupados","minutos_diarios_todos_ocupados","horas_diarias_todos_ocupados",
    "clientes_semanales_no_esperan","horas_al_menos_un_libre","minutos_diarios_cola_positiva"
  ].includes(tipo);

  const necesitaCostos = ["costo_total_diario","costo_total_semanal","optimizar_k_costo"].includes(tipo);
  const necesitaN = tipo === "Pn";
  const necesitaQ = ["prob_mas_de_q_esperando", "prob_exacto_q_esperando"].includes(tipo);
  const necesitaRangoQ = tipo === "prob_entre_q1_q2_esperando";
  const necesitaFuente = ["multiplicar", "total_sistemas_identicos"].includes(tipo);
  const necesitaPoblacionExterna = tipo === "porcentaje_fuera_sistema";
  const necesitaLambdaNueva = tipo === "calcular_con_lambda_alternativo";
  const necesitaCondicion = ["optimizar_k_condicion", "optimizar_m_condicion"].includes(tipo);

  return (
    <article className="rounded-xl border border-white/12 bg-[#111118] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 text-sm font-bold flex items-center justify-center flex-shrink-0">
          {LETRAS[index] ?? index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white/90 truncate">{literal.label}</div>
        </div>
        {resultado && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="font-mono font-bold text-emerald-400 text-base">{resultado.valorFormateado}</span>
            <span className="text-white/40 text-xs">{resultado.unidad}</span>
          </div>
        )}
        <button onClick={() => setExpanded(e => !e)} className="text-white/30 hover:text-white/70 transition-colors text-lg">
          {expanded ? "▲" : "▼"}
        </button>
        <button onClick={onDelete} className="text-white/20 hover:text-red-400 transition-colors text-base">✕</button>
      </div>

      {expanded && (
        <div className="border-t border-white/10 p-4 space-y-3">
          {/* n para Pn */}
          {necesitaN && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">n =</span>
              <input
                type="number" min="0" value={extra.n ?? 0}
                onChange={e => onUpdateExtra({ n: Number(e.target.value) })}
                className="w-20 h-8 bg-white/5 border border-white/15 rounded px-2 text-sm font-mono focus:outline-none focus:border-white/40"
              />
            </div>
          )}

          {/* q para probabilidades de cola */}
          {necesitaQ && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">q =</span>
              <input
                type="number" min="0" value={extra.q ?? (tipo === "prob_mas_de_q_esperando" ? 1 : 0)}
                onChange={e => onUpdateExtra({ q: Number(e.target.value) })}
                className="w-20 h-8 bg-white/5 border border-white/15 rounded px-2 text-sm font-mono focus:outline-none focus:border-white/40"
              />
            </div>
          )}

          {/* Rango q1..q2 para cola */}
          {necesitaRangoQ && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">q1 =</span>
                <input type="number" min="0" value={extra.q1 ?? 1}
                  onChange={e => onUpdateExtra({ q1: Number(e.target.value) })}
                  className="w-20 h-8 bg-white/5 border border-white/15 rounded px-2 text-sm font-mono focus:outline-none focus:border-white/40" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">q2 =</span>
                <input type="number" min="0" value={extra.q2 ?? 2}
                  onChange={e => onUpdateExtra({ q2: Number(e.target.value) })}
                  className="w-20 h-8 bg-white/5 border border-white/15 rounded px-2 text-sm font-mono focus:outline-none focus:border-white/40" />
              </div>
            </div>
          )}

          {/* Total para N sistemas o multiplicador */}
          {necesitaFuente && (
            <FuenteMetricaForm extra={extra} onChange={onUpdateExtra} label={tipo === "total_sistemas_identicos" ? "N sistemas idénticos" : "Multiplicador"} />
          )}

          {/* Población externa */}
          {necesitaPoblacionExterna && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">M externo =</span>
              <input
                type="number" min="1" step="any" value={extra.poblacionExterna ?? 15}
                onChange={e => onUpdateExtra({ poblacionExterna: Number(e.target.value) })}
                className="w-24 h-8 bg-white/5 border border-white/15 rounded px-2 text-sm font-mono focus:outline-none focus:border-white/40"
              />
            </div>
          )}

          {/* Lambda alternativa */}
          {necesitaLambdaNueva && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">λ nueva =</span>
              <input
                type="number" min="0" step="any" value={extra.lambdaNueva ?? 1}
                onChange={e => onUpdateExtra({ lambdaNueva: Number(e.target.value) })}
                className="w-24 h-8 bg-white/5 border border-white/15 rounded px-2 text-sm font-mono focus:outline-none focus:border-white/40"
              />
              <span className="text-xs text-white/40">clientes/hora</span>
            </div>
          )}

          {/* Jornada */}
          {necesitaJornada && (
            <JornadaForm 
              jornada={extra.jornada} 
              soloHoras={!tipo.includes("semanal")} 
              onChange={j => onUpdateExtra({ jornada: j })} 
            />
          )}

          {/* Costos */}
          {necesitaCostos && (
            <CostosForm costos={extra.costos} jornada={extra.jornada} onChange={c => onUpdateExtra({ costos: c })} />
          )}

          {/* Condición */}
          {necesitaCondicion && (
            <CondicionForm condicion={extra.condicion} onChange={c => onUpdateExtra({ condicion: c })} />
          )}

          {/* Botón calcular */}
          <button
            onClick={onCalcular}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors"
          >
            Calcular
          </button>

          {/* Advertencias */}
          {resultado?.advertencias.length ? (
            <div className="space-y-1">
              {resultado.advertencias.map((w, i) => (
                <div key={i} className="text-xs text-amber-400 bg-amber-400/10 rounded px-3 py-1.5">{w}</div>
              ))}
            </div>
          ) : null}

          {/* Tabla de optimización */}
          {resultado?.tablaOptimizacion && resultado.tablaOptimizacion.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-white/40">
                    <th className="px-3 py-2 text-left">k/M</th>
                    <th className="px-3 py-2 text-right">ρ</th>
                    <th className="px-3 py-2 text-right">P0</th>
                    <th className="px-3 py-2 text-right">Pk</th>
                    <th className="px-3 py-2 text-right">Lq</th>
                    {resultado.tablaOptimizacion[0].costoTotal !== undefined && (
                      <th className="px-3 py-2 text-right">Costo</th>
                    )}
                    <th className="px-3 py-2 text-right">✓</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.tablaOptimizacion.map(row => (
                    <tr
                      key={row.valor}
                      className={`border-b border-white/5 ${row.esOptimo ? "bg-emerald-500/10 text-emerald-300" : row.estable ? "text-white/80" : "text-red-400/60"}`}
                    >
                      <td className="px-3 py-1.5 font-bold">{row.valor}{row.esOptimo ? " ★" : ""}</td>
                      <td className="px-3 py-1.5 text-right">{row.rho.toFixed(3)}</td>
                      <td className="px-3 py-1.5 text-right">{(row.P0 * 100).toFixed(1)}%</td>
                      <td className="px-3 py-1.5 text-right">{(row.Pk * 100).toFixed(1)}%</td>
                      <td className="px-3 py-1.5 text-right">{row.Lq.toFixed(3)}</td>
                      {row.costoTotal !== undefined && (
                        <td className="px-3 py-1.5 text-right">${row.costoTotal.toFixed(2)}</td>
                      )}
                      <td className="px-3 py-1.5 text-right">{row.cumpleCondicion ? "✓" : "✗"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Desarrollo */}
          {resultado?.desarrollo?.length ? (
            <div className="space-y-1.5">
              <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Desarrollo</div>
              {resultado.desarrollo.map((step, i) => (
                <StepRow key={i} step={step} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </article>
  );
}
