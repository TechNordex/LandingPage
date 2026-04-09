"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"

const Y = "oklch(0.78 0.18 80)"

const notes = [
  {
    id: 1,
    title: "Tecnologia acessível para todos",
    excerpt: "Acreditamos que toda empresa, independente do tamanho, merece acesso a soluções digitais de qualidade. Por isso desenvolvemos com foco em custo-benefício real.",
    tag: "valores",
    gradient: "from-primary/20 to-emerald-500/20",
  },
  {
    id: 2,
    title: "Time especializado em resultados",
    excerpt: "Nossa equipe combina expertise em desenvolvimento, IA e infraestrutura para entregar produtos que funcionam de verdade no dia a dia do seu negócio.",
    tag: "equipe",
    gradient: "from-yellow-500/20 to-orange-500/20",
  },
  {
    id: 3,
    title: "Entregas ágeis com qualidade",
    excerpt: "Transparência e comunicação clara em todo o projeto. Você acompanha cada etapa, de perto, sem surpresas.",
    tag: "processo",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: 4,
    title: "Suporte próximo e dedicado",
    excerpt: "Não entregamos e sumimos. Após o lançamento continuamos ao seu lado com manutenção, evoluções e suporte especializado 24/7.",
    tag: "suporte",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
]

export function About() {
  return (
    <section id="sobre" className="px-4 sm:px-6 py-14 sm:py-20 border-t border-border/30">
      <div className="mx-auto max-w-7xl">

        {/* Two-column layout */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 lg:items-start">

          {/* Left — header + identity card */}
          <div className="relative animate-scale-in stagger-2">
            {/* Header — mesma altura que o título da coluna direita */}
            <div className="mb-8 space-y-3 animate-fade-in-up">
              <p className="font-mono text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em]" style={{ color: Y }}>
                Quem somos
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Tecnologia nordestina com<br />alcance nacional
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                A Nordex Tech nasceu com um propósito claro: levar soluções tecnológicas de alta qualidade para empresas que querem evoluir.
              </p>
            </div>
            <div className="relative rounded-xl border border-border bg-card/40 glass p-8 hover-lift">
              {/* Terminal header dots */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full opacity-60" style={{ background: Y }} />
              </div>
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 bg-background/50 rounded-md px-3 py-1 font-mono text-xs text-muted-foreground">
                about://nordextech
              </div>

              {/* Logo */}
              <div className="mt-8 flex justify-center">
                <div className="relative flex items-center justify-center rounded-xl border border-border/50 bg-background/50 aspect-square max-w-[240px] w-full p-8">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Nordex-Tech-remove-WSehNqsem3EZQ2jxpk0CKTKMU1hLtG.png"
                    alt="Nordex Tech"
                    width={200}
                    height={200}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>

              {/* Info lines */}
              <div className="mt-6 space-y-2 font-mono text-sm border-t border-border/50 pt-5">
                {[
                  ["sede",      "Moreno, Pernambuco, Brasil"],
                  ["fundação",  "2023"],
                  ["foco",      "Sistemas & IA"],
                  ["alcance",   "Nacional"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-3">
                    <span className="text-muted-foreground min-w-[80px]">{k}</span>
                    <span className="text-foreground/50 mr-1">:</span>
                    <span style={{ color: Y }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating date badge */}
            <div
              className="absolute -bottom-3 -right-3 hidden lg:block rounded-lg border border-border bg-card glass px-4 py-2 font-mono text-xs text-muted-foreground animate-float"
              style={{ animationDelay: "0.5s" }}
            >
              desde 2023
            </div>
          </div>

          {/* Right — notes */}
          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6 animate-fade-in-up stagger-1">
              Nossos valores
            </p>
            {notes.map((note, i) => (
              <article
                key={note.id}
                className="group relative cursor-default overflow-hidden rounded-xl border border-border bg-card/40 glass p-5 sm:p-6 transition-all duration-300 hover:border-primary/40 hover:bg-card/60 hover-lift animate-fade-in-up"
                style={{ animationDelay: `${i * 100 + 200}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${note.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

                <div className="relative z-10">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-lg border border-border/80 bg-secondary/60 px-3 py-1 font-mono text-xs text-muted-foreground">
                      {note.tag}
                    </span>
                  </div>
                  <h3 className="mb-2 text-base font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary">
                    {note.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{note.excerpt}</p>
                </div>

                <div className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full"
                  style={{ background: `linear-gradient(to right, ${Y}, transparent)` }} />
              </article>
            ))}

            <a
              href="#contato"
              className="group mt-2 relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-lg px-7 py-3.5 font-mono text-sm transition-all duration-500 active:scale-[0.98]"
              style={{ border: `1px solid ${Y}50`, background: `${Y}15`, color: Y }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${Y}25`}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${Y}15`}
            >
              <span className="relative z-10">Iniciar um projeto</span>
              <ArrowRight size={15} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              <span className="absolute inset-0 -translate-x-full transition-transform duration-500 group-hover:translate-x-0" style={{ background: `${Y}28` }} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
