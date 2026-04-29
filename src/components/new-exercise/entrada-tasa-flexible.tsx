/**
 * Entrada flexible para λ y μ.
 * Permite ingresar tasas en múltiples formatos:
 * - Tasa directa (18 por hora)
 * - Intervalo (1 cada 50 minutos)
 * - Tiempo de servicio (6 minutos)
 * - Capacidad por período (12 en 8 horas)
 * - Compuesto (15 productos × 4 segundos)
 * - Capacidad/unidades (10 páginas/h y 0.9 páginas/manuscrito)
 */

import React, { useState } from "react";
import type { EntradaTasaGeneral, ResultadoNormalizacion } from "@/domain/cola/normalizar-entrada";
import { normalizarEntradaATasaHora, getTipoLabel } from "@/domain/cola/normalizar-entrada";
import type { UnidadTiempo } from "@/domain/cola/convertir";
import { AYUDAS_ENTRADA_FLEXIBLE } from "@/domain/cola/literales/entrada-flexible-ayuda";

const UNIDADES: { value: UnidadTiempo; label: string }[] = [
  { value: "segundos", label: "seg" },
  { value: "minutos", label: "min" },
  { value: "horas", label: "h" },
  { value: "dias", label: "días" },
];

interface Props {
  label: string;
  symbol: "λ" | "μ";
  value: EntradaTasaGeneral;
  onChange: (value: EntradaTasaGeneral) => void;
  resultado?: ResultadoNormalizacion | null;
}

