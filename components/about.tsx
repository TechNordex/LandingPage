/**
 * About
 * -----
 * - Logo panel slides in from the right
 * - Text content slides in from the left
 * - Values list items fade up with stagger (delay by index)
 */
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

const values = [
  "Tecnologia acessível para empresas de todos os tamanhos",
  "Time especializado e comprometido com resultados",
  "Entregas ágeis com qualidade e transparência",
  "Suporte próximo e comunicação clara em todo o projeto",
]

export function About() {
  return (
    <section id="sobre" className="py-24 px-6 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Visual side — slides in from left */}
        <AnimateOnScroll animation="slide-right">
          <div className="relative">
            <div className="relative flex items-center justify-center rounded-2xl overflow-hidden bg-surface aspect-square max-w-md mx-auto lg:mx-0 p-10">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Nordex-Tech-remove-WSehNqsem3EZQ2jxpk0CKTKMU1hLtG.png"
                alt="Nordex Tech — empresa de tecnologia"
                width={320}
                height={320}
                className="object-contain w-full h-full"
              />
            </div>

            {/* Side tag */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:-bottom-5 lg:-right-5 bg-surface rounded-xl px-5 py-3">
              <p className="text-xs font-semibold text-muted-foreground">Sede em</p>
              <p className="text-sm font-bold text-foreground">Moreno, PE</p>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Content side — slides in from right */}
        <AnimateOnScroll animation="slide-left" delay={100}>
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

            {/* Values list — staggered */}
            <ul className="flex flex-col gap-3 mb-8">
              {values.map((v, i) => (
                <AnimateOnScroll key={v} animation="fade-up" delay={i * 80}>
                  <li className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
                    <span>{v}</span>
                  </li>
                </AnimateOnScroll>
              ))}
            </ul>

            <a
              href="#contato"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
            >
              Iniciar um projeto
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
