"use client"

import { useEffect, useState } from "react"
import { MagneticWrapper } from "@/components/magnetic-wrapper"
import { ArrowRight, ChevronDown } from "lucide-react"

const Y = "oklch(0.78 0.18 80)"
const Y15 = "oklch(0.78 0.18 80 / 0.15)"
const Y30 = "oklch(0.78 0.18 80 / 0.30)"
const Y50 = "oklch(0.78 0.18 80 / 0.50)"

/* ── Rotating typewriter (type → pause → delete → next) ── */
const ROLES = [
  "transformam negócios",
  "sistemas sob medida",
  "plataformas digitais",
  "produtos que entregam",
  "tecnologia de verdade",
]

function useRotatingTypewriter() {
  const [roleIndex, setRoleIndex] = useState(0)
  const [display, setDisplay] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const target = ROLES[roleIndex]
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          if (display.length < target.length) {
            setDisplay(target.slice(0, display.length + 1))
          } else {
            setTimeout(() => setDeleting(true), 2000)
          }
        } else {
          if (display.length > 0) {
            setDisplay(display.slice(0, -1))
          } else {
            setDeleting(false)
            setRoleIndex((i) => (i + 1) % ROLES.length)
          }
        }
      },
      deleting ? 45 : 90,
    )
    return () => clearTimeout(timeout)
  }, [display, deleting, roleIndex])

  return display
}

