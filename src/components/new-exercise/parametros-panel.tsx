import React from "react";
import type { GeneralState, ParametroEntrada } from "@/pages/new-exercise-flow";
import type { EntradaTasaGeneral } from "@/domain/cola/normalizar-entrada";
import type { UnidadTiempo } from "@/domain/cola/convertir";
import { EntradaTasaFlexible } from "./entrada-tasa-flexible";
import { PreprocesadorPanel } from "./preprocesador-panel";

interface Props {
  general: GeneralState;
  onChange: (patch: Partial<GeneralState>) => void;
}

export function ParametrosPanel({ general, onChange }: Props) {
  const esFinita = isFinite(general.M);
  const esMulti = general.k > 1;
  const esHeterogeneo = general.model === "mmk_het";

  const mus = general.musEntrada ?? [{ valor: 15, unidad: "horas" as UnidadTiempo }];
  const musFlexibles = general.musFlexibles ?? [];

  const handleMusChange = (index: number, valor: number) => {
    const newMus = [...mus];
    newMus[index] = { ...newMus[index], valor };
    onChange({ musEntrada: newMus });
  };

  const handleMusUnitChange = (index: number, unidad: UnidadTiempo) => {
    const newMus = [...mus];
    newMus[index] = { ...newMus[index], unidad };
    onChange({ musEntrada: newMus });
  };

  const handleMusFlexChange = (index: number, value: EntradaTasaGeneral) => {
    const nuevos = [...musFlexibles];
    nuevos[index] = value;
    onChange({ musFlexibles: nuevos });
  };

  const agregarMu = () => {
    onChange({ musEntrada: [...mus, { valor: 10, unidad: "horas" as UnidadTiempo }] });
  };

  const eliminarMu = (index: number) => {
    if (mus.length <= 2) return;
    const newMus = mus.filter((_, i) => i !== index);
    onChange({ musEntrada: newMus, k: newMus.length });
  };

  const handleLambdaFlexChange = (value: EntradaTasaGeneral) => {
    onChange({ lambdaFlexible: value });
  };

  const handleMuFlexChange = (value: EntradaTasaGeneral) => {
    onChange({ muFlexible: value });
  };

  const sectionLabel = "text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3";
  const subLabel = "text-xs font-bold text-on-surface-variant mb-1";
  const toggleBase = "py-1.5 px-2 rounded text-xs font-semibold transition-colors";
  const toggleOff = "bg-surface-container text-on-surface-variant hover:bg-surface-container-high";
  const toggleOn = "bg-primary text-primary-foreground";

  const inputClass =
    "flex-1 h-8 bg-surface-container border border-border rounded-lg text-center text-sm font-mono font-bold focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 transition-colors";
  const stepBtnClass =
    "w-8 h-8 bg-surface-container hover:bg-surface-container-high rounded-lg text-lg font-bold transition-colors text-on-surface";

  return (
    <div className="space-y-5">
      <div>
        <h2 className={sectionLabel}>Parámetros</h2>

        {/* Heterogéneo toggle */}
        <div className="space-y-1 mb-4">
          <div className={subLabel}>Tipo de modelo</div>
          <div className="grid grid-cols-2 gap-1">
            {[
              { label: "Estándar", model: esMulti ? "mmk" as const : esFinita ? "mm1m" as const : "mm1" as const },
              { label: "Heterogéneo", model: "mmk_het" as const },
            ].map(opt => (
              <button
                key={opt.model}
                type="button"
                onClick={() => {
                  const patch: Partial<GeneralState> = { model: opt.model };
                  if (opt.model === "mmk_het") {
                    patch.k = 2;
                    patch.musEntrada = mus.length >= 2 ? mus : [
                      general.muEntrada,
                      { valor: 10, unidad: "horas" as UnidadTiempo },
                    ];
                  } else {
                    delete patch.musEntrada;
                  }
                  onChange(patch);
                }}
                className={`${toggleBase} ${
                  esHeterogeneo === (opt.model === "mmk_het") ? toggleOn : toggleOff
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modelo */}
        <div className="space-y-1 mb-4">
          <div className={subLabel}>Tipo de población</div>
          <div className="grid grid-cols-2 gap-1">
            {[
              { label: "∞ Infinita", finite: false },
              { label: "M Finita", finite: true },
            ].map(opt => (
              <button
                key={String(opt.finite)}
                type="button"
                onClick={() => onChange({ M: opt.finite ? 10 : Infinity })}
                className={`${toggleBase} ${
                  esFinita === opt.finite ? toggleOn : toggleOff
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Servidores */}
        <div className="space-y-1 mb-4">
          <div className={subLabel}>
            {esHeterogeneo ? "Servidores (k) = μ's" : "Servidores (k)"}
          </div>
          <div className="flex items-center gap-2">
            {esHeterogeneo ? (
              <div className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                {mus.length} servidores con μ distintas
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onChange({ k: Math.max(1, general.k - 1) })}
                  className={stepBtnClass}
                  aria-label="Reducir servidores"
                >−</button>
                <input
                  type="number"
                  min="1"
                  value={general.k}
                  onChange={(e) => onChange({ k: Math.max(1, Math.round(Number(e.target.value))) })}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => onChange({ k: general.k + 1 })}
                  className={stepBtnClass}
                  aria-label="Aumentar servidores"
                >+</button>
              </>
            )}
          </div>
        </div>

        {/* Población M */}
        {esFinita && (
          <div className="space-y-1 mb-4">
            <div className="text-xs font-bold text-tertiary mb-1">Población (M)</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange({ M: Math.max(general.k, general.M - 1) })}
                className={stepBtnClass}
                aria-label="Reducir población"
              >−</button>
              <input
                type="number"
                min={general.k}
                value={general.M}
                onChange={(e) => onChange({ M: Math.max(general.k, Math.round(Number(e.target.value))) })}
                className={`${inputClass} border-tertiary/40 focus:border-tertiary`}
              />
              <button
                type="button"
                onClick={() => onChange({ M: general.M + 1 })}
                className={stepBtnClass}
                aria-label="Aumentar población"
              >+</button>
            </div>
          </div>
        )}

        {/* Lambda flexible */}
        <EntradaTasaFlexible
          label="λ — Llegadas"
          symbol="λ"
          value={general.lambdaFlexible ?? {
            tipo: "tasa",
            valor: general.lambdaEntrada.valor,
            unidad: general.lambdaEntrada.unidad,
          } as EntradaTasaGeneral}
          onChange={handleLambdaFlexChange}
        />

        <div className="mt-4" />

        {/* Mu estándar */}
        {!esHeterogeneo && (
          <EntradaTasaFlexible
            label="μ — Servicio (por servidor)"
            symbol="μ"
            value={general.muFlexible ?? {
              tipo: "tasa",
              valor: general.muEntrada.valor,
              unidad: general.muEntrada.unidad,
            } as EntradaTasaGeneral}
            onChange={handleMuFlexChange}
          />
        )}

        {/* Mu heterogéneos */}
        {esHeterogeneo && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-chart-3">μ — Tasas de servicio (heterogéneas)</div>
            {musFlexibles.length > 0 ? (
              musFlexibles.map((mu, idx) => (
                <EntradaTasaFlexible
                  key={idx}
                  label={`μ${idx + 1}`}
                  symbol="μ"
                  value={mu}
                  onChange={(v) => handleMusFlexChange(idx, v)}
                />
              ))
            ) : (
              mus.map((mu, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[10px] text-on-surface-variant w-5">μ{idx + 1}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={mu.valor}
                    onChange={(e) => handleMusChange(idx, Number(e.target.value))}
                    className="flex-1 h-8 bg-surface-container border border-border rounded-lg px-3 text-sm font-mono focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 transition-colors"
                  />
                  <select
                    value={mu.unidad}
                    onChange={(e) => handleMusUnitChange(idx, e.target.value as UnidadTiempo)}
                    className="h-8 bg-surface-container border border-border rounded-lg px-2 text-xs focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 transition-colors"
                  >
                    <option value="segundos">seg</option>
                    <option value="minutos">min</option>
                    <option value="horas">h</option>
                    <option value="dias">días</option>
                  </select>
                  {mus.length > 2 && (
                    <button
                      type="button"
                      onClick={() => eliminarMu(idx)}
                      className="w-6 h-6 bg-destructive/10 hover:bg-destructive/20 rounded text-xs text-destructive transition-colors"
                      aria-label={`Eliminar μ${idx + 1}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            )}
            {mus.length < 5 && (
              <button
                type="button"
                onClick={agregarMu}
                className="w-full py-1.5 bg-surface-container hover:bg-surface-container-high rounded text-xs text-on-surface-variant transition-colors"
              >
                + Agregar μ
              </button>
            )}
          </div>
        )}
      </div>

      {/* Preprocesador Panel */}
      <PreprocesadorPanel
        general={general}
        onChange={onChange}
        onLambdaCambio={(lambda) => {
          onChange({
            lambdaFlexible: {
              tipo: "tasa",
              valor: lambda,
              unidad: "horas",
            } as EntradaTasaGeneral,
          });
        }}
        onMuCambio={(mu) => {
          onChange({
            muFlexible: {
              tipo: "tasa",
              valor: mu,
              unidad: "horas",
            } as EntradaTasaGeneral,
          });
        }}
      />

      {/* Modelo resultante */}
      <div className="rounded-lg bg-surface-container border border-border p-3 text-xs space-y-1">
        <div className="text-on-surface-variant font-bold uppercase tracking-widest text-[10px] mb-1">Modelo detectado</div>
        <div className="font-mono text-primary font-bold text-base">
          {esHeterogeneo
            ? esFinita
              ? `M/M/${mus.length}/${general.M} HET`
              : `M/M/${mus.length} HET`
            : esFinita && esMulti
              ? `M/M/${general.k}/${general.M}`
              : esFinita
                ? `M/M/1/${general.M}`
                : esMulti
                  ? `M/M/${general.k}`
                  : "M/M/1"}
        </div>
        <div className="text-on-surface-variant text-[10px]">
          {esHeterogeneo
            ? "Población finita"
            : esFinita
              ? "Población finita"
              : "Población infinita"}
          {" · "}
          {esHeterogeneo
            ? esFinita
              ? `M = ${general.M}`
              : "∞ clientes"
            : esMulti
              ? `${general.k} servidores`
              : "1 servidor"}
        </div>
      </div>
    </div>
  );
}
