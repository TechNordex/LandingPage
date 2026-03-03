import Image from "next/image"
import { CheckCircle2 } from "lucide-react"

const values = [
  "Tecnologia acessível para empresas de todos os tamanhos",
  "Time especializado e comprometido com resultados",
  "Entregas ágeis com qualidade e transparência",
  "Suporte próximo e comunicação clara em todo o projeto",
]

export function About() {
  return (
    <section id="sobre" className="py-24 px-6 bg-card">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Visual side */}
        <div className="relative">
          {/* Main block */}
          <div className="relative rounded-2xl overflow-hidden border border-border aspect-square max-w-md mx-auto lg:mx-0">
            <Image
              src="/logo-nordex.jpg"
              alt="Nordex Tech — empresa de tecnologia"
              fill
              className="object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-background/40" />
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-6 -right-4 md:right-8 bg-primary text-primary-foreground rounded-xl px-6 py-4 shadow-2xl">
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              +5 anos
            </p>
            <p className="text-xs font-medium opacity-80">entregando tecnologia</p>
          </div>

          {/* Side tag */}
          <div className="absolute -top-4 -left-4 md:left-0 bg-card border border-border rounded-xl px-5 py-3 shadow-xl">
            <p className="text-xs font-semibold text-muted-foreground">Sede em</p>
            <p className="text-sm font-bold text-foreground">Nordeste, Brasil</p>
          </div>
        </div>

        {/* Content side */}
        <div>
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">
            Quem somos
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-foreground text-balance mb-6"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Tecnologia nordestina com alcance nacional
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            A <span className="text-foreground font-semibold">Nordex Tech</span> nasceu com um propósito claro: levar soluções tecnológicas de alta qualidade para empresas que querem evoluir. Somos uma empresa de tecnologia com raízes no Nordeste do Brasil e visão voltada para o futuro.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Combinamos criatividade local com as melhores tecnologias do mercado para construir produtos digitais que realmente funcionam — e fazem diferença no dia a dia do seu negócio.
          </p>

          {/* Values list */}
          <ul className="flex flex-col gap-3 mb-8">
            {values.map((v) => (
              <li key={v} className="flex items-start gap-3 text-sm text-foreground">
                <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
                <span>{v}</span>
              </li>
            ))}
          </ul>

          <a
            href="#contato"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
          >
            Iniciar um projeto
          </a>
        </div>
      </div>
    </section>
  )
}
