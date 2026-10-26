import { navigate } from "@/lib/navigation";

const footerLinks = [
  { label: "Calculadora", href: "/new" },
  { label: "Optimización", href: "/optimization" },
  { label: "Fórmulas", href: "/library" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-container-low">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-headline font-bold text-xs"
          >
            Q
          </span>
          <span className="font-headline font-semibold text-sm text-on-surface">
            QueueLab
          </span>
          <span className="text-xs text-on-surface-variant ml-2">
            Modelado de teoría de colas
          </span>
        </div>
        <nav aria-label="Navegación de pie">
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.href);
                  }}
                  className="text-xs text-on-surface-variant hover:text-on-surface no-underline transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
