import Image from "next/image"

const links = {
  Empresa: [
    { label: "Sobre nós", href: "#sobre" },
    { label: "Projetos", href: "#projetos" },
    { label: "Contato", href: "#contato" },
  ],
  Soluções: [
    { label: "Sistemas Web", href: "#solucoes" },
    { label: "Apps Mobile", href: "#solucoes" },
    { label: "APIs & Integrações", href: "#solucoes" },
    { label: "BI & Dados", href: "#solucoes" },
  ],
  Suporte: [
    { label: "WhatsApp", href: "https://api.whatsapp.com/send?phone=5581984889683" },
    { label: "E-mail", href: "mailto:contato@nordex.tech" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Image
              src="/logo-nordex.jpg"
              alt="Nordex Tech"
              width={130}
              height={40}
              className="h-10 w-auto object-contain mb-4"
            />
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Soluções tecnológicas inovadoras desenvolvidas no Nordeste do Brasil para empresas e pessoas que querem crescer de verdade.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4
                className="text-xs font-semibold uppercase tracking-widest text-primary mb-4"
              >
                {category}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Nordex Tech. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
