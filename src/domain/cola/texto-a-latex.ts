import { renderFormula } from "@/components/ui/formula";

/**
 * Convierte una cadena de texto matemático en notación Unicode
 * (λ, μ, ρ, ², ×, /, =, etc.) a LaTeX que KaTeX puede renderizar.
 *
 * El objetivo es que los pasos del desarrollo (generados como texto plano
 * por el motor de cálculo) se vean como las fórmulas de /library.
 */

// Símbolos griegos y operadores Unicode → LaTeX
const GREEK = new Map<string, string>([
  ["λ", "\\lambda"],
  ["μ", "\\mu"],
  ["ρ", "\\rho"],
  ["σ", "\\sigma"],
  ["Σ", "\\sum"],
  ["∞", "\\infty"],
  ["×", "\\times"],
  ["÷", "\\div"],
  ["·", "\\cdot"],
  ["≤", "\\le"],
  ["≥", "\\ge"],
  ["≠", "\\ne"],
  ["→", "\\rightarrow"],
  ["≈", "\\approx"],
]);

// Variables matemáticas que NO deben envolver en \text{}
const MATH_VARS = new Set([
  "L", "W", "P", "N", "k", "M", "n", "q", "m",
  "r", "s", "t", "u", "v", "w", "x", "y", "z", "H", "T", "D", "B", "C", "E", "F", "G",
  "J", "K", "R", "S", "U", "V", "X", "Y", "Z",
]);

const SUPER = new Map<string, string>([
  ["⁰", "0"],
  ["¹", "1"],
  ["²", "2"],
  ["³", "3"],
  ["⁴", "4"],
  ["⁵", "5"],
  ["⁶", "6"],
  ["⁷", "7"],
  ["⁸", "8"],
  ["⁹", "9"],
  ["⁻", "-"],
  ["⁺", "+"],
]);

const SUB = new Map<string, string>([
  ["₀", "0"],
  ["₁", "1"],
  ["₂", "2"],
  ["₃", "3"],
  ["₄", "4"],
  ["₅", "5"],
  ["₆", "6"],
  ["₇", "7"],
  ["₈", "8"],
  ["₉", "9"],
]);

function collectRun(input: string, i: number, map: Map<string, string>): { text: string; next: number } {
  let text = "";
  while (i < input.length && map.has(input[i])) {
    const v = map.get(input[i]);
    if (v !== undefined) text += v;
    i++;
  }
  return { text, next: i };
}

export function toLatex(input: string): string {
  if (!input) return "";
  const out: string[] = [];
  let i = 0;

  while (i < input.length) {
    const c = input[i];

    const greek = GREEK.get(c);
    if (greek !== undefined) {
      out.push(greek);
      i++;
      continue;
    }

    if (SUPER.has(c)) {
      const run = collectRun(input, i, SUPER);
      out.push(`^{${run.text}}`);
      i = run.next;
      continue;
    }

    if (SUB.has(c)) {
      const run = collectRun(input, i, SUB);
      out.push(`_{${run.text}}`);
      i = run.next;
      continue;
    }

    // P0..P9, Pk, Pn, Lq, Wq, Wn, Ln
    if (c === "P" || c === "L" || c === "W") {
      const next = input[i + 1];
      if (next && /[kqn0-9]/.test(next)) {
        if (/\d/.test(next)) {
          let n = i + 1;
          while (n < input.length && /\d/.test(input[n])) n++;
          out.push(`${c}_{${input.slice(i + 1, n)}}`);
          i = n;
        } else {
          out.push(`${c}_{${next}}`);
          i += 2;
        }
        continue;
      }
    }

    // Números
    if (/\d/.test(c)) {
      let n = i;
      while (n < input.length && /[\d.]/.test(input[n])) n++;
      out.push(input.slice(i, n));
      i = n;
      continue;
    }

    // Palabra de texto
    if (/[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(c)) {
      let n = i;
      while (n < input.length && /[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(input[n])) n++;
      const word = input.slice(i, n);
      // Variables matemáticas de un solo carácter se dejan en modo math;
      // el resto (unidades, etiquetas) se envuelve en \text{}
      if (word.length === 1 && MATH_VARS.has(word)) {
        out.push(word);
      } else {
        out.push(`\\text{${word}}`);
      }
      i = n;
      continue;
    }

    // Espacios y otros caracteres
    if (/\s/.test(c)) {
      out.push(" ");
      i++;
      continue;
    }

    out.push(c);
    i++;
  }

  let joined = out.join("");
  // Espacio fino entre número y unidad: 0.2 \text{horas} -> 0.2\,\text{horas}
  joined = joined.replace(/(\d)\s*(\\text\{)/g, "$1\\,$2");
  return joined;
}

export function renderMathHtml(input: string, displayMode = false): string {
  const latex = toLatex(input);
  if (!latex) return "";
  return renderFormula(latex, displayMode);
}
