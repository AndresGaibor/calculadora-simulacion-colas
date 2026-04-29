import { cn } from "@/lib/utils";

import type { LiteralHelp } from "@/domain/cola/literales/catalogo";
import { InfoHint } from "@/components/ui/info-hint";
import { LiteralHelpContent } from "./literal-help-content";

interface Props {
  label: string;
  help?: LiteralHelp;
  onSelect: () => void;
  className?: string;
}

export function LiteralOptionButton({ label, help, onSelect, className }: Props) {
  return (
    <div className={cn("relative z-10 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pr-11 transition-all hover:z-30 hover:border-white/25 hover:bg-white/10", className)}>
      <button type="button" onClick={onSelect} className="block w-full text-left focus-visible:outline-none">
        <div className="text-sm font-medium leading-tight text-white/90 transition-colors break-words">{label}</div>
      </button>
      {help ? (
        <InfoHint label={label} className="absolute right-2 top-2">
          <LiteralHelpContent resumen={help.resumen} usarCuando={help.usarCuando} />
        </InfoHint>
      ) : null}
    </div>
  );
}
