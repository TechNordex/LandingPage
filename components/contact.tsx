"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, Send, ArrowRight, ArrowLeft } from "lucide-react"

export function Contact() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ challenge: "", teamSize: "", name: "", whatsapp: "" })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target

    if (name === "whatsapp") {
      const cleaned = value.replace(/\D/g, "")
      let formatted = cleaned
      if (cleaned.length > 0) {
        formatted = `(${cleaned.slice(0, 2)}`
        if (cleaned.length > 2) {
          formatted += `) ${cleaned.slice(2, 3)}`
        }
        if (cleaned.length > 3) {
          formatted += ` ${cleaned.slice(3, 7)}`
        }
        if (cleaned.length > 7) {
          formatted += `-${cleaned.slice(7, 11)}`
        }
      }
      setForm((prev) => ({ ...prev, [name]: formatted }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSelect(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function nextStep() {
    setStep(step + 1)
  }

  function prevStep() {
    setStep(step - 1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { challenge, teamSize, name, whatsapp } = form

    if (!name || !whatsapp) return

    setLoading(true)
    setError(null)

    try {
      // 1. Enviar email silenciosamente via backend (Resend)
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      // 2. Montar mensagem e redirecionar para o WhatsApp
      const message = `Olá! Meu nome é *${name}* (${whatsapp}).\n\nEstou entrando em contato através do site.\n\nMeu foco atual é: *${challenge || "Não especificado"}*\nTamanho da equipe: *${teamSize || "Não especificado"}*\n\nGostaria de entender como a Nordex Tech pode me ajudar!`

      const targetNumber = "5581984889683"
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetNumber}&text=${encodeURIComponent(message)}`

      window.open(whatsappUrl, "_blank")

      // 3. Sucesso na Interface
      setSent(true)
    } catch (err) {
      console.error(err)
      setError("Ocorreu um erro ao processar seu contato.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contato" className="py-24 px-6 bg-card">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
            Inicie um projeto
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-foreground text-balance"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Vamos construir algo incrível juntos?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Responda a 3 perguntas rápidas e nossa equipe retornará em até 24 horas com uma proposta sob medida para o seu negócio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Info */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {[
              {
                icon: Mail,
                label: "E-mail",
                value: "technordex@gmail.com",
                href: "mailto:technordex@gmail.com",
              },
              {
                icon: Phone,
                label: "WhatsApp",
                value: "+55 (81) 98488-9683",
                href: "https://wa.me/5581984889683",
              },
              {
                icon: MapPin,
                label: "Localização",
                value: "Moreno, Pernambuco, Brasil",
                href: "#",
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">
                      {item.label}
                    </p>
                    <p className="text-foreground font-medium">{item.value}</p>
                  </div>
                </a>
              )
            })}

            {/* Divider */}
            <div className="border-t border-border pt-8 mt-4">
              <p className="text-sm text-muted-foreground mb-4">Nos siga nas redes sociais</p>
              <div className="flex gap-3">
                {[
                  { label: "LinkedIn", href: "https://www.linkedin.com/company/nordex-tech" },
                  { label: "Instagram", href: "https://www.instagram.com/nordex.tech" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-md border border-border text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-surface border border-border rounded-xl p-8 md:p-10 shadow-sm relative overflow-hidden">
          <div className="lg:col-span-3 bg-card/20 backdrop-blur-[12px] border border-white/5 rounded-xl p-8 md:p-10 relative overflow-hidden">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
                <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-2">
                  <Send size={28} />
                </div>
                <h3
                  className="text-2xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  Tudo certo!
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  Recebemos suas informações. Um especialista da nossa equipe entrará em contato via WhatsApp muito em breve.
                </p>
                <button
                  onClick={() => { setSent(false); setStep(1); setForm({ challenge: "", teamSize: "", name: "", whatsapp: "" }) }}
                  className="mt-6 text-primary text-sm font-semibold hover:underline underline-offset-4"
                >
                  Enviar nova solicitação
                </button>
              </div>
            ) : (
              <div className="relative">
                {/* Progress bar */}
                <div className="flex gap-2 mb-8">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-primary/10"}`} />
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <label className="text-base font-semibold text-foreground mb-4 block">
                        1. Qual o foco principal do seu projeto hoje?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {["Aumentar Vendas / E-commerce", "Melhorar a Gestão (ERP)", "Aplicativo Próprio", "Outro Desafio"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => { handleSelect("challenge", opt); setTimeout(nextStep, 300) }}
                            className={`px-4 py-4 rounded-lg border text-left text-sm transition-all ${form.challenge === opt ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:border-primary/50 text-foreground"}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <label className="text-base font-semibold text-foreground mb-4 block">
                        2. Qual o tamanho da sua equipe/empresa?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {["Sou só eu (Empreendedor)", "1 a 5 pessoas", "6 a 20 pessoas", "Mais de 20 pessoas"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => { handleSelect("teamSize", opt); setTimeout(nextStep, 300) }}
                            className={`px-4 py-4 rounded-lg border text-left text-sm transition-all ${form.teamSize === opt ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:border-primary/50 text-foreground"}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      <button type="button" onClick={prevStep} className="mt-8 text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground">
                        <ArrowLeft size={14} /> Voltar
                      </button>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <label className="text-base font-semibold text-foreground mb-4 block">
                        3. Para onde enviamos nossa proposta?
                      </label>

                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Seu Nome
                          </label>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder="Como podemos te chamar?"
                            value={form.name}
                            onChange={handleChange}
                            className="px-4 py-3 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="whatsapp" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            WhatsApp
                          </label>
                          <input
                            id="whatsapp"
                            name="whatsapp"
                            type="tel"
                            required
                            placeholder="(00) 00000-0000"
                            value={form.whatsapp}
                            onChange={handleChange}
                            className="px-4 py-3 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                          />
                        </div>
                      </div>

                      {error && (
                        <p className="mt-4 text-sm text-red-500 bg-red-500/10 rounded-md px-4 py-2">{error}</p>
                      )}

                      <div className="mt-8 flex items-center justify-between">
                        <button type="button" onClick={prevStep} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground">
                          <ArrowLeft size={14} /> Voltar
                        </button>

                        <button
                          type="submit"
                          disabled={loading || !form.name || !form.whatsapp}
                          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              Agendar Minha Consultoria Gratuita <ArrowRight size={18} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
