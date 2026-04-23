import { Formula } from "@/components/ui/formula";
import { librarySections } from "./library-content";

function renderSection(section: (typeof librarySections)[number]) {
  return (
    <section key={section.title} className="space-y-6 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
      <div className="space-y-2">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-foreground tracking-tight">{section.title}</h2>
        {section.subtitle && <p className="text-sm font-medium text-on-surface-variant uppercase tracking-widest">{section.subtitle}</p>}
      </div>

      {section.paragraphs?.length ? (
        <div className="space-y-3 text-sm leading-7 text-on-surface-variant max-w-4xl">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      {section.bullets?.length ? (
        <ul className="grid gap-3 md:grid-cols-2 text-sm text-on-surface-variant">
          {section.bullets.map((bullet) => (
            <li key={bullet} className="rounded-xl border border-outline-variant/10 bg-surface-container-low px-4 py-3 leading-6">
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}

      {section.formulas?.length ? (
        <div className="grid gap-5">
          {section.formulas.map((item) => (
            <div key={item.label} className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 md:p-6 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-4">{item.label}</div>
              <div className="rounded-2xl border border-outline-variant/15 bg-surface px-4 md:px-6 py-5 overflow-x-auto">
                <Formula math={item.formula} displayMode className="w-full text-[1.2rem] md:text-[1.35rem]" />
              </div>
              {item.description && (
                <div className="mt-3 text-sm text-on-surface-variant/80 border-t border-outline-variant/10 pt-3">
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {section.note ? <p className="text-sm text-on-surface-variant">{section.note}</p> : null}

      {section.examples?.length ? (
        <div className="space-y-6 mt-8">
          <h3 className="font-headline text-lg md:text-xl font-semibold text-foreground">Ejemplos Resueltos</h3>
          {section.examples.map((example, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-surface-container-lowest p-5 md:p-6 shadow-sm">
              <div className="font-semibold text-foreground mb-2">{example.title}</div>
              {example.description && <p className="text-sm text-on-surface-variant mb-4">{example.description}</p>}
              
              {example.given?.length ? (
                <div className="mb-4 p-3 bg-surface-container-low rounded-lg border border-outline-variant/10">
                  <div className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Datos</div>
                  <ul className="text-sm text-on-surface-variant space-y-1">
                    {example.given.map((g, i) => <li key={i}>• {g}</li>)}
                  </ul>
                </div>
              ) : null}

              <div className="space-y-2">
                {example.steps.map((step, sIdx) => (
                  <div key={sIdx} className="flex gap-3 text-sm">
                    <span className="text-on-surface-variant shrink-0">{sIdx + 1}.</span>
                    <div className="flex-1">
                      <span className="text-on-surface-variant">{step.description}: </span>
                      {step.formula ? (
                        <span className="font-mono text-on-surface">
                          <Formula math={step.formula} displayMode={false} className="inline text-sm" />
                        </span>
                      ) : null}
                      {step.result && <span className="ml-2 text-on-surface font-medium">{step.result}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {example.finalResult && (
                <div className="mt-4 pt-3 border-t border-outline-variant/15">
                  <div className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">Resultado</div>
                  <div className="font-semibold text-primary">{example.finalResult}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function LibraryPage() {
  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-8">
      <header className="mb-10 space-y-4">
        <nav aria-label="Breadcrumb" className="flex text-[0.6875rem] text-on-surface-variant uppercase tracking-widest font-label">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="hover:text-on-surface cursor-pointer">Inicio</li>
            <li><span className="mx-1 text-outline-variant">/</span></li>
            <li className="text-on-surface font-medium">Biblioteca de fórmulas</li>
          </ol>
        </nav>
        <div className="space-y-3 max-w-4xl">
          <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
            Biblioteca de teoría de colas
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant leading-7 max-w-3xl">
            Referencia técnica de teoría de colas con definiciones, notación de Kendall, modelos clásicos, relaciones fundamentales y conversiones de unidades.
          </p>
        </div>
      </header>

      <div className="space-y-8">
        {librarySections.map(renderSection)}
      </div>
    </main>
  );
}
