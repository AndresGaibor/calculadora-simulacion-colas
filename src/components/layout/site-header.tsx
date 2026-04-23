import { useLocation, navigate } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Calculadora", href: "/new" },
  { label: "Fórmulas", href: "/library" },
];

export function SiteHeader() {
  const { location } = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => {
              const isActive = location === item.href;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.href);
                  }}
                  className={cn(
                    "text-sm font-medium transition-colors px-2 py-1 no-underline",
                    isActive
                      ? "text-on-surface border-b-2 border-on-surface"
                      : "text-on-surface-variant hover:text-on-surface",
                  )}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
        <button
          onClick={() => navigate("/new")}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          Calcular
        </button>
      </div>
    </header>
  );
}
