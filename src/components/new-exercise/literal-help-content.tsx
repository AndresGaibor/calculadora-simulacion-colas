import React from "react";

interface LiteralHelpContentProps {
  resumen: string;
  usarCuando: string;
}

export function LiteralHelpContent({ resumen, usarCuando }: LiteralHelpContentProps) {
  return (
    <div className="space-y-1 rounded-md border border-white/10 bg-[#111118] p-2 text-xs text-white/75 shadow-lg">
      <div className="font-semibold text-white/90">{resumen}</div>
      <div className="text-white/55">{usarCuando}</div>
    </div>
  );
}
