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
    description:
      "Plataforma completa de ERP desenvolvida para uma rede varejista nordestina, com módulos de estoque, financeiro e vendas.",
    tech: ["Next.js", "PostgreSQL", "Node.js"],
    color: "from-primary/20 to-primary/5",
  },
  {
    tag: "Inteligência Artificial",
    title: "Assistente Virtual com IA",
    description:
      "Chatbot inteligente com processamento de linguagem natural para atendimento automatizado, reduzindo tempo de resposta em 70%.",
    tech: ["Python", "OpenAI", "LangChain"],
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    tag: "API & Integração",
    title: "Hub de Integrações Financeiras",
    description:
      "Camada de integração entre sistemas bancários, ERPs e e-commerce para uma fintech em expansão no Nordeste.",
    tech: ["Node.js", "REST API", "Docker"],
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
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-medium text-muted-foreground border border-border rounded-md px-2.5 py-1"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <button className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4 transition-all group/btn">
                    Ver detalhes
                    <ExternalLink
                      size={14}
                      className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                    />
                  </button>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
