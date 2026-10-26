import { useEffect, useState, type ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

interface SiteLayoutProps {
  children: ReactNode;
}

const THEME_KEY = "queuelab-theme";

function getInitialTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  const stored = document.documentElement.dataset.theme as "light" | "dark" | undefined;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader theme={theme} onToggleTheme={toggleTheme} />
      <main className="flex-grow">{children}</main>
      <SiteFooter />
    </div>
  );
}
