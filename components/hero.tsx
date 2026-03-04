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
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, oklch(0.78 0.18 80) 0%, transparent 70%)" }}
      />

      {/* Badge — delay 0 */}
      <div
        className="relative z-10 mb-6 animate-on-scroll anim-fade-up is-visible"
        style={{ animationDelay: "0ms" }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Tecnologia feita no Nordeste para o Brasil
        </div>
      </div>

      {/* Heading — delay 150ms */}
      <h1
        className="relative z-10 text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance max-w-5xl animate-on-scroll anim-fade-up is-visible"
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
        className="relative z-10 mt-6 text-center text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed text-pretty animate-on-scroll anim-fade-up is-visible"
        style={{ animationDelay: "280ms" }}
      >
        A Nordex Tech desenvolve sistemas, plataformas e produtos digitais sob medida
        do planejamento à entrega para empresas que querem crescer com tecnologia de verdade.
      </p>

      {/* CTAs — delay 400ms */}
      <div
        className="relative z-10 mt-10 flex flex-col sm:flex-row items-center gap-4 animate-on-scroll anim-fade-up is-visible"
        style={{ animationDelay: "400ms" }}
      >
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
        <a
          href="#sobre"
          className="btn-slide inline-flex items-center gap-2 px-7 py-3.5 rounded-md border border-border text-foreground font-semibold text-base hover:bg-surface-hover transition-colors"
        >
          Conheça a empresa
        </a>
      </div>

      {/* Stats row — delay 520ms */}
      <div
        className="relative z-10 mt-20 flex flex-col sm:flex-row items-center justify-center gap-12 max-w-2xl w-full animate-on-scroll anim-fade-up is-visible"
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

      {/* Scroll indicator */}
      <a
        href="#solucoes"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors animate-on-scroll anim-fade-in is-visible"
        style={{ animationDelay: "700ms" }}
        aria-label="Rolar para baixo"
      >
        <span className="text-xs tracking-widest uppercase">Explorar</span>
        <ChevronDown size={20} className="animate-bounce" />
      </a>
    </section>
  )
}
