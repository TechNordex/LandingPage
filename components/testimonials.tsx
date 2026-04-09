import { ExternalLink } from "lucide-react"

const Y = "oklch(0.78 0.18 80)"

const founders = [
  {
    name: "Gustavo Montenegro",
    role: "Co-Founder & CTO",
    bio: "Arquiteto de Software e desenvolvedor Fullcycle. Responsável pelo ciclo de vida completo das aplicações e na tradução de necessidades de negócio em soluções técnicas.",
    initials: "GM",
    linkedin: "https://www.linkedin.com/in/devmontenegro/",
    tags: ["fullstack", "arquitetura"],
  },
  {
    name: "Deyvid Silva",
    role: "Co-Founder & CTO",
    bio: "Especialista em Inteligência Artificial e automação de fluxos. Responsável pela persistência, modelagem e integridade de dados das aplicações.",
    initials: "DS",
    linkedin: "https://www.linkedin.com/in/deyvid-silva-490aa31b5/",
    tags: ["ia", "dados"],
  },
  {
    name: "Adson Vicente",
    role: "Co-Founder & CTO",
    bio: "Gestor de Operações, Cloud e orquestração de serviços de deploy. Garante a alta disponibilidade, performance de rede e segurança da infraestrutura.",
    initials: "AV",
    linkedin: "https://www.linkedin.com/in/adson-vicente-40968b352/",
    tags: ["cloud", "devops"],
  },
]

export function Founders() {
  return (
    <section id="equipe" className="px-4 sm:px-6 py-14 sm:py-20 border-t border-border/30">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 sm:mb-14 space-y-3 animate-fade-in-up">
          <p className="font-mono text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em]" style={{ color: Y }}>
            Nosso time
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Conheça os fundadores
          </h2>
          <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            A Nordex Tech foi fundada por profissionais apaixonados por tecnologia e comprometidos em entregar soluções de verdade.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {founders.map((f, i) => (
            <article
              key={f.name}
              className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/40 p-6 sm:p-7 glass hover-lift hover:border-primary/40 hover:bg-card/70 transition-all duration-300 animate-fade-in-up flex flex-col"
              style={{ animationDelay: `${i * 100 + 200}ms` }}
            >
              {/* Avatar */}
              <div className="mb-5 flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold border-2 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `${Y}18`,
                    borderColor: `${Y}40`,
                    color: Y,
                    fontFamily: "var(--font-space-grotesk)",
                  }}
                >
                  {f.initials}
                </div>
                <div>
                  <h3 className="font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {f.name}
                  </h3>
                  <p className="font-mono text-xs mt-0.5" style={{ color: Y }}>{f.role}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {f.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-border/80 bg-secondary/60 px-2.5 py-1 font-mono text-xs text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{f.bio}</p>

              {/* LinkedIn */}
              <a
                href={f.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 pt-4 border-t border-border/50 flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary transition-colors duration-300 group/link"
              >
                <ExternalLink className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:scale-110 group-hover/link:rotate-12" />
                <span className="underline-animate">LinkedIn</span>
              </a>

              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full"
                style={{ background: `linear-gradient(to right, ${Y}, transparent)` }}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
