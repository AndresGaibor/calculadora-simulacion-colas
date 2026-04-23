import { cn } from "@/lib/utils";
import { navigate } from "@/lib/navigation";

interface NavItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
}

interface LibrarySideNavProps {
  title?: string;
  subtitle?: string;
  items: NavItem[];
  activeRoute?: string;
  onNewProof?: () => void;
}

export function LibrarySideNav({
  title = "Reference Manual",
  subtitle = "v2.4 Technical Editorial",
  items,
  activeRoute = "/library",
  onNewProof,
}: LibrarySideNavProps) {
  return (
    <aside className="hidden md:flex flex-col py-8 space-y-2 border-r border-outline-variant/15 fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-surface-container-low font-['Inter'] text-sm uppercase tracking-wider font-medium">
      <div className="px-6 mb-6">
        <h2 className="text-on-surface font-bold text-xs">{title}</h2>
        <p className="text-on-surface-variant text-[10px] mt-1 normal-case tracking-normal">{subtitle}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.href)}
              className={cn(
                "flex items-center px-6 py-2.5 transition-all translate-x-1 group w-full text-left",
                item.active
                ? "bg-secondary-container text-on-secondary-container shadow-sm border-r-2 border-secondary-container"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50"
              )}
            >
              <span className={cn("material-symbols-outlined mr-3 text-[18px]", item.active && "text-on-secondary-container")}>
                {item.icon}
              </span>
              {item.label}
          </button>
        ))}
      </nav>

      {onNewProof && (
        <div className="px-6 mt-auto pb-4">
          <button
            onClick={onNewProof}
            className="w-full border border-outline-variant/20 py-2 text-xs font-semibold rounded hover:bg-surface-container-low transition-colors text-on-surface"
          >
            New Proof
          </button>
        </div>
      )}
    </aside>
  );
}
