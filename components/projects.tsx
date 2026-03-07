/**
 * Projects — Interactive Diagnostic Section
 * ------------------------------------------
 * "use client" — has interactive problem-chips with animated solution panels.
 *
 * UX flow:
 *   1. User sees 3 category cards (Gestão, IA, Pagamentos)
 *   2. Each card lists selectable problem chips
 *   3. Clicking a chip reveals an animated solution panel below
 *   4. Selecting a different chip smoothly swaps the panel
 *
 * Animations aligned with the rest of the project:
 *   - Card entrance: AnimateOnScroll (fade-up staggered)
 *   - Chip state:    transition-colors (200ms)
 *   - Solution panel: opacity + translateY (300ms ease) — same feel as fadeUp keyframe
 */
"use client"

import { useState } from "react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { CheckCircle2, ChevronRight } from "lucide-react"

/* ── Data ─────────────────────────────────────────── */
interface Challenge {
  label: string
  solution: string
}

interface Category {
  tag: string
  tagColor: string
  borderColor: string
  title: string
  icon: string
  challenges: Challenge[]
}

const categories: Category[] = [
  {
    tag: "Plataforma Web",
    tagColor: "text-primary bg-primary/10 border-primary/20",
    borderColor: "border-primary/50",
    title: "Sistema de Gestão Empresarial",
    icon: "🗂️",
    challenges: [
      {
        label: "Falta de controle de estoque",
        solution:
          "Desenvolvemos um sistema centralizado com dashboards em tempo real, alertas de ruptura e integração com seus fornecedores — sem planilhas, sem retrabalho.",
      },
      {
        label: "Processos financeiros manuais",
        solution:
          "Automatizamos conciliação bancária, contas a pagar e a receber, e geração de relatórios com um módulo financeiro integrado ao seu ERP.",
      },
      {
        label: "Dificuldade em gerar relatórios",
        solution:
          "Painel de BI com filtros avançados, exportação para Excel/PDF e indicadores de performance atualizados em tempo real — decisões baseadas em dados.",
      },
      {
        label: "Sistemas desconectados",
        solution:
          "Criamos uma camada de integração via API que conecta seus sistemas (ERP, e-commerce, plataformas externas) em um fluxo único e automatizado.",
      },
    ],
  },
  {
    tag: "Inteligência Artificial",
    tagColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    borderColor: "border-blue-400/50",
    title: "Assistente de Atendimento com IA",
    icon: "🤖",
    challenges: [
      {
        label: "Equipe de suporte sobrecarregada",
        solution:
          "Nosso agente de IA resolve mais de 80% das dúvidas sem intervenção humana, liberando sua equipe para casos que realmente precisam de atenção especializada.",
      },
      {
        label: "Atendimento fora do horário comercial",
        solution:
          "O Nordy funciona 24/7, respondendo em segundos a qualquer hora do dia ou da noite — sem custo de hora extra, sem clientes esperando.",
      },
      {
        label: "Perda de leads por demora na resposta",
        solution:
          "Qualificação automática no primeiro contato: o assistente capta dados, responde dúvidas e agenda reuniões antes que o lead esfrie.",
      },
      {
        label: "Alto custo operacional de atendimento",
        solution:
          "Redução de até 60% no custo por atendimento mantendo alta satisfação — o agente escala sem contratar, treinar ou gerir mais pessoas.",
      },
    ],
  },
  {
    tag: "API & Integração",
    tagColor: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    borderColor: "border-orange-400/50",
    title: "Hub de Pagamentos & Finanças",
    icon: "💳",
    challenges: [
      {
        label: "Cobranças manuais e demoradas",
        solution:
          "Automatizamos toda a régua de cobrança — PIX, boleto e cartão — com notificações automáticas por WhatsApp e e-mail, sem tocar em planilha.",
      },
      {
        label: "Inadimplência sem controle",
        solution:
          "Sistema de cobrança inteligente com régua automática: lembrete pré-vencimento, aviso no vencimento e follow-up pós-vencimento multicanal.",
      },
      {
        label: "Gateways de pagamento desconectados",
        solution:
          "Integração com Stripe, PagSeguro, Asaas e outros — unificamos tudo em uma API única para que o seu financeiro veja tudo em um só lugar.",
      },
      {
        label: "Falta de visibilidade financeira",
        solution:
          "Dashboard financeiro em tempo real com fluxo de caixa, projeções e alertas — você sabe exatamente onde está o dinheiro da empresa, sempre.",
      },
    ],
  },
]

const STAGGER = [0, 100, 200]

/* ── Card Component ───────────────────────────────── */
function DiagnosticCard({ cat, delay }: { cat: Category; delay: number }) {
  const [selected, setSelected] = useState<number | null>(null)

  const handleSelect = (idx: number) => {
    // Toggle: clicking same chip again closes it
    setSelected((prev) => (prev === idx ? null : idx))
  }

  const activeSolution = selected !== null ? cat.challenges[selected] : null

  return (
    <AnimateOnScroll animation="fade-up" delay={delay}>
      <div className="group relative flex flex-col rounded-xl border border-white/5 bg-card/20 backdrop-blur-[12px] overflow-hidden h-full hover:border-primary/30 transition-colors duration-300">
        {/* Golden line grows on hover */}
        <div className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full bg-primary/60 transition-all duration-500 ease-out" />

        {/* Card body */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Tag + icon */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{cat.icon}</span>
            <span className={`text-xs font-semibold border rounded-full px-3 py-1 ${cat.tagColor}`}>
              {cat.tag}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-lg font-bold text-foreground mb-5"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {cat.title}
          </h3>

          {/* Problem chips */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Qual é o seu desafio?
          </p>
          <div className="flex flex-col gap-2">
            {cat.challenges.map((ch, idx) => {
              const isActive = selected === idx
              return (
                <button
                  key={ch.label}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left text-sm px-4 py-2.5 rounded-lg border transition-all duration-200 flex items-center justify-between gap-2 ${isActive
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-white/5 bg-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-primary/5"
                    }`}
                >
                  <span>{ch.label}</span>
                  <ChevronRight
                    size={14}
                    className={`shrink-0 transition-transform duration-200 ${isActive ? "rotate-90 text-primary" : ""
                      }`}
                  />
                </button>
              )
            })}
          </div>
        </div>

        {/* Solution panel — animates in/out */}
        <div
          className="overflow-hidden transition-all duration-300 ease-out"
          style={{
            maxHeight: activeSolution ? "300px" : "0px",
            opacity: activeSolution ? 1 : 0,
          }}
        >
          {activeSolution && (
            <div className={`mx-4 mb-4 p-4 rounded-lg border-l-2 bg-primary/5 ${cat.borderColor}`}>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1.5">
                    Como resolvemos
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {activeSolution.solution}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimateOnScroll>
  )
}

/* ── Section ──────────────────────────────────────── */
export function Projects() {
  return (
    <section id="projetos" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="animate-on-scroll anim-mask-reveal is-visible mb-16 text-center"
          style={{ animationName: 'maskReveal', animationDuration: '1.2s' }}>
          <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase mb-4">
            Como podemos ajudar
          </p>
          <h2
            className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground text-balance leading-[1.1] tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Como nossa equipe pode auxiliar você ou sua empresa
          </h2>
          <p className="mt-6 text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed font-medium">
            Selecione um desafio abaixo e veja como nossa equipe pode ajudar você ou seu negócio.
          </p>
        </div>

        {/* Diagnostic cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <DiagnosticCard key={cat.title} cat={cat} delay={STAGGER[i] ?? 0} />
          ))}
        </div>
      </div>
    </section>
  )
}
