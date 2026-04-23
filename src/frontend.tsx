import React from "react";
import { createRoot } from "react-dom/client";
import { useLocation } from "@/lib/navigation";
import { SiteLayout } from "./components/layout/site-layout";
import { HomePage } from "./pages/home";
import { NewExercisePage } from "./pages/new-exercise";
import { SolvePage } from "./pages/solve";
import { OptimizationPage } from "./pages/optimization";
import { LibraryPage } from "./pages/library";

function AppRouter() {
  const { location } = useLocation();

  let content: React.ReactNode = null;

  if (location === "/" || location === "") {
    content = <HomePage />;
  } else if (location === "/new") {
    content = <NewExercisePage />;
  } else if (location === "/history") {
    content = <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-8"><h1 className="font-headline font-bold text-3xl">Historial</h1></main>;
  } else if (location === "/formulas") {
    content = <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-8"><h1 className="font-headline font-bold text-3xl">Fórmulas</h1></main>;
  } else if (location === "/help") {
    content = <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-8"><h1 className="font-headline font-bold text-3xl">Ayuda</h1></main>;
  } else if (location === "/solve") {
    content = <SolvePage />;
  } else if (location === "/optimization") {
    content = <OptimizationPage />;
  } else if (location === "/library") {
    content = <LibraryPage />;
  } else {
    content = <HomePage />;
  }

  return <SiteLayout>{content}</SiteLayout>;
}

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(<AppRouter />);
}
