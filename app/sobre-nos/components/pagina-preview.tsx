"use client" // mede a largura da tela para reduzir a página do tamanho certo

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

// A página é "desenhada" como num computador de 1440px e reduzida até caber no cartão
const LARGURA = 1440
const ALTURA = 900

type Props = {
  src: string // endereço da página da loja, ex.: "/", "/login", "/cadastro"
  titulo: string // nome da página (para leitores de tela)
}

// Prévia ao vivo de uma página da loja, dentro de uma "janela de navegador".
// Não é print nem cópia: o <iframe> carrega a página de verdade.
export function PaginaPreview({ src, titulo }: Props) {
  const caixa = useRef<HTMLDivElement>(null)
  const [escala, setEscala] = useState(0.4)

  useEffect(() => {
    const el = caixa.current
    if (!el) return
    const medir = () => setEscala(el.clientWidth / LARGURA)
    medir()
    const obs = new ResizeObserver(medir)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <Link
      href={src}
      className="group block rounded-xl border border-white/20 bg-black transition hover:border-white"
      aria-label={`Abrir ${titulo}`}
    >
      {/* Barra da janela: 3 pontos + endereço (só enfeite) */}
      <div className="flex items-center gap-2 border-b border-white/20 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-4 truncate font-mono text-xs text-white/50">
          conci.com.br{src === "/" ? "" : src}
        </span>
      </div>

      <div
        ref={caixa}
        className="relative overflow-hidden rounded-b-xl"
        style={{ aspectRatio: `${LARGURA} / ${ALTURA}` }}
      >
        <iframe
          src={src}
          title={`Prévia: ${titulo}`}
          loading="lazy"
          tabIndex={-1}
          className="pointer-events-none absolute left-0 top-0 origin-top-left grayscale transition duration-500 group-hover:grayscale-0"
          style={{ width: LARGURA, height: ALTURA, transform: `scale(${escala})` }}
        />
      </div>
    </Link>
  )
}
