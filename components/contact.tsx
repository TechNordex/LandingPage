"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, ArrowRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const Y = "oklch(0.78 0.18 80)"
const Y15 = "oklch(0.78 0.18 80 / 0.15)"
const Y30 = "oklch(0.78 0.18 80 / 0.30)"

const contactItems = [
  { icon: Mail,   label: "E-mail",      value: "contato@nordex.tech",     href: "mailto:contato@nordex.tech" },
  { icon: Phone,  label: "WhatsApp",    value: "+55 (81) 98488-9683",      href: "https://wa.me/5581984889683" },
  { icon: MapPin, label: "Localização", value: "Moreno, Pernambuco, Brasil", href: undefined },
]

const socialLinks = [
  { label: "LinkedIn",  href: "https://www.linkedin.com/company/nordex-tech" },
  { label: "Instagram", href: "https://www.instagram.com/nordex.tech" },
]

export function Contact() {
  const [step, setStep]     = useState(1)
  const [form, setForm]     = useState({ challenge: "", teamSize: "", name: "", whatsapp: "" })
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    if (name === "whatsapp") {
      const c = value.replace(/\D/g, "")
      let f = c
      if (c.length > 0) {
        f = `(${c.slice(0, 2)}`
        if (c.length > 2) f += `) ${c.slice(2, 3)}`
        if (c.length > 3) f += ` ${c.slice(3, 7)}`
        if (c.length > 7) f += `-${c.slice(7, 11)}`
      }
      setForm(p => ({ ...p, whatsapp: f }))
      return
    }
    setForm(p => ({ ...p, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.whatsapp) return
    setLoading(true); setError(null)
    try {
      await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const msg = `Olá! Meu nome é *${form.name}* (${form.whatsapp}).\n\nFoco: *${form.challenge || "Não especificado"}*\nEquipe: *${form.teamSize || "Não especificado"}*\n\nGostaria de entender como a Nordex Tech pode me ajudar!`
      window.open(`https://api.whatsapp.com/send?phone=5581984889683&text=${encodeURIComponent(msg)}`, "_blank")
      setSent(true)
    } catch {
      setError("Ocorreu um erro. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contato" className="border-t border-border/30 px-4 sm:px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 sm:gap-16 lg:grid-cols-2">

          {/* Left — info */}
          <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em]" style={{ color: Y }}>
                Inicie um projeto
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-balance">
                {"Vamos construir algo "}
                <span style={{ color: Y }}>incrível juntos?</span>
              </h2>
            </div>
            <p className="max-w-md text-base sm:text-lg text-muted-foreground leading-relaxed">
              Responda 3 perguntas rápidas e nossa equipe retornará em até 24 horas com uma proposta sob medida para o seu negócio.
            </p>

            {/* Contact items */}
            <div className="space-y-3">
              {contactItems.map((item) => {
                const Icon = item.icon
                const Wrapper = item.href ? "a" : "div"
                return (
                  <Wrapper
                    key={item.label}
                    {...(item.href ? { href: item.href, target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card/40 glass p-4 transition-all duration-300 hover:border-primary/40 hover:bg-card/60 hover-lift animate-fade-in"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
                      style={{ background: Y15, color: Y }}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium text-foreground mt-0.5">{item.value}</p>
                    </div>
                  </Wrapper>
                )
              })}
            </div>

            {/* Social links */}
            <div className="pt-2 border-t border-border/30">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.2em] mb-4">Siga-nos</p>
              <div className="flex gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-border px-4 py-2 font-mono text-xs text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary/10"
                    style={{ ["--hover-color" as string]: Y }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = Y }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "" }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="animate-scale-in stagger-2">
            <div className="relative rounded-xl border border-border bg-card/40 glass overflow-hidden hover-lift">
              {/* Terminal header */}
              <div className="flex items-center justify-between border-b border-border/50 bg-secondary/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full opacity-60" style={{ background: Y }} />
                </div>
                <span className="font-mono text-xs text-muted-foreground">contact://nordextech</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: Y }} />
                  <span className="font-mono text-[11px]" style={{ color: Y }}>live</span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {sent ? (
                  <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center mb-2 text-2xl"
                      style={{ background: Y15 }}
                    >
                      ✓
                    </div>
                    <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                      Tudo certo!
                    </h3>
                    <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                      Recebemos suas informações. Um especialista entrará em contato via WhatsApp muito em breve.
                    </p>
                    <button
                      onClick={() => { setSent(false); setStep(1); setForm({ challenge: "", teamSize: "", name: "", whatsapp: "" }) }}
                      className="mt-4 font-mono text-sm transition-colors hover:text-foreground"
                      style={{ color: Y }}
                    >
                      enviar nova solicitação →
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Progress */}
                    <div className="flex gap-2 mb-8">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className="h-1 flex-1 rounded-full transition-all duration-500"
                          style={{ background: s <= step ? Y : `${Y}25` }}
                        />
                      ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {step === 1 && (
                        <div className="animate-fade-in-up">
                          <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground mb-4">
                            01 / foco principal
                          </p>
                          <h3 className="text-base font-semibold mb-5">Qual o foco do seu projeto?</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {["Aumentar Vendas / E-commerce", "Melhorar a Gestão (ERP)", "Aplicativo Próprio", "Outro Desafio"].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setForm(p => ({ ...p, challenge: opt })); setTimeout(() => setStep(2), 250) }}
                                className={cn(
                                  "px-4 py-4 rounded-lg border text-left text-sm transition-all duration-200 font-mono",
                                  form.challenge === opt
                                    ? "text-foreground"
                                    : "border-border bg-card/40 text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                                )}
                                style={form.challenge === opt ? { borderColor: `${Y}60`, background: Y15, color: Y } : {}}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {step === 2 && (
                        <div className="animate-fade-in-up">
                          <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground mb-4">
                            02 / tamanho da equipe
                          </p>
                          <h3 className="text-base font-semibold mb-5">Qual o tamanho da sua empresa?</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {["Sou só eu (Empreendedor)", "1 a 5 pessoas", "6 a 20 pessoas", "Mais de 20 pessoas"].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setForm(p => ({ ...p, teamSize: opt })); setTimeout(() => setStep(3), 250) }}
                                className={cn(
                                  "px-4 py-4 rounded-lg border text-left text-sm transition-all duration-200 font-mono",
                                  form.teamSize === opt
                                    ? "text-foreground"
                                    : "border-border bg-card/40 text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                                )}
                                style={form.teamSize === opt ? { borderColor: `${Y}60`, background: Y15, color: Y } : {}}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          <button type="button" onClick={() => setStep(1)} className="mt-6 flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft size={12} /> voltar
                          </button>
                        </div>
                      )}

                      {step === 3 && (
                        <div className="animate-fade-in-up">
                          <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground mb-4">
                            03 / seus dados
                          </p>
                          <h3 className="text-base font-semibold mb-5">Para onde enviamos a proposta?</h3>
                          <div className="space-y-4">
                            {[
                              { id: "name",     label: "Seu Nome",  type: "text", placeholder: "Como podemos te chamar?" },
                              { id: "whatsapp", label: "WhatsApp",  type: "tel",  placeholder: "(00) 9 0000-0000" },
                            ].map((field) => (
                              <div key={field.id} className="space-y-1.5">
                                <label htmlFor={field.id} className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                                  {field.label}
                                </label>
                                <input
                                  id={field.id}
                                  name={field.id}
                                  type={field.type}
                                  required
                                  placeholder={field.placeholder}
                                  value={form[field.id as "name" | "whatsapp"]}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 rounded-lg border border-border bg-background/50 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none transition-all duration-200"
                                  style={{ ["--focus-ring" as string]: Y }}
                                  onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = Y}
                                  onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = ""}
                                />
                              </div>
                            ))}
                          </div>

                          {error && (
                            <p className="mt-3 text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-2">{error}</p>
                          )}

                          <div className="mt-6 flex items-center justify-between gap-4">
                            <button type="button" onClick={() => setStep(2)} className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
                              <ArrowLeft size={12} /> voltar
                            </button>
                            <button
                              type="submit"
                              disabled={loading || !form.name || !form.whatsapp}
                              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg px-6 py-3 font-mono text-sm font-semibold transition-all duration-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ border: `1px solid ${Y30}`, background: Y15, color: Y }}
                            >
                              <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                                    enviando...
                                  </>
                                ) : (
                                  <>agendar consultoria gratuita <ArrowRight size={14} /></>
                                )}
                              </span>
                              <span className="absolute inset-0 -translate-x-full transition-transform duration-500 group-hover:translate-x-0" style={{ background: Y30 }} />
                            </button>
                          </div>
                        </div>
                      )}
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
