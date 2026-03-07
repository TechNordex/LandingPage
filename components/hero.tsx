/**
 * Hero
 * ----
 * - Text scramble effect on the highlighted word ("transformam")
 *   mimics a terminal decode, giving a tech/minimal feel.
 * - Staggered fade-up entrance for each element (badge → heading → paragraph → CTAs → stats)
 * - Scroll indicator with subtle pulse line instead of just a bouncing chevron
 */
"use client"

import { ArrowRight, ChevronDown } from "lucide-react"
import { useTextScramble } from "@/hooks/use-text-scramble"
import { MagneticWrapper } from "@/components/magnetic-wrapper"

/* ── Component ─────────────────────────────────────── */
export function Hero() {
  const { text: scrambled, isDone } = useTextScramble("transformam", { speed: 30, startDelay: 1000 })

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col items-center px-6 pt-32 pb-12 overflow-hidden"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Glow accent */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10 pointer-events-none blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
      />


      {/* Main Content Wrapper (centered vertically) */}
      <div className="flex flex-col items-center justify-center flex-1 w-full relative z-10">
        {/* Badge — delay 0 */}
        <div
          className="mb-8 animate-on-scroll anim-fade-up is-visible"
          style={{ animationDelay: "100ms" }}
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Tecnologia Nordestina • Escopo Nacional
          </div>
        </div>

        {/* Heading — delay 150ms */}
        <h1
          className="text-center text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight text-balance max-w-6xl animate-on-scroll anim-fade-up is-visible"
          style={{ fontFamily: "var(--font-heading)", animationDelay: "250ms" }}
        >
          Soluções digitais que{" "}
          <span className="text-primary inline-block min-w-[1.2em] relative">
            {scrambled}
            <span
              aria-hidden="true"
              className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-[0.7em] bg-primary rounded-full transition-opacity duration-300"
              style={{
                opacity: isDone ? 0 : 1,
                boxShadow: "0 0 10px var(--primary)",
              }}
            />
          </span>{" "}
          o seu negócio
        </h1>

        {/* Paragraph — delay 280ms */}
        <p
          className="mt-10 text-center text-lg md:text-xl text-muted-foreground/80 max-w-2xl leading-relaxed text-pretty font-medium animate-on-scroll anim-fade-up is-visible"
          style={{ animationDelay: "400ms" }}
        >
          A Nordex Tech desenvolve sistemas e produtos digitais sob medida,
          do planejamento à entrega, para empresas que buscam o estado da arte.
        </p>

        {/* CTAs — delay 400ms */}
        <div
          className="mt-12 flex flex-col sm:flex-row items-center gap-6 animate-on-scroll anim-fade-up is-visible"
          style={{ animationDelay: "550ms" }}
        >
          <MagneticWrapper>
            <a
              href="#solucoes"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
            >
              Ver Soluções
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </MagneticWrapper>
          <MagneticWrapper>
            <a
              href="#sobre"
              className="btn-slide inline-flex items-center gap-2 px-7 py-3.5 rounded-md border border-border text-foreground font-semibold text-base hover:bg-surface-hover transition-colors"
            >
              Nos conheça
            </a>
          </MagneticWrapper>
        </div>

        {/* Stats row — delay 520ms */}
        <div
          className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-12 max-w-2xl w-full animate-on-scroll anim-fade-up is-visible"
          style={{ animationDelay: "520ms" }}
        >
          {[
            { value: "100%", label: "Foco em resultado" },
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

        {/* Client Logos Ribbon — delay 600ms */}
        <div
          className="mt-16 w-full max-w-4xl border-t border-border/50 pt-8 animate-on-scroll anim-fade-up is-visible"
          style={{ animationDelay: "600ms" }}
        >
          <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            Empresas que confiam em nosso trabalho
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full">
            {/* Vinum Comunicação */}
            <div className="group relative w-full md:w-auto flex flex-col items-center">
              <a
                href="https://vinumcomunicacao.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 flex items-center justify-center h-24 px-8 bg-surface rounded-xl hover:bg-surface-hover hover:border-primary/30 transition-all duration-300 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-[1.02]"
              >
                <img src="/logos/logo-vinum.png" alt="Vinum Comunicação" className="h-[65px] md:h-[80px] object-contain drop-shadow-sm" />
              </a>

              {/* Tooltip / Balão de depoimento */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[320px] md:w-[380px] opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-50">
                <div className="relative bg-card rounded-xl p-5 shadow-xl">
                  {/* Seta para baixo */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card rotate-45" />
                  <p className="relative text-sm text-muted-foreground leading-relaxed italic text-balance text-center">
                    "Ótima experiência com a Nordex Tech! O sistema da nossa landing page funciona perfeitamente e superou nossas expectativas. A equipe se mostrou sempre disponível para melhorias e muito eficaz. Um serviço de extrema competência e profissionalismo."
                  </p>
                </div>
              </div>
            </div>

            {/* BiBiscuit ALoja */}
            <div className="group relative w-full md:w-auto flex flex-col items-center">
              <a
                href="https://bibiscuitaloja.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 flex items-center justify-center h-24 px-8 bg-surface rounded-xl hover:bg-surface-hover hover:border-primary/30 transition-all duration-300 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-[1.02]"
              >
                <img src="/logos/bibiscuit-logo.avif" alt="BiBiscuit ALoja" className="h-[70px] md:h-[90px] object-contain drop-shadow-sm" />
              </a>

              {/* Tooltip / Balão de depoimento */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[320px] md:w-[380px] opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-50">
                <div className="relative bg-card rounded-xl p-5 shadow-xl">
                  {/* Seta para baixo */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card rotate-45" />
                  <p className="relative text-sm text-muted-foreground leading-relaxed italic text-balance text-center">
                    "Ótimo sistema! A Nordex Tech está sempre disponível para realizar alterações. Gostei muito pois compreenderam minhas necessidades e funciona perfeitamente de forma muito intuitiva, permitindo o uso sem dificuldades."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator — natural flow instead of absolute positioning */}
      <a
        href="#solucoes"
        className="mt-16 flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors animate-on-scroll anim-fade-in is-visible relative z-10"
        style={{ animationDelay: "700ms" }}
        aria-label="Rolar para baixo"
      >
        <span className="text-xs tracking-widest uppercase">Explorar</span>
        <ChevronDown size={20} className="animate-bounce" />
      </a>
    </section>
  )
}
