import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

interface InfoHintProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  content?: string;
}

export function InfoHint({ label, children, className, content }: InfoHintProps) {
  const [abiertoPorHover, setAbiertoPorHover] = React.useState(false);
  const [abiertoPorFoco, setAbiertoPorFoco] = React.useState(false);
  const [abiertoPorClick, setAbiertoPorClick] = React.useState(false);
  const [posicion, setPosicion] = React.useState({ top: 0, left: 0 });
  const botonRef = React.useRef<HTMLButtonElement | null>(null);
  const tooltipId = React.useId();

  const abierto = abiertoPorHover || abiertoPorFoco || abiertoPorClick;

  const actualizarPosicion = React.useCallback(() => {
    const boton = botonRef.current;
    if (!boton || typeof window === "undefined") return;

    const rect = boton.getBoundingClientRect();
    const anchoTooltip = 320;
    const espacio = 8;
    const leftPreferido = rect.left - anchoTooltip - espacio;
    const leftAlternativo = rect.right + espacio;
    const left = leftPreferido > espacio ? leftPreferido : Math.min(leftAlternativo, window.innerWidth - anchoTooltip - espacio);
    const top = Math.max(espacio, rect.top - 4);

    setPosicion({ top, left });
  }, []);

  React.useLayoutEffect(() => {
    if (!abierto) return;

    actualizarPosicion();

    const manejar = () => actualizarPosicion();
    window.addEventListener("scroll", manejar, true);
    window.addEventListener("resize", manejar);

    return () => {
      window.removeEventListener("scroll", manejar, true);
      window.removeEventListener("resize", manejar);
    };
  }, [abierto, actualizarPosicion]);

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <button
        ref={botonRef}
        type="button"
        aria-label={`Ver ayuda de ${label}`}
        aria-expanded={abierto}
        aria-controls={tooltipId}
        title={content ?? `Ver ayuda de ${label}`}
        onMouseEnter={() => setAbiertoPorHover(true)}
        onMouseLeave={() => setAbiertoPorHover(false)}
        onFocus={() => setAbiertoPorFoco(true)}
        onBlur={() => setAbiertoPorFoco(false)}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setAbiertoPorClick((valor) => !valor);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            setAbiertoPorClick((valor) => !valor);
          }
          if (event.key === "Escape") {
            setAbiertoPorClick(false);
          }
        }}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent bg-transparent text-transparent outline-none transition-colors hover:bg-transparent focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-white/20"
      >
        <span className="sr-only">Ayuda</span>
      </button>

      {abierto && typeof document !== "undefined"
        ? createPortal(
            <div
              id={tooltipId}
              role="tooltip"
              onMouseEnter={() => setAbiertoPorHover(true)}
              onMouseLeave={() => setAbiertoPorHover(false)}
              className="z-[9999] w-80 rounded-xl border border-white/15 bg-[#0f1117] p-3 text-left shadow-2xl shadow-black/30"
              style={{ position: "fixed", top: posicion.top, left: posicion.left }}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
