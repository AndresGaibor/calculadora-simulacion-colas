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
    <div className={cn("rounded-lg border border-border bg-surface-container px-3 py-2.5 transition-all hover:border-ring/40 hover:bg-surface-container-high", className)}>
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onSelect}
          className="flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded"
        >
          <span className="text-sm font-medium leading-tight text-foreground transition-colors break-words block">
            {label}
          </span>
        </button>
        {help ? (
          <InfoHint label={label} className="mt-0.5 shrink-0">
            <LiteralHelpContent resumen={help.resumen} usarCuando={help.usarCuando} />
          </InfoHint>
        ) : null}
      </div>
    </div>
  );
}
