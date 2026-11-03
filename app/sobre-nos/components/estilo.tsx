// Estilo compartilhado da página Sobre Nós (preto e branco com pontos)

// Fundo de pontinhos: claros para seção preta, escuros para seção branca
export const PONTOS_CLAROS =
  "[background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:24px_24px]"
export const PONTOS_ESCUROS =
  "[background-image:radial-gradient(rgba(0,0,0,0.12)_1px,transparent_1px)] [background-size:24px_24px]"

// Rótulo pequeno no topo de cada seção: "● 01 — Sobre"
export function Rotulo({ numero, texto }: { numero: string; texto: string }) {
  return (
    <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] opacity-60">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {numero} — {texto}
    </p>
  )
}
