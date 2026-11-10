"use client"

import { useEffect, useState } from "react"
import { ArrowUpIcon } from "@heroicons/react/24/outline"

// ✏️ A partir de quantos pixels rolados a seta aparece (no topo ela não faz sentido)
const APARECE_DEPOIS_DE = 400

// Seta para voltar ao topo do portfólio, presa no canto de baixo à direita.
// Fundo transparente. mix-blend-difference: a seta e a borda "invertem" a cor do que está atrás,
// então ficam brancas nas seções pretas e pretas nas seções brancas, sempre visíveis.
export function BotaoTopo() {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > APARECE_DEPOIS_DE)
    aoRolar() // a página pode abrir já rolada (ex.: voltar do navegador)
    window.addEventListener("scroll", aoRolar, { passive: true })
    return () => window.removeEventListener("scroll", aoRolar)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      // tabIndex -1 quando escondida: quem navega pelo teclado não "cai" num botão invisível
      tabIndex={visivel ? 0 : -1}
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-transparent text-white mix-blend-difference transition-all duration-300 hover:bg-white/20 ${
        visivel ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUpIcon className="h-6 w-6" />
    </button>
  )
}
