import React from "react";

interface LiteralHelpContentProps {
  resumen: string;
  usarCuando: string;
}

export function LiteralHelpContent({ resumen, usarCuando }: LiteralHelpContentProps) {
  return (
    <div className="space-y-1 rounded-md border border-border bg-popover p-2 text-xs text-popover-foreground shadow-lg">
      <div className="font-semibold text-foreground">{resumen}</div>
      <div className="text-muted-foreground">{usarCuando}</div>
    </div>
  );
}
