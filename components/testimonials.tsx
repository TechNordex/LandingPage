import { Linkedin } from "lucide-react"

const founders = [
  {
    name: "Deyvid Silva",
    role: "Analista de Desenvolvimento de Sistemas Pleno",
    bio: "Especialista em arquitetura de software e desenvolvimento full-stack, transformando ideias complexas em soluções elegantes e performáticas.",
    initials: "DS",
  },
  {
    name: "Gustavo Montenegro",
    role: "Analista de Sistemas",
    bio: "Focado em análise de requisitos e modelagem de sistemas, garantindo que cada solução atenda perfeitamente às necessidades do negócio.",
    initials: "GM",
  },
  {
    name: "Adson Vicente",
    role: "Analista de Infraestrutura de TI",
    bio: "Responsável por infraestrutura robusta e escalável, assegurando alta disponibilidade e segurança em todos os nossos projetos.",
    initials: "AV",
  },
]

export function Founders() {
  return (
    <section id="equipe" className="py-24 px-6 bg-card">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
            Nosso time
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-foreground text-balance"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Conheça os fundadores
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A Nordex Tech foi fundada por profissionais apaixonados por tecnologia e comprometidos em entregar soluções de verdade.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {founders.map((f) => (
            <div
              key={f.name}
              className="group relative p-8 rounded-xl border border-border bg-background flex flex-col items-center text-center gap-5 hover:border-primary/40 transition-all duration-300"
            >
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-primary/15 text-primary flex items-center justify-center text-2xl font-bold border-2 border-primary/30"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {f.initials}
              </div>

              {/* Info */}
              <div>
                <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {f.name}
                </h3>
                <p className="text-sm text-primary font-medium mt-1">{f.role}</p>
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {f.bio}
              </p>

              {/* Social */}
              <a
                href="#"
                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors pt-4 border-t border-border w-full justify-center"
              >
                <Linkedin size={14} />
                LinkedIn
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
