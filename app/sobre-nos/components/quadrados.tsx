"use client" // reage ao mouse/dedo e mede o espaço da tela, então roda no navegador

import { useEffect, useRef, useState } from "react"

// Grade de quadradinhos no estilo do gráfico de contribuições do GitHub, em apenas 3 tons de cinza.
// - modo "fundo": preenche toda a área (usado atrás do nome, a partir de 1000px)
// - modo "faixa": faixa de ponta a ponta com altura fixa (usado no celular)
// Cada quadrado que o mouse (ou o dedo) passa acende num cinza mais claro e vai apagando devagar.
// É só decoração: os tons iniciais são sorteados, não são contribuições de verdade.

// ✏️ Tamanho de cada quadrado e espaço entre eles (em pixels)
const TAMANHO = { fundo: 24, faixa: 20 }
const ESPACO = 4
const LINHAS_FAIXA = 8 // altura da faixa do celular, em quadrados

// ✏️ Os 3 tons de cinza: escuro, médio e claro
const TONS = ["#161616", "#3d3d3d", "#c8c8c8"]
// Ao acender, o quadrado vai sempre para o cinza mais claro
const ACESOS = [TONS[2]]
// ✏️ Degradês brancos por cima dos quadrados (o último número de cada cor = quanto branco; 1 = branco puro).
// Tela grande, 2 camadas somadas:
// - da esquerda (junto do painel) pra direita: bem branco perto do painel, sumindo até a borda da tela
// - de baixo pra cima: branco puro embaixo, pra emendar suave com a seção branca seguinte
const DEGRADE = [
  "linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.75) 12%, rgba(255, 255, 255, 0.3) 28%, rgba(255, 255, 255, 0) 45%)",
  "linear-gradient(to right, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.8) 30%, rgba(255, 255, 255, 0.45) 65%, rgba(255, 255, 255, 0.12) 100%)",
].join(", ")
// ✏️ Modo núcleo (dentro das tecnologias): o retângulo todo no mesmo tom, com os quadrados bem apagados.
// 0.94 = quanto branco vai por cima (maior = mais apagado)
const DEGRADE_NUCLEO =
  "rgba(255, 255, 255, 0.94)" // quadrados bem fracos (antes 0.89)
// Celular (faixa embaixo do painel): o mesmo cinza bem fraco das tecnologias no computador
const DEGRADE_FAIXA = DEGRADE_NUCLEO
// Os quadrados que ficam inteiros por baixo de um elemento com data-texto são escondidos.
// Os da beirada ficam (o painel cobre só a parte deles), pra borda encostar nos quadrados.
const TEMPO_ACESO = 250 // ms que o quadrado fica aceso antes de começar a apagar

// ✏️ Pisca-pisca automático: a cada INTERVALO_PISCADA ms acende 1 quadrado a cada
// QUADRADOS_POR_PISCADA quadrados da grade (número menor = mais quadrados piscando)
const INTERVALO_PISCADA = 800 // 2x mais lento que antes
const QUADRADOS_POR_PISCADA = 200

// Tom inicial de cada quadrado, sempre o mesmo para a mesma posição.
// Mais quadrados apagados que fortes, como num perfil real.
// No fundo (atrás do texto) quase todos ficam escuros, pra o nome continuar fácil de ler.
function nivel(linha: number, coluna: number, fundo: boolean) {
  let t = (linha * 374761393 + coluna * 668265263) | 0
  t = Math.imul(t ^ (t >>> 13), 1274126177)
  const r = ((t ^ (t >>> 16)) >>> 0) / 4294967296
  if (fundo) return r < 0.8 ? 0 : r < 0.97 ? 1 : 2
  return r < 0.6 ? 0 : r < 0.88 ? 1 : 2
}

