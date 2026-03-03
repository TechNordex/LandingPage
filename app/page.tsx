import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Solutions } from "@/components/solutions"
import { About } from "@/components/about"
import { Projects } from "@/components/projects"
import { Founders } from "@/components/testimonials"
import { CtaBanner } from "@/components/cta-banner"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Solutions />
      <About />
      <Projects />
      <Founders />
      <CtaBanner />
      <Contact />
      <Footer />
    </main>
  )
}
