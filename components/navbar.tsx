"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Mail, MessageCircle, Menu, X } from "lucide-react"

const Y = "oklch(0.78 0.18 80)"

const navLinks = [
  { label: "Início",    href: "#inicio" },
  { label: "Soluções",  href: "#solucoes" },
  { label: "Sobre",     href: "#sobre" },
  { label: "Projetos",  href: "#projetos" },
  { label: "Contato",   href: "#contato" },
]

const socialLinks = [
  { label: "WhatsApp", href: "https://api.whatsapp.com/send?phone=5581984889683", icon: MessageCircle },
  { label: "E-mail",   href: "mailto:contato@nordex.tech", icon: Mail },
]

export function Navbar() {
  const [open, setOpen]             = useState(false)
  const [scrolled, setScrolled]     = useState(false)
  const [hovered, setHovered]       = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState("inicio")
  const progressRef = useRef<HTMLDivElement>(null)

  /* Scroll progress bar */
  useEffect(() => {
    let rafId: number
    const tick = () => {
      const top    = window.scrollY
      const height = document.documentElement.scrollHeight - window.innerHeight
      setScrolled(top > 20)
      if (progressRef.current) {
        progressRef.current.style.setProperty("--scroll-progress", height > 0 ? String(top / height) : "0")
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  /* Active section via IntersectionObserver */
  useEffect(() => {
    const ids = navLinks.map(l => l.href.substring(1))
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    )

    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const id = href.substring(1)
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setOpen(false)
  }

  const isActive = (href: string) => `#${activeSection}` === href

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-sm"
          : "bg-transparent",
      )}
    >
      {/* Scroll progress bar */}
      <div
        ref={progressRef}
        className="scroll-progress-bar"
        style={{ "--scroll-progress": "0" } as React.CSSProperties}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
        <nav className="flex items-center justify-between">

          {/* Logo + name */}
          <a
            href="#inicio"
            onClick={(e) => handleScroll(e, "#inicio")}
            className="group flex items-center gap-3"
          >
            <div
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border overflow-hidden transition-all duration-300 group-hover:scale-105"
              style={{ borderColor: `${Y}80`, background: `${Y}18` }}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Nordex-Tech-remove-WSehNqsem3EZQ2jxpk0CKTKMU1hLtG.png"
                alt="Nordex Tech"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <span className="font-mono text-sm tracking-tight">
              NORDEX
              <span className="font-semibold" style={{ color: Y }}>TECH</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "relative px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-all duration-300 rounded-lg",
                  isActive(link.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                )}
              >
                <span
                  className={cn(
                    "absolute left-1.5 transition-all duration-200",
                    hovered === i || isActive(link.href)
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2",
                  )}
                  style={{ color: Y }}
                >
                  {">"}
                </span>
                <span
                  className={cn(
                    "transition-transform duration-200",
                    (hovered === i || isActive(link.href)) && "translate-x-2",
                  )}
                >
                  {link.label}
                </span>
                <span
                  className={cn(
                    "absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300",
                    hovered === i || isActive(link.href) ? "w-6" : "w-0",
                  )}
                  style={{ background: Y }}
                />
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Social icons */}
            <div className="hidden items-center gap-1 sm:flex">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="group relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 hover:bg-primary/10"
                  style={{ ["--hover-color" as string]: Y }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = Y}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = ""}
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <div className="hidden h-5 w-px bg-border sm:block" />

            {/* Status pill */}
            <div className="hidden items-center gap-2.5 font-mono text-xs text-muted-foreground sm:flex px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: Y }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: Y }} />
              </span>
              <span>status: building</span>
            </div>

            {/* CTA */}
            <a
              href="#contato"
              onClick={(e) => handleScroll(e, "#contato")}
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-xs font-semibold transition-all duration-300 active:scale-[0.98]"
              style={{ border: `1px solid ${Y}50`, background: `${Y}15`, color: Y }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${Y}25`}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${Y}15`}
            >
              Fale Conosco
            </a>

            {/* Mobile hamburger */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/50 md:hidden transition-colors hover:bg-secondary"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Fechar menu" : "Abrir menu"}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div
          className={cn(
            "transition-all duration-400 md:hidden bg-background overflow-hidden",
            open ? "max-h-96 opacity-100 pt-4" : "max-h-0 opacity-0",
          )}
        >
          <div className="flex flex-col gap-1 border-t border-border/50 pt-4">
            {navLinks.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
                className="flex items-center gap-3 rounded-lg px-4 py-3.5 font-mono text-sm uppercase tracking-widest text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-secondary/50"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span style={{ color: Y }}>{">"}</span>
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-4 px-4">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2.5 px-4 py-3 font-mono text-xs text-muted-foreground bg-secondary/30 rounded-lg mx-4 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: Y }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: Y }} />
              </span>
              <span>status: building</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