/* ── Hero ───────────────────────────────────────────── */
export function Hero() {
  const displayText = useRotatingTypewriter()

  return (
    <>
      <section
        id="inicio"
        className="relative px-4 sm:px-6 pt-28 sm:pt-36 pb-8 sm:pb-12 min-h-screen flex flex-col justify-center"
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow blob */}
        <div
          className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.07] pointer-events-none blur-3xl"
          style={{ background: Y }}
        />

        <div className="mx-auto max-w-7xl w-full">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 lg:items-center">

            {/* ── LEFT — Text ── */}
            <div className="space-y-8 sm:space-y-10">

              {/* Label */}
              <div className="space-y-3 animate-fade-in-up">
                <p
                  className="font-mono text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em]"
                  style={{ color: Y }}
                >
                  Nordex Tech — Tecnologia feita no Nordeste para o Brasil
                </p>

                {/* Heading */}
                <h1 className="text-4xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl text-balance">
                  Soluções digitais que
                  <br />
                  <span
                    className="typing-cursor"
                    style={{ color: Y }}
                  >
                    {displayText}
                  </span>
                </h1>
              </div>

              {/* Paragraph */}
              <p className="max-w-lg text-base sm:text-lg leading-relaxed text-muted-foreground animate-fade-in-up stagger-2">
                A Nordex Tech desenvolve sistemas, plataformas e produtos digitais sob medida,
                do planejamento à entrega, para empresas que querem crescer com tecnologia de verdade.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-3">
                <MagneticWrapper>
                  <a
                    href="#solucoes"
                    className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-lg px-7 py-4 sm:py-3.5 font-mono text-sm transition-all duration-500 active:scale-[0.98]"
                    style={{
                      border: `1px solid ${Y30}`,
                      background: Y15,
                      color: Y,
                    }}
                  >
                    <span className="relative z-10">Ver Soluções</span>
                    <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                      <ArrowRight size={15} />
                    </span>
                    {/* Slide-in background */}
                    <span
                      className="absolute inset-0 -translate-x-full transition-transform duration-500 group-hover:translate-x-0"
                      style={{ background: Y30 }}
                    />
                  </a>
                </MagneticWrapper>

                <MagneticWrapper>
                  <a
                    href="#sobre"
                    className="group inline-flex items-center justify-center gap-3 rounded-lg border border-border px-7 py-4 sm:py-3.5 font-mono text-sm text-muted-foreground transition-all duration-300 hover:border-foreground hover:text-foreground hover:bg-secondary/50 active:scale-[0.98]"
                  >
                    <span>Nos conheça</span>
                    <span className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                      →
                    </span>
                  </a>
                </MagneticWrapper>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-10 animate-fade-in-up stagger-4 pt-2">
                {[
                  { value: "100%", label: "Foco em resultado" },
                  { value: "24/7", label: "Suporte ativo" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col gap-0.5">
                    <span
                      className="text-3xl font-bold"
                      style={{ fontFamily: "var(--font-space-grotesk)", color: Y }}
                    >
                      {s.value}
                    </span>
                    <span className="text-xs text-muted-foreground tracking-wide">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT — Terminal ── */}
            <div className="relative animate-scale-in stagger-4">

              {/* Card */}
              <div className="relative rounded-xl border border-border bg-card/60 glass p-5 sm:p-8 hover-lift scanlines">
                {/* Dots */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive/60 transition-colors hover:bg-destructive" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60 transition-colors hover:bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full transition-colors hover:bg-primary" style={{ background: Y50 }} />
                </div>

                {/* Title bar label */}
                <div className="absolute top-3.5 left-1/2 -translate-x-1/2 bg-background/50 rounded-md px-3 py-1 font-mono text-xs text-muted-foreground">
                  terminal://nordextech
                </div>

                {/* ASCII + terminal lines */}
                <pre
                  className="mt-6 overflow-hidden font-mono leading-relaxed"
                  style={{ color: Y50, fontSize: "clamp(9px, 1.1vw, 13px)" }}
                >
                  <span className="sm:hidden">{`┌───────────────────────┐
│  ██╗   ██╗████████╗██╗ │
│  ████╗ ██║╚══██╔══╝╚██╗│
│  ██╔██╗██║   ██║    ╚██╗
│  ██║╚████║   ██║   ██╔╝│
│  ██║ ╚███║   ██║  ██╔╝ │
│  ╚═╝  ╚══╝   ╚═╝  ╚═╝  │
│        NordexTech       │
│                         │
│  > sistemas: ONLINE     │
│  > status: building     │
└───────────────────────┘`}</span>
                  <span className="hidden sm:block" style={{ color: Y }}>{`┌─────────────────────────────────────┐
│                                     │
│  ██╗   ██╗ ██████╗ ██████╗ ██████╗  │
│  ████╗  ██║██╔═══██╗██╔══██╗██╔══██╗│
│  ██╔██╗ ██║██║   ██║██████╔╝██║  ██║│
│  ██║╚██╗██║██║   ██║██╔══██╗██║  ██║│
│  ██║ ╚████║╚██████╔╝██║  ██║██████╔╝│
│  ╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ │
│              NordexTech              │
│                                     │
│   > sistemas: em produção           │
│   > status: building                │
│   > last_deploy: today              │
│                                     │
└─────────────────────────────────────┘`}</span>
                </pre>
              </div>

              {/* v1.0.0 floating badge */}
              <div
                className="absolute -right-2 sm:-right-6 -top-2 sm:-top-6 rounded-lg px-3 sm:px-4 py-1.5 font-mono text-[11px] sm:text-xs animate-float"
                style={{
                  border: `1px solid ${Y30}`,
                  background: Y15,
                  color: Y,
                  backdropFilter: "blur(10px)",
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full animate-pulse"
                    style={{ background: Y }}
                  />
                  v1.0.0
                </span>
              </div>

              {/* Date badge */}
              <div
                className="absolute -bottom-3 sm:-bottom-6 -left-2 sm:-left-6 rounded-lg border border-border bg-card glass px-3 sm:px-4 py-1.5 font-mono text-[11px] sm:text-xs text-muted-foreground animate-float"
                style={{ animationDelay: "1s" }}
              >
                Abr. 2026
              </div>

              {/* Glow behind card */}
              <div
                className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-3xl"
                style={{ background: Y15 }}
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 animate-fade-in stagger-6">
          <span className="font-mono text-xs text-muted-foreground">scroll</span>
          <div
            className="w-px h-12 animate-pulse"
            style={{ background: `linear-gradient(to bottom, ${Y50}, transparent)` }}
          />
        </div>
      </section>

      {/* Client logos ribbon — abaixo da fold */}
      <div
        className="w-full px-6 py-10 border-t animate-on-scroll anim-fade-up"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-8">
            Empresas que confiam em nosso trabalho
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full">
            {/* Vinum */}
            <div className="group relative w-full md:w-auto flex flex-col items-center">
              <a
                href="https://vinumcomunicacao.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 flex items-center justify-center h-24 px-8 bg-surface/50 border border-border/50 rounded-xl hover:bg-surface hover:border-primary/30 transition-all duration-300 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-[1.02]"
              >
                <img src="/logos/logo-vinum.png" alt="Vinum Comunicação" className="h-[65px] md:h-[80px] object-contain drop-shadow-sm" />
              </a>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[320px] md:w-[380px] opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-50">
                <div className="relative bg-card border border-border rounded-xl p-5 shadow-xl">
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-b border-r border-border rotate-45" />
                  <p className="relative text-sm text-muted-foreground leading-relaxed italic text-balance text-center">
                    "Ótima experiência com a Nordex Tech! O sistema da nossa landing page funciona perfeitamente e superou nossas expectativas. A equipe se mostrou sempre disponível para melhorias e muito eficaz."
                  </p>
                </div>
              </div>
            </div>

            {/* BiBiscuit */}
            <div className="group relative w-full md:w-auto flex flex-col items-center">
              <a
                href="https://bibiscuitaloja.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 flex items-center justify-center h-24 px-8 bg-surface/50 border border-border/50 rounded-xl hover:bg-surface hover:border-primary/30 transition-all duration-300 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-[1.02]"
              >
                <img src="/logos/bibiscuit-logo.avif" alt="BiBiscuit ALoja" className="h-[70px] md:h-[90px] object-contain drop-shadow-sm" />
              </a>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[320px] md:w-[380px] opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-50">
                <div className="relative bg-card border border-border rounded-xl p-5 shadow-xl">
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-b border-r border-border rotate-45" />
                  <p className="relative text-sm text-muted-foreground leading-relaxed italic text-balance text-center">
                    "Ótimo sistema! A Nordex Tech está sempre disponível para realizar alterações. Gostei muito pois compreenderam minhas necessidades e funciona perfeitamente de forma muito intuitiva."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
