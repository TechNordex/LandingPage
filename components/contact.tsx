"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, Send } from "lucide-react"

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [sent, setSent] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="contato" className="py-24 px-6 bg-card">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
            Entre em contato
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-foreground text-balance"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Vamos construir algo incrível juntos?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Conte-nos sobre o seu projeto. Nossa equipe responde em até 24 horas com uma proposta sob medida para o seu negócio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Info */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {[
              {
                icon: Mail,
                label: "E-mail",
                value: "contato@nordex.tech",
                href: "mailto:contato@nordex.tech",
              },
              {
                icon: Phone,
                label: "WhatsApp",
                value: "+55 (85) 99999-0000",
                href: "https://wa.me/5585999990000",
              },
              {
                icon: MapPin,
                label: "Localização",
                value: "Nordeste, Brasil",
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
            <div className="border-t border-border pt-8">
              <p className="text-sm text-muted-foreground mb-4">Nos siga nas redes sociais</p>
              <div className="flex gap-3">
                {["LinkedIn", "Instagram", "GitHub"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="px-4 py-2 rounded-md border border-border text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-12 px-8 rounded-xl border border-primary/30 bg-primary/5">
                <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <Send size={28} />
                </div>
                <h3
                  className="text-2xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  Mensagem enviada!
                </h3>
                <p className="text-muted-foreground">
                  Obrigado pelo contato. Nossa equipe retornará em breve.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", message: "" }) }}
                  className="mt-2 text-primary text-sm font-semibold hover:underline underline-offset-4"
                >
                  Enviar nova mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Nome
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Seu nome completo"
                      value={form.name}
                      onChange={handleChange}
                      className="px-4 py-3 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      E-mail
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={form.email}
                      onChange={handleChange}
                      className="px-4 py-3 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Conte sobre seu projeto, desafio ou ideia..."
                    value={form.message}
                    onChange={handleChange}
                    className="px-4 py-3 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
                >
                  Enviar mensagem <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
