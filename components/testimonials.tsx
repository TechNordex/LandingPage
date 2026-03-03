import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Carlos Mendonça",
    role: "CEO, Varejo Norte",
    content:
      "A Nordex Tech entregou nosso sistema de gestão no prazo e com uma qualidade que superou nossas expectativas. O suporte pós-entrega é exemplar.",
    stars: 5,
  },
  {
    name: "Fernanda Lima",
    role: "Diretora de TI, AgroNordeste",
    content:
      "Transformaram nossos dados brutos em dashboards incríveis. Agora tomamos decisões muito mais rápido e com confiança. Parceria de longo prazo.",
    stars: 5,
  },
  {
    name: "Rafael Sousa",
    role: "Fundador, FinTech Recife",
    content:
      "A integração que desenvolveram para nós eliminou horas de trabalho manual por semana. Time técnico excepcional e comunicação impecável.",
    stars: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
            Depoimentos
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-foreground text-balance"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            O que nossos clientes dizem
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative p-8 rounded-xl border border-border bg-background flex flex-col gap-5"
            >
              {/* Stars */}
              <div className="flex items-center gap-1">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} size={14} className="fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                "{t.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
