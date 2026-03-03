import { ExternalLink } from "lucide-react"

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
    tag: "App Mobile",
    title: "App de Delivery Regional",
    description:
      "Aplicativo de delivery para restaurantes locais, com painel administrativo, rastreamento em tempo real e gateway de pagamento.",
    tech: ["React Native", "Firebase", "Stripe"],
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    tag: "BI & Dados",
    title: "Dashboard de Inteligência Comercial",
    description:
      "Painel de análise de dados para uma empresa de agronegócio, consolidando informações de múltiplas fontes em tempo real.",
    tech: ["Python", "Power BI", "AWS"],
    color: "from-emerald-500/20 to-emerald-500/5",
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

export function Projects() {
  return (
    <section id="projetos" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className="group relative p-8 rounded-xl border border-border bg-card hover:border-primary/30 transition-all duration-300 overflow-hidden"
            >
              {/* BG tint */}
              <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-50 pointer-events-none`} />

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

                <button className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4 transition-all">
                  Ver detalhes <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
