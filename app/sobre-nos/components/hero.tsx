import { AMARELO, CINZA_HOVER, Rotulo } from "./estilo"

// ✏️ Tecnologias usadas no e-commerce Conci (este site)
const TECNOLOGIAS = [
  {
    grupo: "Front-end",
    itens: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "shadcn/ui"],
  },
  {
    grupo: "Back-end e dados",
    itens: ["Prisma", "PostgreSQL (Neon)", "NextAuth", "Zod", "React Hook Form"],
  },
  {
    grupo: "Pagamento e serviços",
    itens: ["Mercado Pago (Pix e cartão)", "Vercel", "Vercel Blob", "Sentry", "Nodemailer", "ViaCEP", "Recharts"],
  },
]

// ✏️ Fundo do painel: branco
const COR_PAINEL = "#ffffff"

// Topo da página: nome, cargo, botões e tecnologias, dentro de um painel fechado.
// ✏️ O CV fica em public/sobre-nos/cvguilherme.pdf
// 🎬 framer motion: troque <section> por <motion.section>
export function Hero() {
  return (
    // --amarelo: a cor fica numa variável; texto, bordas e botões desta seção usam ela
    <section
      className="relative flex min-h-screen flex-col overflow-hidden bg-(--painel) text-(--amarelo)"
      style={{ "--amarelo": AMARELO, "--cinza-hover": CINZA_HOVER, "--painel": COR_PAINEL } as React.CSSProperties}
    >
      {/* Fundo todo branco (bg-(--painel) na seção), sem margens pretas no celular */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center pt-20 min-[1000px]:pt-0">
        {/* Painel fechado do "01 — Olá, me chamo" até as tecnologias.
            data-texto="caixa": os quadrados não aparecem por baixo dele (ver quadrados.tsx) */}
        {/* A partir de 1000px: o painel ocupa a altura toda da seção (sem faixa preta em cima e embaixo)
            e o "before" pinta de branco também tudo à esquerda dele, até a borda da tela */}
        <div
          data-texto="caixa"
          className="relative px-6 py-10 md:px-14 md:py-14 min-[1000px]:flex min-[1000px]:flex-1 min-[1000px]:flex-col min-[1000px]:justify-center min-[1000px]:py-24 min-[1000px]:before:absolute min-[1000px]:before:inset-y-0 min-[1000px]:before:right-full min-[1000px]:before:w-screen min-[1000px]:before:bg-(--painel)"
          style={{ backgroundColor: COR_PAINEL }}
        >
          <Rotulo numero="01" texto="Olá, me chamo" destaque />

          <h1 className="mt-10 text-6xl font-bold leading-[0.95] tracking-tight md:text-8xl lg:text-9xl">
            Guilherme
            <br />
            <span className="text-transparent [-webkit-text-stroke:1.5px_var(--amarelo)]">Luz Conci</span>
          </h1>

          {/* Daqui pra baixo: texto em preto e maior (o nome e o "01" continuam em amarelo) */}
          <div className="text-black">
            <div className="mt-14 flex items-center gap-4">
              <span className="h-0.5 w-16 bg-current" />
              <h2 className="font-mono text-[19px] font-bold uppercase tracking-[0.2em] md:text-[22px]">
                Desenvolvedor Next.js Front-end
              </h2>
            </div>

            <p className="mt-8 max-w-xl text-[19px] leading-relaxed md:text-[22px]">
              Sou um desenvolvedor front-end que ama criar coisas para a web: sites e aplicações web.
            </p>

            <div className="mt-14 flex flex-wrap items-center gap-4">
              <a
                href="#contato"
                className="rounded-full bg-black px-9 py-4 text-[19px] font-semibold md:text-[22px] text-(--painel) transition hover:opacity-80"
              >
                Fale comigo
              </a>
              <a
                href="/sobre-nos/cvguilherme.pdf"
                download="cvguilherme.pdf"
                target="_blank"
                className="rounded-full border-2 border-current px-9 py-4 text-[19px] font-semibold md:text-[22px] transition hover:bg-black hover:text-(--painel)"
              >
                Baixe meu CV
              </a>
            </div>

            {/* Linha fina entre o nome e as tecnologias: sai da borda esquerda da tela e vai até 70% dela
                (ml-[calc(50%-50vw)]: começa na borda da tela, fora do painel; ✏️ w-[70vw] = 70% da largura) */}
            <div aria-hidden className="relative mt-16 ml-[calc(50%-50vw)] h-px w-[70vw] bg-black" />

            {/* Tecnologias do e-commerce, em 3 grupos */}
            <div className="mt-16">
              <p className="font-mono text-[19px] font-bold uppercase tracking-[0.3em] md:text-[22px]">Tecnologias principais do e-commerce Conci</p>
              <div className="mt-10 grid gap-12 md:grid-cols-3">
                {TECNOLOGIAS.map((t) => (
                  <div key={t.grupo}>
                    <p className="inline-flex cursor-default items-center gap-2.5 rounded-full border border-black bg-white px-5 py-2 text-[19px] font-bold text-black transition hover:bg-(--cinza-hover) md:text-[22px]">
                      <span className="h-2.5 w-2.5 rounded-full bg-current" />
                      {t.grupo}
                    </p>
                    {/* Um item embaixo do outro (items-start: cada etiqueta com a largura do próprio texto) */}
                    <ul className="mt-5 flex flex-col items-start gap-2.5">
                      {t.itens.map((item) => (
                        <li key={item} className="cursor-default rounded-full border border-black bg-white px-5 py-2 font-mono text-[17px] text-black transition hover:bg-(--cinza-hover)">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
