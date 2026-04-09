"use client"

import Image from "next/image"
import { Mail, Phone, MapPin, ExternalLink, Heart } from "lucide-react"

const Y = "oklch(0.78 0.18 80)"

const socialLinks = [
  { label: "LinkedIn",  href: "https://www.linkedin.com/company/nordex-tech",  handle: "/company/nordex-tech" },
  { label: "Instagram", href: "https://www.instagram.com/nordex.tech",          handle: "@nordex.tech" },
  { label: "WhatsApp",  href: "https://wa.me/5581984889683",                    handle: "+55 81 98488-9683" },
  { label: "E-mail",    href: "mailto:contato@nordex.tech",                     handle: "contato@nordex.tech" },
]

const navLinks = [
  { label: "Início",   href: "#inicio" },
  { label: "Soluções", href: "#solucoes" },
  { label: "Sobre",    href: "#sobre" },
  { label: "Projetos", href: "#projetos" },
  { label: "Contato",  href: "#contato" },
]

export function Footer() {
  return (
    <footer className="border-t border-border/30 px-4 sm:px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 sm:gap-16 lg:grid-cols-2">

          {/* Left — CTA */}
          <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em]" style={{ color: Y }}>
                Conecte-se
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-balance">
                {"Vamos construir algo "}
                <span style={{ color: Y }}>juntos</span>
              </h2>
            </div>
            <p className="max-w-md text-base sm:text-lg text-muted-foreground leading-relaxed">
              Sempre abertos a novos projetos, colaborações e conversas sobre tecnologia. Fale com a nossa equipe.
            </p>

            <div className="pt-2">
              <a
                href="https://wa.me/5581984889683"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-lg px-8 py-4 font-mono text-sm font-semibold transition-all duration-500 active:scale-[0.98] w-full sm:w-auto"
                style={{ border: `1px solid ${Y}50`, background: `${Y}15`, color: Y }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${Y}28`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${Y}15`}
              >
                <span className="relative z-10">enviar uma mensagem</span>
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
                <span className="absolute inset-0 -translate-x-full transition-transform duration-500 group-hover:translate-x-0" style={{ background: `${Y}28` }} />
              </a>
            </div>
          </div>

          {/* Right — links */}
          <div className="space-y-6 lg:text-right animate-fade-in-up stagger-2">
            <p className="font-mono text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em] text-muted-foreground">
              Nos encontre
            </p>
            <div className="space-y-2">
              {socialLinks.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.label !== "E-mail" ? "_blank" : undefined}
                  rel={link.label !== "E-mail" ? "noopener noreferrer" : undefined}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-transparent p-4 transition-all duration-300 lg:flex-row-reverse hover:border-border/50 hover:bg-card/50 glass animate-fade-in"
                  style={{ animationDelay: `${i * 100 + 400}ms` }}
                >
                  <div className="flex items-center gap-3 lg:flex-row-reverse">
                    <span className="font-mono text-sm font-medium transition-colors group-hover:text-primary">
                      {link.label}
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground/50 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground truncate">{link.handle}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Nav links */}
        <div className="mt-16 pt-8 border-t border-border/30 flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-mono text-xs text-muted-foreground uppercase tracking-widest transition-colors hover:text-foreground underline-animate"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-border/30 pt-8 sm:flex-row animate-fade-in stagger-4">
          <div className="flex items-center gap-2.5 font-mono text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: Y }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: Y }} />
            </span>
            <span>Forjado com</span>
            <Heart className="h-3.5 w-3.5 text-destructive animate-pulse" />
            <span>no Nordeste</span>
          </div>

          <div className="flex items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Nordex-Tech-remove-WSehNqsem3EZQ2jxpk0CKTKMU1hLtG.png"
              alt="Nordex Tech"
              width={80}
              height={28}
              className="h-7 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>

          <p className="font-mono text-xs text-muted-foreground text-center sm:text-right">
            © {new Date().getFullYear()} NORDEX TECH — Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  )
}
