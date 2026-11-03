import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { PaginaPreview } from "./pagina-preview"
import { CINZA_HOVER, PONTOS_CLAROS, Rotulo, TEXTO } from "./estilo"

// ✏️ Telas da loja mostradas ao vivo logo abaixo da home.
// Para mostrar outra página, é só adicionar o endereço dela aqui (ex.: "/produtos").
const TELAS_DA_LOJA = [
  { src: "/login", titulo: "Login", descricao: "Entrada com email e código de verificação." },
  { src: "/cadastro", titulo: "Cadastro", descricao: "Criação de conta com validação dos campos." },
]

// 🎬 framer motion: troque <section> por <motion.section>
export function Projects() {
  return (
    <section id="projetos" className={`relative bg-black px-6 py-28 text-white md:py-40 ${PONTOS_CLAROS}`}>
      <div className="mx-auto max-w-6xl">
        <Rotulo numero="03" texto="Projetos & Portfólio" destaque />
        <h2 className="mt-6 max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
          Coisas que eu construí.
        </h2>

        {/* Destaque: a home da loja, ao vivo */}
        <div className="mt-20 grid items-center gap-12 md:grid-cols-5 md:gap-16">
          <div className="md:col-span-3">
            <PaginaPreview src="/" titulo="Home da loja Conci" />
          </div>
          <div className="md:col-span-2">
            <p className={`font-mono uppercase tracking-[0.3em] text-white/50 ${TEXTO}`}>Projeto principal</p>
            <h3 className="mt-4 text-3xl font-bold">Conci, loja online</h3>
            <p className={`mt-6 leading-relaxed text-white/60 ${TEXTO}`}>
              E-commerce completo de bonés, camisetas e tênis: catálogo, carrinho, login, pagamento por
              Pix e cartão, controle de estoque e painel de administração.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {["Next.js", "React", "Tailwind", "Prisma", "Mercado Pago"].map((t) => (
                <li
                  key={t}
                  className="cursor-default rounded-full border border-white/30 px-5 py-2 font-mono text-[17px] transition hover:border-(--cinza-hover) hover:bg-(--cinza-hover) hover:text-black"
                  style={{ "--cinza-hover": CINZA_HOVER } as React.CSSProperties}
                >
                  {t}
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className={`mt-10 inline-flex items-center gap-2 border-b border-white pb-1 font-semibold transition-all hover:gap-3 ${TEXTO}`}
            >
              Visitar a loja <ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Outras telas da loja, também ao vivo */}
        <div className="mt-24 grid gap-12 md:grid-cols-2">
          {TELAS_DA_LOJA.map((tela) => (
            <div key={tela.src}>
              <PaginaPreview src={tela.src} titulo={tela.titulo} />
              <h4 className={`mt-6 font-semibold ${TEXTO}`}>{tela.titulo}</h4>
              <p className={`mt-1 text-white/50 ${TEXTO}`}>{tela.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
