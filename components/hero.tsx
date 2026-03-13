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
import { useEffect, useRef, useState } from "react"
import { MagneticWrapper } from "@/components/magnetic-wrapper"

/**
 * useTypewriter
 * -------------
 * Types `target` one character at a time.
 * Returns:
 *   - `text`      — the currently-displayed substring
 *   - `isDone`    — true once all characters are revealed
 *
 * Deliberately uses the same heading font throughout (no font-switching).
 * The tech identity comes from the blinking cursor, not from code aesthetics.
 */
function useTypewriter(target: string, { speed = 70, startDelay = 600 } = {}) {
  const [text, setText] = useState("")
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    setText("")
    setIsDone(false)

    const timers: ReturnType<typeof setTimeout>[] = []

    const startId = setTimeout(() => {
      let i = 0
      const intervalId = setInterval(() => {
        i++
        setText(target.slice(0, i))
        if (i >= target.length) {
          clearInterval(intervalId)
          // Brief pause then hide cursor
          const doneId = setTimeout(() => setIsDone(true), 800)
          timers.push(doneId)
        }
      }, speed)
      timers.push(intervalId as unknown as ReturnType<typeof setTimeout>)
    }, startDelay)

    timers.push(startId)
    return () => timers.forEach(clearTimeout)
  }, [target, speed, startDelay])

  return { text, isDone }
}

/* ── Component ─────────────────────────────────────── */
export function Hero() {
  const { text: typed, isDone } = useTypewriter("transformam", { speed: 70, startDelay: 800 })

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col items-center px-6 pt-32 pb-12 overflow-hidden"
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
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, oklch(0.78 0.18 80) 0%, transparent 70%)" }}
      />

      {/* Main Content Wrapper (centered vertically) */}
      <div className="flex flex-col items-center justify-center flex-1 w-full relative z-10">
        {/* Badge — delay 0 */}
        <div
          className="mb-6 animate-on-scroll anim-fade-up is-visible"
          style={{ animationDelay: "0ms" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Tecnologia feita no Nordeste para o Brasil
          </div>
        </div>

        {/* Heading — delay 150ms */}
        <h1
          className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance max-w-5xl animate-on-scroll anim-fade-up is-visible"
          style={{ fontFamily: "var(--font-space-grotesk)", animationDelay: "150ms" }}
        >
          Soluções digitais que{" "}
          {/*
            Typewriter: same font as the heading throughout.
            The blinking golden cursor is the only "tech" signal needed.
          */}
          <span className="text-primary whitespace-nowrap">
            {typed}
            {/* Cursor — blinks while typing, disappears when done */}
            <span
              aria-hidden="true"
              className="inline-block w-[3px] h-[0.85em] bg-primary align-middle ml-[2px] rounded-sm"
              style={{
                /* Stop animation when done so it releases opacity control */
                animationName: isDone ? "none" : "cursorBlink",
                animationDuration: "0.8s",
                animationTimingFunction: "step-end",
                animationIterationCount: "infinite",
                opacity: isDone ? 0 : 1,
                transition: "opacity 0.5s ease",
              }}
            />
          </span>{" "}
          o seu negócio
        </h1>

        {/* Paragraph — delay 280ms */}
        <p
          className="mt-6 text-center text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed text-pretty animate-on-scroll anim-fade-up is-visible"
          style={{ animationDelay: "280ms" }}
        >
          A Nordex Tech desenvolve sistemas, plataformas e produtos digitais sob medida
          do planejamento à entrega para empresas que querem crescer com tecnologia de verdade.
        </p>

        {/* CTAs — delay 400ms */}
        <div
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-on-scroll anim-fade-up is-visible"
          style={{ animationDelay: "400ms" }}
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
                className="relative z-10 flex items-center justify-center h-24 px-8 bg-surface/50 border border-border/50 rounded-xl hover:bg-surface hover:border-primary/30 transition-all duration-300 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-[1.02]"
              >
                <img src="/logos/logo-vinum.png" alt="Vinum Comunicação" className="h-[65px] md:h-[80px] object-contain drop-shadow-sm" />
              </a>

              {/* Tooltip / Balão de depoimento */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[320px] md:w-[380px] opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-50">
                <div className="relative bg-card border border-border rounded-xl p-5 shadow-xl">
                  {/* Seta para baixo */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-b border-r border-border rotate-45" />
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
                className="relative z-10 flex items-center justify-center h-24 px-8 bg-surface/50 border border-border/50 rounded-xl hover:bg-surface hover:border-primary/30 transition-all duration-300 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-[1.02]"
              >
                <img src="/logos/bibiscuit-logo.avif" alt="BiBiscuit ALoja" className="h-[70px] md:h-[90px] object-contain drop-shadow-sm" />
              </a>

              {/* Tooltip / Balão de depoimento */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[320px] md:w-[380px] opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-50">
                <div className="relative bg-card border border-border rounded-xl p-5 shadow-xl">
                  {/* Seta para baixo */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-b border-r border-border rotate-45" />
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
