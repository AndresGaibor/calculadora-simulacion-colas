import { navigate } from "@/lib/navigation";

interface QuickAccessPanelProps {
  favoriteSymbols?: string[];
  tools?: { name: string; href: string; icon: string }[];
}

export function QuickAccessPanel({
  favoriteSymbols = ["λ", "μ", "k", "Lq", "Wq"],
  tools = [
    { name: "Calculadora M/M/k", href: "/new", icon: "calculate" },
    { name: "Simulador de Carga", href: "/optimization", icon: "analytics" },
    { name: "Tabla de Erlang-C", href: "/library", icon: "table_chart" },
  ],
}: QuickAccessPanelProps) {
  return (
    <aside className="hidden xl:block fixed right-0 top-16 h-[calc(100vh-4rem)] w-[20rem] bg-surface-container-lowest border-l border-outline-variant/10 p-6 overflow-y-auto">
      <h3 className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-6 pb-2 border-b border-outline-variant/10">
        Acceso Rápido
      </h3>
      <div className="space-y-6">
        {/* Favorites */}
        <div>
          <h4 className="text-sm font-semibold text-on-background mb-3 flex items-center">
            <span className="material-symbols-outlined text-[16px] mr-2 text-on-surface-variant">star</span>
            Métricas Frecuentes
          </h4>
          <div className="flex flex-wrap gap-2">
            {favoriteSymbols.map((s) => (
              <span
                key={s}
                className="inline-flex items-center px-2.5 py-1 rounded bg-surface-container-low text-xs font-mono text-on-surface cursor-pointer hover:bg-surface-variant transition-colors"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Links Glass Panel */}
        <div className="bg-surface-container-high/70 backdrop-blur-xl p-4 rounded-lg border border-outline-variant/15 mt-8">
          <h4 className="text-xs font-semibold text-on-background mb-3 uppercase tracking-wider">Herramientas</h4>
          <ul className="space-y-2 text-sm">
            {tools.map((tool) => (
              <li key={tool.name}>
                <button
                  onClick={() => navigate(tool.href)}
                  className="text-on-surface-variant hover:text-on-surface hover:underline flex items-center w-full text-left"
                >
                  <span className="material-symbols-outlined text-[14px] mr-2">{tool.icon}</span>
                  {tool.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
