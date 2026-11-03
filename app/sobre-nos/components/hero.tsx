import { PONTOS_CLAROS, Rotulo } from "./estilo"

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

// Topo da página: nome, cargo e botões.
// ✏️ O CV fica em public/sobre-nos/EED.pdf
// 🎬 framer motion: troque <section> por <motion.section>
export function Hero() {
  return (
    <section className={`relative flex min-h-screen flex-col bg-black px-6 text-white ${PONTOS_CLAROS}`}>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center py-28">
        <Rotulo numero="01" texto="Olá, me chamo" />

        <h1 className="mt-10 text-6xl font-bold leading-[0.95] tracking-tight md:text-8xl lg:text-9xl">
          Guilherme
          <br />
          <span className="text-transparent [-webkit-text-stroke:1px_white]">Luz Conci</span>
        </h1>

        <div className="mt-14 flex items-center gap-4">
          <span className="h-px w-16 bg-white" />
          <h2 className="font-mono text-sm uppercase tracking-[0.2em]">Desenvolvedor Next.js Front-end</h2>
        </div>

        <p className="mt-8 max-w-md leading-relaxed text-white/60">
          Sou um desenvolvedor front-end que ama criar coisas para a web: sites e aplicações web.
        </p>

        <div className="mt-14 flex flex-wrap items-center gap-4">
          <a href="#contato" className="rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:bg-white/80">
            Fale comigo
          </a>
          <a
            href="/sobre-nos/EED.pdf"
            download="EED.pdf"
            target="_blank"
            className="rounded-full border border-white px-8 py-4 font-semibold transition hover:bg-white hover:text-black"
          >
            Baixe meu CV
          </a>
        </div>

        {/* Tecnologias do e-commerce, em 3 grupos */}
        <div className="mt-24 border-t border-dotted border-white/30 pt-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
            Tecnologias principais do e-commerce Conci
          </p>
          <div className="mt-8 grid gap-10 md:grid-cols-3">
            {TECNOLOGIAS.map((t) => (
              <div key={t.grupo}>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  {t.grupo}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {t.itens.map((item) => (
                    <li key={item} className="rounded-full border border-white/30 px-3 py-1 font-mono text-xs text-white/80">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
