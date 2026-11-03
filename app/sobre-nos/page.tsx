import type { Metadata } from "next"
import { Hero } from "./components/hero"
import { About } from "./components/about"
import { Projects } from "./components/projects"
import { Contact } from "./components/contact"

export const metadata: Metadata = {
  title: "Sobre Nós",
  description: "Conheça Guilherme Luz Conci, desenvolvedor front-end por trás da Conci, e seus projetos.",
}

// Página /sobre-nos: portfólio com visual próprio (preto e branco), sem o menu da loja.
// Ordem das seções: 01 Início (preto) → 02 Sobre (branco) → 03 Projetos (preto) → 04 Contato (branco)
export default function SobreNosPage() {
  return (
    // -m-6 anula o espaçamento (p-6) que o layout coloca em todas as páginas
    <div className="-m-6 overflow-hidden bg-black">
      <Hero />
      <About />
      <Projects />
      <Contact />
    </div>
  )
}
