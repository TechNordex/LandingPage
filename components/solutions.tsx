"use client"

import { useState } from "react"
import { Globe, Code2, Smartphone, Headphones, BrainCircuit, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

const Y = "oklch(0.78 0.18 80)"

const solutions = [
  {
    icon: Globe,
    title: "Sistemas Web",
    description: "Plataformas web robustas e escaláveis, de portais corporativos a sistemas de gestão completos com dashboards em tempo real.",
    tag: "web",
    status: "shipped",
    year: "2024",
  },
  {
    icon: Smartphone,
    title: "Apps Mobile",
    description: "Aplicativos iOS e Android com experiência fluida, integrados ao seu negócio e prontos para o mercado.",
    tag: "mobile",
    status: "shipped",
    year: "2024",
  },
  {
    icon: BrainCircuit,
    title: "Soluções com IA",
    description: "O Nordy, seu assistente inteligente personalizado. Integração com WhatsApp, Telegram e futuramente Instagram, ferramenta de agendamento e treinamento de múltiplos contextos.",
    tag: "ia",
    status: "in-progress",
    year: "2025",
    featured: true,
    id: "ia-solution",
    url: "https://nordy.nordex.tech",
  },
  {
    icon: Code2,
    title: "APIs & Integrações",
    description: "Conectamos sistemas legados e modernos com APIs robustas, automatizando processos e eliminando retrabalho.",
    tag: "api",
    status: "shipped",
    year: "2024",
  },
  {
    icon: Headphones,
    title: "Suporte & Evolução",
    description: "Manutenção, evolução contínua e suporte especializado após o lançamento — sempre do seu lado.",
    tag: "suporte",
    status: "shipped",
    year: "2024",
  },
]

const filters = ["todos", "web", "mobile", "ia", "api", "suporte"]

/* ── Card reutilizável (cards normais) ── */
function Card({ s, i, onCardClick }: {
  s: typeof solutions[number]
  i: number
  onCardClick: (id?: string, url?: string) => void
}) {
  const Icon = s.icon
  return (
    <article
      onClick={() => onCardClick(s.id, (s as { url?: string }).url)}
      className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/40 p-6 sm:p-7 glass transition-all duration-300 hover-lift hover:border-primary/40 hover:bg-card/70 animate-fade-in-up cursor-pointer flex flex-col"
      style={{ animationDelay: `${(i % 6) * 100 + 200}ms` }}
    >
      {/* Status */}
      <div className="absolute right-5 top-5 flex items-center gap-2">
        <span className={cn(
          "h-2 w-2 rounded-full",
          s.status === "shipped"     && "bg-primary shadow-sm shadow-primary/50",
          s.status === "in-progress" && "bg-yellow-500 animate-pulse",
        )} />
        <span className="font-mono text-xs text-muted-foreground">{s.status}</span>
      </div>

      <div className="mb-5 font-mono text-xs text-muted-foreground">{s.year}</div>

      <div
        className="mb-4 inline-flex items-center justify-center w-11 h-11 rounded-lg transition-transform duration-300 group-hover:rotate-6"
        style={{ background: `${Y}18`, color: Y }}
      >
        <Icon size={20} />
      </div>

      <h3 className="mb-2 text-lg font-bold tracking-tight transition-colors duration-300 group-hover:text-primary">
        {s.title}
      </h3>

      <p className="text-sm leading-relaxed text-muted-foreground flex-1">
        {s.description}
      </p>

      <div className="mt-4 flex items-center gap-2 font-mono text-xs opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" style={{ color: Y }}>
        <span>saiba mais</span>
        <ExternalLink className="h-3 w-3" />
      </div>

      <div
        className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full"
        style={{ background: `linear-gradient(to right, ${Y}, transparent)` }}
      />
    </article>
  )
}

export function Solutions() {
  const [active, setActive] = useState("todos")

  const filtered = active === "todos" ? solutions : solutions.filter((s) => s.tag === active)

  const handleCardClick = (id?: string, url?: string) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer")
    else if (id === "ia-solution") window.dispatchEvent(new CustomEvent("open-nordy-chat"))
  }

  return (
    <section id="solucoes" className="px-4 sm:px-6 py-14 sm:py-20 border-t border-border/30">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 sm:mb-14 flex flex-col gap-6 sm:gap-8 sm:flex-row sm:items-end sm:justify-between animate-fade-in-up">
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em]" style={{ color: Y }}>
              O que fazemos
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Soluções completas para<br />cada etapa do seu negócio
            </h2>
          </div>
          <p className="max-w-sm text-base text-muted-foreground leading-relaxed animate-fade-in-up stagger-2">
            Da ideia ao produto final, a Nordex Tech está do seu lado com tecnologia de ponta e expertise regional.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:flex-wrap scrollbar-hide mb-10 animate-fade-in-up stagger-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={cn(
                "shrink-0 rounded-lg border px-5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all duration-300 active:scale-[0.98]",
                active === f
                  ? "border-primary bg-primary/15 text-primary shadow-sm shadow-primary/20"
                  : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground hover:bg-secondary/50",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Cards — bento grid */}
        {active === "todos" ? (
          <div className="grid gap-5 lg:grid-cols-3 lg:grid-rows-2">

            {/* Col 1-2, Row 1: Web + Mobile */}
            <div className="lg:col-span-2 grid gap-5 sm:grid-cols-2">
              {solutions.filter(s => s.tag === "web" || s.tag === "mobile").map((s, i) => {
                const Icon = s.icon
                return <Card key={s.title} s={s} i={i} onCardClick={handleCardClick} />
              })}
            </div>

            {/* Col 3, Row 1-2: IA featured */}
            {solutions.filter(s => s.featured).map((s) => {
              const Icon = s.icon
              return (
                <article
                  key={s.title}
                  onClick={() => handleCardClick(s.id, (s as { url?: string }).url)}
                  className="group relative overflow-hidden rounded-xl border bg-card/40 p-6 sm:p-8 glass transition-all duration-300 hover-lift hover:border-primary/40 hover:bg-card/70 animate-fade-in-up cursor-pointer lg:row-span-2 flex flex-col"
                  style={{
                    borderColor: `${Y}30`,
                    background: `linear-gradient(135deg, ${Y}08 0%, transparent 60%)`,
                    animationDelay: "300ms",
                  }}
                >
                  {/* Destaque badge */}
                  <div
                    className="absolute left-5 top-5 flex items-center gap-2 rounded-full px-3.5 py-1.5"
                    style={{ border: `1px solid ${Y}60`, background: `${Y}18` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: Y }} />
                    <span className="font-mono text-[10px] uppercase tracking-wider font-medium" style={{ color: Y }}>
                      Destaque
                    </span>
                  </div>

                  {/* Status */}
                  <div className="absolute right-5 top-5 flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse shadow-sm shadow-yellow-500/50" />
                    <span className="font-mono text-xs text-muted-foreground">{s.status}</span>
                  </div>

                  <div className="mt-10 mb-5 font-mono text-xs text-muted-foreground">{s.year}</div>

                  <div
                    className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-xl transition-transform duration-300 group-hover:rotate-6"
                    style={{ background: `${Y}18`, color: Y }}
                  >
                    <Icon size={26} />
                  </div>

                  <h3 className="mb-3 text-xl sm:text-2xl font-bold tracking-tight transition-colors duration-300 group-hover:text-primary">
                    {s.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                    {s.description}
                  </p>

                  {/* Extra detail block — só no card grande */}
                  <div
                    className="mt-6 p-4 rounded-lg border font-mono text-xs space-y-2"
                    style={{ borderColor: `${Y}20`, background: `${Y}08` }}
                  >
                    {[
                      "> atendimento 24/7",
                      "> qualificação automática de leads",
                      "> integração com WhatsApp",
                    ].map((line) => (
                      <p key={line} style={{ color: Y }}>{line}</p>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <a
                      href={(s as { url?: string }).url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-2 font-mono text-xs transition-all duration-300 hover:opacity-80"
                      style={{ color: Y }}
                    >
                      <span>nordy.nordex.tech</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div
                    className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full"
                    style={{ background: `linear-gradient(to right, ${Y}, transparent)` }}
                  />
                </article>
              )
            })}

            {/* Col 1-2, Row 2: APIs + Suporte */}
            <div className="lg:col-span-2 grid gap-5 sm:grid-cols-2">
              {solutions.filter(s => s.tag === "api" || s.tag === "suporte").map((s, i) => (
                <Card key={s.title} s={s} i={i + 3} onCardClick={handleCardClick} />
              ))}
            </div>
          </div>
        ) : (
          /* Filtered view — grid simples */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s, i) => (
              <Card key={s.title} s={s} i={i} onCardClick={handleCardClick} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
