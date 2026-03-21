/**
 * Navbar
 * ------
 * - Fixed header with blur on scroll
 * - Scroll progress bar (golden line at the very top)
 * - Responsive: hamburger menu for mobile with slide-down animation
 */
"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Soluções", href: "#solucoes" },
  { label: "Sobre", href: "#sobre" },
  { label: "Projetos", href: "#projetos" },
  { label: "Contato", href: "#contato" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animationFrameId: number

    const updateScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight

      setScrolled(scrollTop > 20)

      if (progressBarRef.current) {
        const progress = docHeight > 0 ? scrollTop / docHeight : 0
        progressBarRef.current.style.setProperty("--scroll-progress", progress.toString())
      }

      animationFrameId = requestAnimationFrame(updateScroll)
    }

    animationFrameId = requestAnimationFrame(updateScroll)

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()

    // Smooth scroll to target area
    if (href.startsWith("#")) {
      const targetId = href.substring(1)
      const elem = document.getElementById(targetId)
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" })
      }
    }

    // Close mobile menu if open
    if (open) {
      setOpen(false)
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-background/95 backdrop-blur-md border-b border-border"
        : "bg-transparent"
        }`}
    >
      {/* ── Scroll progress bar (golden line) ── */}
      <div
        ref={progressBarRef}
        className="scroll-progress-bar"
        style={{ "--scroll-progress": "0" } as React.CSSProperties}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#inicio" onClick={(e) => handleScroll(e, "#inicio")} className="flex items-center gap-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Nordex-Tech-remove-WSehNqsem3EZQ2jxpk0CKTKMU1hLtG.png"
            alt="Nordex Tech"
            width={180}
            height={60}
            className="h-14 w-auto object-contain"
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="btn-slide text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 pb-px"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="https://nordy.nordex.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/10 transition-colors duration-200"
          >
            Conheça o Nordy
          </a>
          <a
            href="/login"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
          >
            Entrar
          </a>
          <a
            href="#contato"
            onClick={(e) => handleScroll(e, "#contato")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Fale Conosco
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-foreground transition-transform active:scale-90"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu — slide-down */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="bg-background border-t border-border px-6 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-base font-medium text-foreground hover:text-primary transition-colors"
              onClick={(e) => handleScroll(e, link.href)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-2">
            <a
              href="https://nordy.nordex.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-3 rounded-md border border-primary/40 text-primary text-base font-semibold hover:bg-primary/10 transition-colors"
            >
              Conheça o Nordy
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center px-5 py-3 rounded-md border border-border text-base font-medium text-foreground hover:bg-white/5 transition-colors"
            >
              Entrar
            </a>
            <a
              href="#contato"
              className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
              onClick={(e) => handleScroll(e, "#contato")}
            >
              Fale Conosco
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
