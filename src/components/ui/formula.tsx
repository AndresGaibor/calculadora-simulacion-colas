import { useMemo } from "react";
import katex from "katex";

interface FormulaProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

export function Formula({ math, displayMode = true, className = "" }: FormulaProps) {
  const html = useMemo(
    () => renderFormula(math, displayMode),
    [math, displayMode],
  );

  return (
    <div
      className={[
        "katex-formula",
        displayMode ? "block max-w-full overflow-x-auto py-2 text-center" : "inline-block align-middle",
        className,
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// String version for use with dangerouslySetInnerHTML (sanitized by KaTeX)
export function renderFormula(math: string, displayMode = true): string {
  try {
    return katex.renderToString(math, {
      displayMode: displayMode,
      throwOnError: true,
      errorColor: "#ba1a1a",
    });
  } catch (e) {
    console.error("KaTeX render error:", e);
    return `<span class="katex-error" style="color: #ba1a1a;">Error: ${math}</span>`;
  }
}
