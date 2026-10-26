import React from "react";
import { createRoot } from "react-dom/client";
import { useLocation, navigate } from "@/lib/navigation";
import { SiteLayout } from "./components/layout/site-layout";
import { HomePage } from "./pages/home";
import { NewExercisePage } from "./pages/new-exercise";
import { SolvePage } from "./pages/solve";
import { OptimizationPage } from "./pages/optimization";
import { LibraryPage } from "./pages/library";
import { Button } from "@/components/ui/button";

function NotFoundPage() {
  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-20 text-center">
      <p className="font-headline font-extrabold text-6xl text-foreground mb-3">404</p>
      <p className="text-muted-foreground mb-6">La página que buscas no existe.</p>
      <Button onClick={() => navigate("/")}>Volver al inicio</Button>
    </main>
  );
}

function AppRouter() {
  const { location } = useLocation();

  let content: React.ReactNode = null;

  if (location === "/" || location === "") {
    content = <HomePage />;
  } else if (location === "/new") {
    content = <NewExercisePage />;
  } else if (location === "/solve") {
    content = <SolvePage />;
  } else if (location === "/optimization") {
    content = <OptimizationPage />;
  } else if (location === "/library") {
    content = <LibraryPage />;
  } else {
    content = <NotFoundPage />;
  }

  return <SiteLayout>{content}</SiteLayout>;
}

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(<AppRouter />);
}
