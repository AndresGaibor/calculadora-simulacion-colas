import { expect, test } from "bun:test";
import { librarySections } from "./library-content";

test("librarySections incluye el capítulo de teoría de colas", () => {
  expect(librarySections[0].title).toContain("Capítulo II");
  expect(librarySections.some((section) => section.title === "Modelo M/M/1")).toBe(true);
  expect(librarySections.some((section) => section.title === "Modelo M/M/k")).toBe(true);
  expect(librarySections.some((section) => section.title === "Modelo M/M/1/M/M")).toBe(true);
  expect(librarySections.some((section) => section.title === "Modelo M/M/k/M/M")).toBe(true);
});
