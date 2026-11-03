import Image from "next/image"
import { PONTOS_ESCUROS, Rotulo } from "./estilo"

// ✏️ Seus dados. A foto fica em public/guifoto.jpg
const DADOS = [
  { rotulo: "Idade", valor: "29" },
  { rotulo: "Celular", valor: "+55 41 98401-9897", href: "tel:+5541984019897" },
  { rotulo: "Email", valor: "gui.conci@hotmail.com", href: "mailto:gui.conci@hotmail.com" },
  { rotulo: "Endereço", valor: "Curitiba-PR", href: "https://goo.gl/maps/4yacADQtLB8jz8zn9" },
]

// Seção "Sobre Mim": foto + dados
// 🎬 framer motion: troque <section> por <motion.section>
export function About() {
  return (
    <section id="sobre" className={`bg-white px-6 py-28 text-black md:py-40 ${PONTOS_ESCUROS}`}>
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2 md:gap-24">
        {/* Foto em preto e branco, com moldura deslocada */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-xl border border-black" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-300">
            <Image
              src="/guifoto.jpg"
              alt="Foto de Guilherme Luz Conci"
              fill
              sizes="(min-width: 768px) 384px, 100vw"
              className="object-cover grayscale transition duration-500 hover:grayscale-0"
            />
          </div>
        </div>

        <div>
          <Rotulo numero="02" texto="Sobre mim" />
          <h2 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
            Olá, meu nome é Guilherme.
          </h2>
          <p className="mt-8 max-w-md leading-relaxed text-black/60">
            Tenho projetos executados e gostaria que o próximo seja o seu.
          </p>

          <dl className="mt-14">
            {DADOS.map((d) => (
              <div key={d.rotulo} className="flex justify-between gap-4 border-b border-dotted border-black/40 py-4">
                <dt className="font-mono text-xs uppercase tracking-[0.2em] text-black/50">{d.rotulo}</dt>
                <dd className="text-right font-medium">
                  {d.href ? (
                    <a
                      href={d.href}
                      target={d.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {d.valor}
                    </a>
                  ) : (
                    d.valor
                  )}
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 py-4">
              <dt className="font-mono text-xs uppercase tracking-[0.2em] text-black/50">Disponível</dt>
              <dd className="flex items-center gap-3 font-medium">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-50" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-black" />
                </span>
                Sim
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
