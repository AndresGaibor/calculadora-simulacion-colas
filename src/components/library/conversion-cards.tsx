import { Formula } from "@/components/ui/formula";

interface ConversionCardProps {
  icon?: string;
  title: string;
  description?: string;
  formula: string;
  variant?: "default" | "highlight";
}

function ConversionCard({ icon, title, description, formula, variant = "default" }: ConversionCardProps) {
  return (
    <div
      className={`p-6 rounded-lg ${
        variant === "highlight"
          ? "bg-surface-container-lowest border border-outline-variant/15 col-span-1 md:col-span-2"
          : "bg-surface-container-low"
      } relative`}
    >
      {icon && (
        <span className="material-symbols-outlined absolute top-6 right-6 text-outline-variant/30 text-3xl">{icon}</span>
      )}
      <h3 className="text-sm font-semibold text-on-background mb-2">{title}</h3>
      {description && <p className="text-xs text-on-surface-variant mb-4">{description}</p>}
      <div
        className={`font-mono font-medium py-4 px-4 rounded-2xl text-center border border-outline-variant/15 overflow-x-auto ${
          variant === "highlight" ? "bg-tertiary-container text-tertiary-fixed-dim" : "bg-surface-container-lowest"
        }`}
      >
        <Formula math={formula} displayMode className="w-full text-[1.1rem] md:text-[1.2rem]" />
      </div>
    </div>
  );
}

interface ScaleItem {
  label: string;
  formula: string;
}

interface ConversionGridProps {
  title?: string;
  items: ScaleItem[];
  highlightIndex?: number;
}

export function ConversionGrid({ title, items, highlightIndex = -1 }: ConversionGridProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/15">
      {title && <h3 className="text-sm font-semibold text-on-background mb-4">{title}</h3>}
      <div className="grid grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <div key={item.label} className={`space-y-1 ${idx === highlightIndex ? "col-span-2" : ""}`}>
            <div className="text-[10px] uppercase text-on-surface-variant tracking-wider font-label">
              {item.label}
            </div>
            <div
              className={`font-mono text-sm px-3 py-2 rounded-xl overflow-x-auto ${
                idx === highlightIndex
                  ? "bg-tertiary-container text-tertiary-fixed-dim"
                  : "bg-surface-container-low"
              }`}
            >
              <Formula math={item.formula} displayMode className="w-full text-[1.06rem] md:text-[1.12rem]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ConversionCardsProps {
  cards: Omit<ConversionCardProps, "variant">[];
}

export function ConversionCards({ cards }: ConversionCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, idx) => (
        <ConversionCard key={card.title} {...card} variant={idx === 2 ? "highlight" : "default"} />
      ))}
    </div>
  );
}
