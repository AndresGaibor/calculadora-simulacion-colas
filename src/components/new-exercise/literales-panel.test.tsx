import { expect, test } from "bun:test";
import React from "react";

import { LiteralesPanel } from "./literales-panel";

test("LiteralesPanel no rompe al abrir el selector", () => {
  const reactAny = React as typeof React & { useState: unknown };
  const originalUseState = reactAny.useState;
  let llamada = 0;

  Object.defineProperty(reactAny, "useState", {
    configurable: true,
    value: (valorInicial: unknown) => {
      llamada += 1;
      if (llamada === 1) return [true, () => undefined] as const;
      if (llamada === 2) return [0, () => undefined] as const;
      return [valorInicial, () => undefined] as const;
    },
  });

  try {
    expect(() =>
      LiteralesPanel({
        literales: [],
        onAdd: () => undefined,
        onDelete: () => undefined,
        onUpdateExtra: () => undefined,
        onCalcular: () => undefined,
      }),
    ).not.toThrow();
  } finally {
    Object.defineProperty(reactAny, "useState", {
      configurable: true,
      value: originalUseState,
    });
  }
});