// soDireita: mostra quadrados só do lado direito, a partir da borda direita do painel (data-texto)
// nucleo: quadrados bem apagados, mais escuros no centro e quase brancos nas bordas (sem esconder nada)
export function Quadrados({
  modo,
  soDireita = false,
  nucleo = false,
  className = "",
}: {
  modo: "fundo" | "faixa"
  soDireita?: boolean
  nucleo?: boolean
  className?: string
}) {
  const caixa = useRef<HTMLDivElement>(null)
  const [grade, setGrade] = useState({ colunas: 0, linhas: 0 })
  const tamanho = TAMANHO[modo]
  const passo = tamanho + ESPACO

  // Mede o espaço e calcula quantos quadrados cobrem tudo (refaz quando a tela muda de tamanho)
  useEffect(() => {
    const el = caixa.current
    if (!el) return
    const medir = () => {
      if (!el.clientWidth) return // escondido nesta largura de tela
      // Modo núcleo: só quadrados inteiros (arredonda pra baixo). Outros modos: cobrem tudo (arredonda pra cima)
      const arredonda = nucleo ? Math.floor : Math.ceil
      const colunas = arredonda((el.clientWidth + ESPACO) / passo)
      const linhas = modo === "faixa" ? LINHAS_FAIXA : arredonda((el.clientHeight + ESPACO) / passo)
      setGrade((g) => (g.colunas === colunas && g.linhas === linhas ? g : { colunas, linhas }))
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    return () => observador.disconnect()
  }, [modo, passo, nucleo])

  // Esconde os quadrados que ficam por baixo dos textos (elementos com data-texto na mesma seção),
  // pra letra não ficar apagada. data-texto="caixa" usa a caixa inteira (botões, etiquetas);
  // sem valor, usa só as linhas de texto de verdade.
  useEffect(() => {
    const el = caixa.current
    const secao = el?.closest("section")
    // Núcleo e faixa não escondem nenhum quadrado (a faixa fica dentro do painel, entre o nome e as tecnologias)
    if (nucleo || modo === "faixa") return
    if (!el || !secao) return
    const esconder = () => {
      if (!el.clientWidth || !grade.linhas) return
      const base = el.getBoundingClientRect()
      const areas: DOMRect[] = []
      secao.querySelectorAll<HTMLElement>("[data-texto]").forEach((n) => {
        if (n.dataset.texto === "caixa") return void areas.push(n.getBoundingClientRect())
        // Mede só as letras (cada pedaço de texto), não a caixa do elemento, que pode ter a largura toda
        const textos = document.createTreeWalker(n, NodeFilter.SHOW_TEXT)
        const faixa = document.createRange()
        while (textos.nextNode()) {
          faixa.selectNodeContents(textos.currentNode)
          areas.push(...Array.from(faixa.getClientRects()).filter((a) => a.width > 0))
        }
      })
      // só à direita: some tudo que não passa da borda direita do painel (o da beirada fica, encostando nele)
      const bordaDireita = Math.max(...areas.map((a) => a.right))
      // O degradê branco começa exatamente na borda do painel
      if (soDireita && areas.length) {
        el.parentElement?.style.setProperty("--inicio-degrade", `${bordaDireita - base.left}px`)
      }
      Array.from(el.children).forEach((q, i) => {
        const x = base.left + Math.floor(i / grade.linhas) * passo
        const y = base.top + (i % grade.linhas) * passo
        const cobre = areas.some(
          (a) => x >= a.left && x + tamanho <= a.right && y >= a.top && y + tamanho <= a.bottom
        )
        const foraDoLado = soDireita && areas.length > 0 && x + tamanho <= bordaDireita
        q.toggleAttribute("data-oculto", cobre || foraDoLado)
      })
    }
    esconder()
    const observador = new ResizeObserver(esconder)
    observador.observe(secao)
    document.fonts?.ready.then(esconder) // a fonte carregando muda o tamanho do texto
    return () => observador.disconnect()
  }, [grade, passo, tamanho, soDireita, nucleo, modo])

  // Acende os quadrados por onde o ponteiro passa. Escuta a janela inteira, então funciona
  // mesmo com o nome e os botões por cima da grade.
  useEffect(() => {
    const el = caixa.current
    if (!el) return
    const timers = new Map<Element, number>()
    let ultimo: { x: number; y: number; t: number } | null = null

    const acenderEm = (x: number, y: number, r: DOMRect) => {
      // Descobre o quadrado pela posição (coluna e linha). Assim funciona por baixo do texto
      // e o espacinho entre os quadrados conta como parte do quadrado ao lado.
      const linhas = Number(el.dataset.linhas)
      const coluna = Math.floor((x - r.left) / passo)
      const linha = Math.floor((y - r.top) / passo)
      if (coluna < 0 || linha < 0 || linha >= linhas) return
      const alvo = el.children[coluna * linhas + linha] as HTMLElement | undefined
      if (alvo && !alvo.hasAttribute("data-oculto")) acender(alvo, TEMPO_ACESO)
    }

    // Acende um quadrado num cinza sorteado; depois do tempo, tira o "aceso" e o CSS apaga devagar
    const acender = (alvo: HTMLElement, tempo: number) => {
      alvo.style.setProperty("--aceso", ACESOS[Math.floor(Math.random() * ACESOS.length)])
      alvo.setAttribute("data-aceso", "")
      clearTimeout(timers.get(alvo))
      timers.set(
        alvo,
        window.setTimeout(() => {
          alvo.removeAttribute("data-aceso")
          timers.delete(alvo)
        }, tempo)
      )
    }

    // Pisca-pisca sozinho: a cada instante acende alguns quadrados sorteados pela grade toda.
    // Quem pediu ao computador para reduzir animações não vê o pisca-pisca (o mouse continua funcionando).
    const semAnimacao = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const piscaPisca = window.setInterval(() => {
      const total = el.children.length
      if (semAnimacao || !total || !el.clientWidth) return
      const quantos = Math.max(1, Math.round(total / QUADRADOS_POR_PISCADA))
      for (let i = 0; i < quantos; i++) {
        const alvo = el.children[Math.floor(Math.random() * total)] as HTMLElement
        if (!alvo.hasAttribute("data-aceso") && !alvo.hasAttribute("data-oculto")) acender(alvo, 1600 + Math.random() * 5600)
      }
    }, INTERVALO_PISCADA)

    const mover = (e: PointerEvent) => {
      if (!el.clientWidth) return // grade escondida nesta largura de tela
      const r = el.getBoundingClientRect()
      const dentro = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
      if (!dentro) {
        ultimo = null
        return
      }
      // Acende também os quadrados no caminho desde o último ponto (mouse rápido não pula nenhum)
      const antes = ultimo && e.timeStamp - ultimo.t < 100 ? ultimo : { x: e.clientX, y: e.clientY }
      const dx = e.clientX - antes.x
      const dy = e.clientY - antes.y
      const passos = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (tamanho / 2)))
      for (let i = 1; i <= passos; i++) acenderEm(antes.x + (dx * i) / passos, antes.y + (dy * i) / passos, r)
      ultimo = { x: e.clientX, y: e.clientY, t: e.timeStamp }
    }

    window.addEventListener("pointermove", mover, { passive: true })
    window.addEventListener("pointerdown", mover, { passive: true })
    return () => {
      window.removeEventListener("pointermove", mover)
      window.removeEventListener("pointerdown", mover)
      clearInterval(piscaPisca)
      timers.forEach((id) => clearTimeout(id))
    }
  }, [tamanho, passo])

  return (
    <div className={`overflow-hidden ${modo === "faixa" ? "relative" : ""} ${className}`}>
      <div
        ref={caixa}
        data-linhas={grade.linhas}
        className={`grid touch-pan-y ${modo === "fundo" ? "h-full w-full" : "w-full"}`}
        style={{
          gap: ESPACO,
          gridTemplateColumns: `repeat(${grade.colunas}, ${tamanho}px)`,
          gridTemplateRows: `repeat(${grade.linhas}, ${tamanho}px)`,
          gridAutoFlow: "column", // preenche de cima pra baixo, coluna por coluna (igual ao GitHub)
          height: modo === "faixa" ? LINHAS_FAIXA * passo - ESPACO : undefined,
        }}
      >
        {Array.from({ length: grade.colunas * grade.linhas }, (_, i) => {
          const coluna = Math.floor(i / grade.linhas)
          const linha = i % grade.linhas
          return (
            <span
              key={`${coluna}-${linha}`}
              className="rounded-[3px] transition-[background-color,box-shadow] duration-[1400ms] ease-out data-[aceso]:bg-[var(--aceso)]! data-[aceso]:shadow-[0_0_12px_var(--aceso)] data-[aceso]:duration-0 data-[oculto]:invisible"
              style={{ backgroundColor: TONS[nivel(linha, coluna, modo === "fundo")] }}
            />
          )
        })}
      </div>

      {/* Degradê branco por cima dos quadrados: quase branco junto do painel, sumindo até a borda direita.
          pointer-events-none: o mouse continua acendendo os quadrados por baixo */}
      {/* Modo núcleo: centro um pouco mais escuro, bordas quase brancas; tudo bem apagado */}
      {nucleo && (
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: DEGRADE_NUCLEO }} />
      )}

      {soDireita && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0"
          style={{ left: "var(--inicio-degrade, 100%)", background: DEGRADE }}
        />
      )}

      {/* Faixa do celular: o mesmo cinza bem fraco das tecnologias no computador */}
      {modo === "faixa" && (
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: DEGRADE_FAIXA }} />
      )}
    </div>
  )
}