export function EntradaTasaFlexible({ label, symbol, value, onChange }: Props) {
  const [modo, setModo] = useState<EntradaTasaGeneral["tipo"]>(value.tipo);
  const [resultadoPreview, setResultadoPreview] = useState<ResultadoNormalizacion | null>(null);

  const actualizarYPreview = (nueva: EntradaTasaGeneral) => {
    onChange(nueva);
    try {
      const prev = normalizarEntradaATasaHora(nueva, symbol);
      setResultadoPreview(prev);
    } catch {
      setResultadoPreview(null);
    }
  };

  const handleModoChange = (nuevoModo: EntradaTasaGeneral["tipo"]) => {
    setModo(nuevoModo);
    const porDefecto = crearPorDefecto(nuevoModo);
    actualizarYPreview(porDefecto);
  };

  const crearPorDefecto = (tipo: EntradaTasaGeneral["tipo"]): EntradaTasaGeneral => {
    switch (tipo) {
      case "tasa": return { tipo: "tasa", valor: 10, unidad: "horas" };
      case "intervalo": return { tipo: "intervalo", cantidad: 1, cada: 60, unidad: "minutos" };
      case "tiempo_servicio": return { tipo: "tiempo_servicio", tiempo: 6, unidad: "minutos" };
      case "capacidad_periodo": return { tipo: "capacidad_periodo", cantidad: 10, periodo: 8, unidadPeriodo: "horas" };
      case "compuesto_tiempo_unidad": return { tipo: "compuesto_tiempo_unidad", unidadesPorCliente: 15, tiempoPorUnidad: 4, unidadTiempo: "segundos" };
      case "capacidad_por_unidad_cliente": return { tipo: "capacidad_por_unidad_cliente", capacidadUnidades: 10, unidadCapacidad: "horas", unidadesPorCliente: 1 };
    }
  };

  const handleTasaChange = (valor: number) => {
    actualizarYPreview({ ...value, tipo: modo, valor });
  };

  const handleUnidadChange = (unidad: UnidadTiempo) => {
    actualizarYPreview({ ...value, tipo: modo, unidad } as EntradaTasaGeneral);
  };

  const renderModoTasa = () => (
    <>
      <input
        type="number"
        min="0"
        step="any"
        value={(value as any).valor ?? 0}
        onChange={(e) => handleTasaChange(Number(e.target.value))}
        className="flex-1 h-9 bg-white/5 border border-white/15 rounded-lg px-3 text-sm font-mono focus:outline-none focus:border-white/40 transition-colors"
      />
      <select
        value={(value as any).unidad ?? "horas"}
        onChange={(e) => handleUnidadChange(e.target.value as UnidadTiempo)}
        className="h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-xs focus:outline-none focus:border-white/40"
      >
        {UNIDADES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
      </select>
    </>
  );

  const renderModoIntervalo = () => {
    const v = value as Extract<EntradaTasaGeneral, { tipo: "intervalo" }>;
    return (
      <>
        <input type="number" min="1" value={v.cantidad} onChange={(e) => actualizarYPreview({ ...v, cantidad: Number(e.target.value) })} className="w-12 h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-sm font-mono text-center focus:outline-none" />
        <span className="text-white/40 text-xs">cada</span>
        <input type="number" min="0" step="any" value={v.cada} onChange={(e) => actualizarYPreview({ ...v, cada: Number(e.target.value) })} className="w-16 h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-sm font-mono focus:outline-none" />
        <select value={v.unidad} onChange={(e) => actualizarYPreview({ ...v, unidad: e.target.value as UnidadTiempo })} className="h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-xs focus:outline-none">
          {UNIDADES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
      </>
    );
  };

  const renderModoTiempoServicio = () => {
    const v = value as Extract<EntradaTasaGeneral, { tipo: "tiempo_servicio" }>;
    return (
      <>
        <span className="text-white/40 text-xs">1 cada</span>
        <input type="number" min="0" step="any" value={v.tiempo} onChange={(e) => actualizarYPreview({ ...v, tiempo: Number(e.target.value) })} className="w-16 h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-sm font-mono focus:outline-none" />
        <select value={v.unidad} onChange={(e) => actualizarYPreview({ ...v, unidad: e.target.value as UnidadTiempo })} className="h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-xs focus:outline-none">
          {UNIDADES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
      </>
    );
  };

  const renderModoCapacidadPeriodo = () => {
    const v = value as Extract<EntradaTasaGeneral, { tipo: "capacidad_periodo" }>;
    return (
      <>
        <input type="number" min="0" step="any" value={v.cantidad} onChange={(e) => actualizarYPreview({ ...v, cantidad: Number(e.target.value) })} className="w-12 h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-sm font-mono text-center focus:outline-none" />
        <span className="text-white/40 text-xs">en</span>
        <input type="number" min="0" step="any" value={v.periodo} onChange={(e) => actualizarYPreview({ ...v, periodo: Number(e.target.value) })} className="w-12 h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-sm font-mono text-center focus:outline-none" />
        <select value={v.unidadPeriodo} onChange={(e) => actualizarYPreview({ ...v, unidadPeriodo: e.target.value as UnidadTiempo })} className="h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-xs focus:outline-none">
          {UNIDADES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
      </>
    );
  };

  const renderModoCompuesto = () => {
    const v = value as Extract<EntradaTasaGeneral, { tipo: "compuesto_tiempo_unidad" }>;
    return (
      <>
        <input type="number" min="1" value={v.unidadesPorCliente} onChange={(e) => actualizarYPreview({ ...v, unidadesPorCliente: Number(e.target.value) })} className="w-12 h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-sm font-mono text-center focus:outline-none" />
        <span className="text-white/40 text-xs">×</span>
        <input type="number" min="0" step="any" value={v.tiempoPorUnidad} onChange={(e) => actualizarYPreview({ ...v, tiempoPorUnidad: Number(e.target.value) })} className="w-12 h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-sm font-mono text-center focus:outline-none" />
        <select value={v.unidadTiempo} onChange={(e) => actualizarYPreview({ ...v, unidadTiempo: e.target.value as UnidadTiempo })} className="h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-xs focus:outline-none">
          {UNIDADES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
      </>
    );
  };

  const renderModoCapacidadUnidad = () => {
    const v = value as Extract<EntradaTasaGeneral, { tipo: "capacidad_por_unidad_cliente" }>;
    return (
      <>
        <input type="number" min="0" step="any" value={v.capacidadUnidades} onChange={(e) => actualizarYPreview({ ...v, capacidadUnidades: Number(e.target.value) })} className="w-12 h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-sm font-mono text-center focus:outline-none" />
        <span className="text-white/40 text-xs">/</span>
        <input type="number" min="0" step="any" value={v.unidadesPorCliente} onChange={(e) => actualizarYPreview({ ...v, unidadesPorCliente: Number(e.target.value) })} className="w-12 h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-sm font-mono text-center focus:outline-none" />
        <select value={v.unidadCapacidad} onChange={(e) => actualizarYPreview({ ...v, unidadCapacidad: e.target.value as UnidadTiempo })} className="h-9 bg-white/5 border border-white/15 rounded-lg px-2 text-xs focus:outline-none">
          {UNIDADES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
      </>
    );
  };

  return (
    <div className="space-y-1.5">
      <div className={`text-xs font-bold font-mono ${symbol === "λ" ? "text-orange-400" : "text-sky-400"} flex items-center gap-2`}>
        {label}
      </div>

      <select
        value={modo}
        onChange={(e) => handleModoChange(e.target.value as EntradaTasaGeneral["tipo"])}
        className="w-full h-8 bg-white/5 border border-white/15 rounded-lg px-2 text-xs mb-2 focus:outline-none"
      >
        <option value="tasa">Tasa directa</option>
        <option value="intervalo">Cada cierto tiempo</option>
        <option value="tiempo_servicio">Tiempo medio</option>
        <option value="capacidad_periodo">Capacidad por período</option>
        <option value="compuesto_tiempo_unidad">Compuesto (n × t)</option>
        <option value="capacidad_por_unidad_cliente">Capacidad / cliente</option>
      </select>

      <div className="text-[10px] text-white/40 leading-snug">
        {AYUDAS_ENTRADA_FLEXIBLE[modo]}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {modo === "tasa" && renderModoTasa()}
        {modo === "intervalo" && renderModoIntervalo()}
        {modo === "tiempo_servicio" && renderModoTiempoServicio()}
        {modo === "capacidad_periodo" && renderModoCapacidadPeriodo()}
        {modo === "compuesto_tiempo_unidad" && renderModoCompuesto()}
        {modo === "capacidad_por_unidad_cliente" && renderModoCapacidadUnidad()}
      </div>

      {resultadoPreview && (
        <div className="text-[10px] text-white/30 font-mono mt-1">
          → {resultadoPreview.resultado}
        </div>
      )}
    </div>
  );
}
