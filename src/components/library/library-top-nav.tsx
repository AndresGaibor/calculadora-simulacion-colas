import { navigate } from "@/lib/navigation";

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

interface LibraryTopNavProps {
  title?: string;
  activeRoute?: string;
}

export function LibraryTopNav({ title = "Queueing Library", activeRoute = "/library" }: LibraryTopNavProps) {
  const navItems = [
    { label: "Theory", href: "/", active: activeRoute === "/" },
    { label: "Reference", href: "/library", active: activeRoute === "/library" },
    { label: "Export", href: "/optimization", active: activeRoute === "/optimization" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/15 flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-8">
        <span className="text-lg font-bold tracking-tighter text-on-surface">{title}</span>
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.href)}
                className={`transition-colors ${
                item.active
                  ? "text-on-surface font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              >
                {item.label}
              </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container-highest/50">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container-highest/50">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button
            onClick={() => navigate("/new")}
            className="bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium rounded hover:opacity-90 transition-opacity"
          >
            Calculate
          </button>
        </div>
      </div>
    </nav>
  );
}
