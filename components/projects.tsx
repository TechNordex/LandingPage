/**
 * Projects
 * --------
 * - Section header fades up on scroll
 * - Project cards reveal with staggered fade-up
 * - card-hover class for lift + golden glow effect (globals.css)
 * - Decorative golden line grows left-to-right on card hover (CSS ::before)
 */
import { ExternalLink } from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

const projects = [
  {
    tag: "Plataforma Web",
    title: "Sistema de Gestão Empresarial",
    problem: "Falta de controle de estoque centralizado consumia horas de trabalho sem necessidade.",
    result: "Gestão precisa de estoque e integração com plataformas externas, facilitando o dia a dia.",
    color: "from-primary/20 to-primary/5",
  },
  {
    tag: "Inteligência Artificial",
    title: "Assistente de Atendimento",
    problem: "Time de suporte sobrecarregado, gerando clientes insatisfeitos com a demora.",
    result: "Redução no tempo de resposta com resoluções instantâneas trabalhando 24/7 com nosso agente de IA especializado em suporte humanizado.",
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    tag: "API & Integração",
    title: "Hub de Pagamentos (Fintech)",
    problem: "Cobranças manuais e interação manual com pagamentos pelo financeiro.",
    result: "Cobranças realizadas automaticamente via API e integração com gateways de pagamento.",
    color: "from-orange-500/20 to-orange-500/5",
  },
]

/** Stagger delays per card (ms) */
const STAGGER = [0, 120, 240]

export function Projects() {
  return (
    <section id="projetos" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <AnimateOnScroll animation="fade-up">
          <div className="mb-16 text-center">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
              Nossos projetos
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-foreground text-balance"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Resultados que falam por si
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Cada projeto é uma parceria. Veja alguns dos trabalhos que desenvolvemos para clientes que acreditaram na tecnologia como diferencial.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <AnimateOnScroll key={project.title} animation="fade-up" delay={STAGGER[i] ?? 0}>
              <div className="card-hover group relative p-8 rounded-xl border border-border bg-card hover:border-primary/30 overflow-hidden h-full">
                {/* BG tint */}
                <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-50 pointer-events-none`} />

                {/* Golden line — grows on hover */}
                <div className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full bg-primary/60 transition-all duration-500 ease-out" />

                <div className="relative z-10">
                  {/* Tag */}
                  <span className="inline-block text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-5">
                    {project.tag}
                  </span>

                  <h3
                    className="text-xl font-bold text-foreground mb-3"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {project.title}
                  </h3>
                  <div className="mb-6 space-y-3">
                    <div className="border-l-2 border-red-500/30 pl-3">
                      <p className="text-xs font-semibold text-red-500/80 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500/80"></span>Problema</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {project.problem}
                      </p>
                    </div>
                    <div className="border-l-2 border-primary/50 pl-3">
                      <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary/80"></span>Resultado alcançado</p>
                      <p className="text-foreground text-sm font-medium leading-relaxed">
                        {project.result}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
