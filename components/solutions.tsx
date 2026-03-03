import { Globe, Code2, Smartphone, Headphones, BrainCircuit } from "lucide-react"

const solutions = [
  {
    icon: Globe,
    title: "Sistemas Web",
    description:
      "Desenvolvemos plataformas web robustas e escaláveis, de portais corporativos a sistemas de gestão completos.",
  },
  {
    icon: Smartphone,
    title: "Apps Mobile",
    description:
      "Aplicativos iOS e Android com experiência fluida, integrados ao seu negócio e prontos para o mercado.",
  },
  {
    icon: BrainCircuit,
    title: "Soluções com IA",
    description:
      "Integramos inteligência artificial ao seu negócio com chatbots, automações inteligentes, análise preditiva e muito mais.",
  },
  {
    icon: Code2,
    title: "APIs & Integrações",
    description:
      "Conectamos sistemas legados e modernos com APIs robustas, automatizando processos e eliminando retrabalho.",
  },
  {
    icon: Headphones,
    title: "Suporte & Evolução",
    description:
      "Acompanhamos sua solução após o lançamento — manutenção, evolução contínua e suporte especializado.",
  },
]

export function Solutions() {
  return (
    <section id="solucoes" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
              O que fazemos
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-foreground text-balance max-w-xl"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Soluções completas para cada etapa do seu negócio
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm leading-relaxed">
            Da ideia ao produto final, a Nordex Tech está do seu lado com tecnologia de ponta e expertise regional.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.title}
                className="group relative p-8 rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-300 overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
                  style={{ background: "radial-gradient(circle at top left, oklch(0.78 0.18 80), transparent 70%)" }}
                />

                <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                  <Icon size={22} />
                </div>

                <h3
                  className="text-lg font-bold text-foreground mb-3"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {s.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {s.description}
                </p>

                <div className="mt-6 flex items-center gap-1 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Saiba mais
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="translate-x-0 group-hover:translate-x-1 transition-transform">
                    <path d="M1 7h12M8 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
