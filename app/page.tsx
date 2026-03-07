import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Solutions } from "@/components/solutions"
import { About } from "@/components/about"
import { Projects } from "@/components/projects"
import { Founders } from "@/components/testimonials"
import { CtaBanner } from "@/components/cta-banner"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { ChatWidget } from "@/components/chat-widget"
import { InteractiveMesh } from "@/components/interactive-mesh"

export default function Home() {
  return (
    <main className="relative bg-transparent">
      <InteractiveMesh />
      <Navbar />
      <Hero />
      <Solutions />
      <About />
      <Projects />
      <Founders />
      <CtaBanner />
      <Contact />
      <Footer />
      <ChatWidget />
    </main>
  )
}
