import { useLocation, navigate } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";

const navItems = [
  { label: "Calculadora", href: "/new" },
  { label: "Optimización", href: "/optimization" },
  { label: "Fórmulas", href: "/library" },
];

interface SiteHeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function SiteHeader({ theme, onToggleTheme }: SiteHeaderProps) {
  const { location } = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-3 flex justify-between items-center gap-4">
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className="flex items-center gap-2 no-underline text-on-surface shrink-0"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-headline font-bold text-base"
          >
            Q
          </span>
          <span className="font-headline font-bold text-lg tracking-tight hidden sm:inline">
            QueueLab
          </span>
        </a>

        <nav
          aria-label="Navegación principal"
          className="hidden md:flex gap-1"
        >
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <a
                key={item.href}
                href={`#${item.href}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.href);
                }}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "text-sm font-medium transition-colors px-3 py-1.5 rounded-md no-underline",
                  isActive
                    ? "text-on-surface bg-surface-container"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60",
                )}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 transition-colors"
            aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
            title={theme === "light" ? "Modo oscuro" : "Modo claro"}
          >
            {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">
              {theme === "light" ? "Modo oscuro" : "Modo claro"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/new")}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            Calcular
          </button>
        </div>
      </div>

      <nav
        aria-label="Navegación móvil"
        className="md:hidden flex gap-1 px-6 pb-2 overflow-x-auto"
      >
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <a
              key={item.href}
              href={`#${item.href}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.href);
              }}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-md no-underline transition-colors",
                isActive
                  ? "text-on-surface bg-surface-container"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60",
              )}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </header>
  );
}
