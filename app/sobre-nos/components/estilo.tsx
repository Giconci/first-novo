// Estilo compartilhado da página Sobre Nós (preto e branco com pontos)

// Fundo de pontinhos: claros para seção preta, escuros para seção branca
export const PONTOS_CLAROS =
  "[background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:24px_24px]"
export const PONTOS_ESCUROS =
  "[background-image:radial-gradient(rgba(0,0,0,0.12)_1px,transparent_1px)] [background-size:24px_24px]"

// ✏️ Amarelo queimado dos títulos de destaque ("01 — Olá, me chamo", "02 — Sobre mim"...) e do nome
export const AMARELO = "#c49a3c"

// ✏️ Fundo dos botões de tecnologias quando o mouse passa por cima (topo e "03 — Projetos")
export const CINZA_HOVER = "#e5e5e5"

// ✏️ Tamanho padrão de todo o texto do portfólio (o mesmo da primeira parte): 19px no celular, 22px no computador
export const TEXTO = "text-[19px] md:text-[22px]"

// Título de destaque: maior e mais forte que o rótulo comum
export const TITULO_DESTAQUE = "font-mono text-[19px] font-bold uppercase tracking-[0.3em] md:text-[22px]"

// Rótulo pequeno no topo de cada seção: "● 01 — Sobre"
// destaque: maior, em amarelo queimado (usado no topo de todas as seções)
export function Rotulo({ numero, texto, destaque = false }: { numero: string; texto: string; destaque?: boolean }) {
  if (destaque) {
    return (
      <p className="flex items-center gap-3" style={{ color: AMARELO }}>
        <span className="h-2.5 w-2.5 rounded-full bg-current" />
        <span className={TITULO_DESTAQUE}>
          {numero} — {texto}
        </span>
      </p>
    )
  }
  return (
    <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] opacity-60">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {numero} — {texto}
    </p>
  )
}
