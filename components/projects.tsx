"use client"

import { ExternalLink } from "lucide-react"

const Y = "oklch(0.78 0.18 80)"

const projects = [
  {
    title: "portal-do-cliente",
    description: "Portal que centraliza todo o acompanhamento do desenvolvimento do produto em tempo real",
    tag: "Portal do Cliente",
    progress: 72,
    lastUpdated: "Abr 2026",
    url: undefined as string | undefined,
  },
  {
    title: "assistente-nordy-ia",
    description: "Assistente virtual com integração WhatsApp, Telegram e futuramente Instagram, ferramenta de agendamento e treinamento de múltiplos contextos",
    tag: "Inteligência Artificial",
    progress: 85,
    lastUpdated: "Abr 2026",
    url: "https://nordy.nordex.tech",
  },
]

export function Projects() {
  return (
    <section id="projetos" className="px-4 sm:px-6 py-14 sm:py-20 border-t border-border/30">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 sm:mb-14 space-y-3 animate-fade-in-up">
          <p className="font-mono text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em]" style={{ color: Y }}>
            Em desenvolvimento
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Soluções em andamento
          </h2>
          <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Projetos ativos sendo construídos, testados e evoluídos.
          </p>
        </div>

        {/* Workbench terminal */}
        <div className="rounded-xl border border-border bg-card/40 glass backdrop-blur-sm overflow-hidden hover-lift animate-scale-in stagger-2">
          {/* Terminal header */}
          <div className="flex items-center gap-3 border-b border-border/50 bg-secondary/40 px-4 sm:px-5 py-3.5 sm:py-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive/60 hover:bg-destructive cursor-pointer transition-colors" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60 hover:bg-yellow-500 cursor-pointer transition-colors" />
              <div className="h-3 w-3 rounded-full opacity-60 hover:opacity-100 cursor-pointer transition-opacity" style={{ background: Y }} />
            </div>
            <span className="ml-4 font-mono text-xs text-muted-foreground truncate">
              ~/nordextech/solucoes-ativas
            </span>
            <div className="ml-auto hidden sm:flex items-center gap-2 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: Y }} />
              <span className="font-mono text-xs">live</span>
            </div>
          </div>

          <div className="divide-y divide-border/30">
            {projects.map((item, index) => (
              <div
                key={item.title}
                className="group flex flex-col gap-4 p-5 sm:p-6 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between hover:bg-secondary/30 animate-fade-in"
                style={{ animationDelay: `${index * 100 + 400}ms` }}
              >
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className="font-mono text-sm shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                      style={{ color: Y }}
                    >
                      $
                    </span>
                    <h4 className="font-mono text-sm font-medium tracking-tight transition-colors group-hover:text-primary truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      {item.url && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                  </div>
                  <p className="pl-6 text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                </div>

                <div className="flex items-center justify-between gap-6 pl-6 sm:pl-0 sm:justify-end">
                  <div className="flex items-center gap-3 flex-1 sm:flex-none">
                    <div className="h-2 w-full sm:w-28 overflow-hidden rounded-full bg-secondary/80 relative">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${item.progress}%`,
                          background: item.progress >= 80 ? Y : "oklch(0.85 0.18 80)",
                        }}
                      />
                      <div className="absolute inset-0 animate-shimmer opacity-30" />
                    </div>
                    <span
                      className="font-mono text-xs w-10 shrink-0"
                      style={{ color: item.progress >= 80 ? Y : undefined }}
                    >
                      {item.progress}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs transition-colors hover:text-foreground hidden sm:block"
                        style={{ color: Y }}
                        onClick={e => e.stopPropagation()}
                      >
                        {item.url.replace("https://", "")}
                      </a>
                    )}
                    <span className="font-mono text-xs text-muted-foreground">{item.lastUpdated}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer prompt */}
          <div className="border-t border-border/50 bg-secondary/30 px-4 sm:px-5 py-4">
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span style={{ color: Y }}>❯</span>
              <span className="typing-cursor truncate">nordex --start-project</span>
              <a
                href="#contato"
                className="ml-auto hidden sm:flex items-center gap-1 transition-colors hover:text-foreground"
                style={{ color: Y }}
              >
                iniciar <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
