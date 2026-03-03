import { ArrowRight, ChevronDown } from "lucide-react"

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, oklch(0.78 0.18 80) 0%, transparent 70%)" }}
      />

      {/* Badge */}
      <div className="relative z-10 mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Tecnologia feita no Nordeste para o Brasil
      </div>

      {/* Heading */}
      <h1
        className="relative z-10 text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance max-w-5xl"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        Soluções digitais que{" "}
        <span className="text-primary">transformam</span>{" "}
        o seu negócio
      </h1>

      <p className="relative z-10 mt-6 text-center text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed text-pretty">
        A Nordex Tech desenvolve sistemas, plataformas e produtos digitais sob medida — do planejamento à entrega — para empresas que querem crescer com tecnologia de verdade.
      </p>

      {/* CTAs */}
      <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center gap-4">
        <a
          href="#solucoes"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
        >
          Ver Soluções <ArrowRight size={18} />
        </a>
        <a
          href="#sobre"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md border border-border text-foreground font-semibold text-base hover:bg-surface-hover transition-colors"
        >
          Conheça a empresa
        </a>
      </div>

      {/* Stats row */}
      <div className="relative z-10 mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl w-full">
        {[
          { value: "+50", label: "Projetos entregues" },
          { value: "100%", label: "Foco em resultado" },
          { value: "+5 anos", label: "De experiência" },
          { value: "24/7", label: "Suporte ativo" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center text-center gap-1">
            <span
              className="text-3xl md:text-4xl font-bold text-primary"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {stat.value}
            </span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <a
        href="#solucoes"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        aria-label="Rolar para baixo"
      >
        <span className="text-xs tracking-widest uppercase">Explorar</span>
        <ChevronDown size={20} className="animate-bounce" />
      </a>
    </section>
  )
}
