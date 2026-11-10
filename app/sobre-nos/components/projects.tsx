import Link from "next/link"
import Image from "next/image"
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
              {["Next.js", "React", "Tailwind", "Prisma", "Mercado Pago", "Recharts"].map((t) => (
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

        {/* Painel de métricas do admin. Só abre logado como admin, por isso aqui vai como imagem (print) */}
        <div className="mt-24">
          <div className="group rounded-xl border border-white/20 bg-black transition hover:border-white">
            {/* Barra da janela: 3 pontos + endereço (só enfeite), igual às prévias acima */}
            <div className="flex items-center gap-2 border-b border-white/20 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="ml-4 truncate font-mono text-xs text-white/50">conci.com.br/admin/metricas</span>
            </div>
            <Image
              src="/sobre-nos/dashboard-metricas.png"
              alt="Painel de métricas da loja Conci: receita, pedidos pagos, ticket médio, gráfico de receita por dia e produtos mais vendidos"
              width={1913}
              height={946}
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="h-auto w-full rounded-b-xl grayscale transition duration-500 group-hover:grayscale-0"
            />
          </div>
          <h4 className={`mt-6 font-semibold ${TEXTO}`}>Dashboard de métricas (Recharts)</h4>
          <p className={`mt-1 max-w-3xl text-white/50 ${TEXTO}`}>
            Painel do administrador com o gráfico de barras feito em Recharts. Mede a receita, os pedidos pagos,
            o ticket médio e os clientes que compraram nos últimos 30 dias, mostra a receita de cada dia e lista os
            produtos mais vendidos.
          </p>
        </div>
      </div>
    </section>
  )
}
