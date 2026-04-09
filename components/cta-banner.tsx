"use client"

import { ArrowRight } from "lucide-react"

const Y = "oklch(0.78 0.18 80)"

export function CtaBanner() {
  return (
    <section className="px-4 sm:px-6 py-14 sm:py-20 border-t border-border/30">
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-xl border bg-card/40 glass p-10 md:p-16 text-center overflow-hidden hover-lift animate-scale-in"
          style={{ borderColor: `${Y}30` }}
        >
          {/* Glows */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-10 pointer-events-none blur-3xl" style={{ background: Y }} />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full opacity-8 pointer-events-none blur-3xl"  style={{ background: Y }} />

          <div className="relative z-10">
            <p className="font-mono text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em] mb-4" style={{ color: Y }}>
              Pronto para começar?
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-balance mb-6 max-w-3xl mx-auto">
              Transforme sua ideia em realidade com a{" "}
              <span style={{ color: Y }}>Nordex Tech</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Não espere mais para digitalizar seu negócio. Entre em contato agora e receba uma proposta personalizada sem compromisso.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#contato"
                className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-lg px-8 py-4 font-mono text-sm font-semibold transition-all duration-500 active:scale-[0.98]"
                style={{ border: `1px solid ${Y}50`, background: `${Y}15`, color: Y }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${Y}28`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${Y}15`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Falar com especialista
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
              <a
                href="#solucoes"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-4 font-mono text-sm text-muted-foreground transition-all duration-300 hover:border-foreground hover:text-foreground hover:bg-secondary/50 active:scale-[0.98]"
              >
                Ver soluções →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
