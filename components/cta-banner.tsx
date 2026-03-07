/**
 * CtaBanner
 * ---------
 * - Section fades up on scroll with slight scale
 * - Primary button has animated border shimmer on hover
 * - Secondary button inherits btn-slide underline effect
 */
import { ArrowRight } from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

export function CtaBanner() {
  return (
    <section className="py-24 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto relative">
        {/* Glows */}
        <div
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.78 0.18 80), transparent 70%)" }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.78 0.18 80), transparent 70%)" }}
        />

        <div className="animate-on-scroll anim-mask-reveal is-visible"
          style={{ animationName: 'maskReveal', animationDuration: '1.2s' }}>
          <div className="relative z-10 rounded-3xl bg-surface/40 backdrop-blur-2xl p-12 md:p-20 text-center border border-white/5 shadow-2xl">
            <p className="text-primary text-sm font-bold tracking-[0.3em] uppercase mb-6">
              Pronto para começar?
            </p>
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground text-balance mb-8 max-w-4xl mx-auto leading-[1.1] tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Transforme sua ideia em realidade com a Nordex Tech
            </h2>
            <p className="text-muted-foreground/80 max-w-2xl mx-auto mb-12 text-lg md:text-xl leading-relaxed font-medium">
              Não espere mais para digitalizar seu negócio. Entre em contato agora e receba uma proposta personalizada sem compromisso.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#contato"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-md bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
              >
                Falar com especialista
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
              <a
                href="#solucoes"
                className="btn-slide inline-flex items-center gap-2 px-8 py-4 rounded-md border border-border text-foreground font-semibold text-base hover:bg-secondary transition-colors"
              >
                Ver soluções
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
