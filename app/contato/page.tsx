import type { Metadata } from "next"
import Link from "next/link"
import { EnvelopeIcon, ChatBubbleLeftRightIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline"
import { InfoPage, InfoSection } from "@/components/InfoPage"

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Conci por email ou WhatsApp.",
}

// ✏️ WhatsApp, endereço e horário são de exemplo. Troque pelos reais.
const CANAIS = [
  {
    icon: EnvelopeIcon,
    titulo: "Email",
    texto: "conciluzcwb@gmail.com",
    href: "mailto:conciluzcwb@gmail.com",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    titulo: "WhatsApp",
    texto: "(41) 90000-0000",
    href: "https://wa.me/5541900000000",
  },
  {
    icon: MapPinIcon,
    titulo: "Endereço",
    texto: "Curitiba, PR (atendimento só online por enquanto)",
  },
  {
    icon: ClockIcon,
    titulo: "Horário",
    texto: "Segunda a sexta, das 9h às 18h",
  },
]

export default function ContatoPage() {
  return (
    <InfoPage title="Fale com a gente" subtitle="Dúvida sobre pedido, tamanho ou troca? Respondemos em até 1 dia útil.">
      <div className="grid sm:grid-cols-2 gap-4">
        {CANAIS.map((c) => {
          const conteudo = (
            <>
              <c.icon className="h-7 w-7 text-petroleo-claro" />
              <p className="font-semibold text-petroleo mt-3">{c.titulo}</p>
              <p className="text-sm">{c.texto}</p>
            </>
          )
          return c.href ? (
            <a
              key={c.titulo}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="rounded-lg bg-gray-50 p-5 hover:bg-gray-100 transition"
            >
              {conteudo}
            </a>
          ) : (
            <div key={c.titulo} className="rounded-lg bg-gray-50 p-5">
              {conteudo}
            </div>
          )
        })}
      </div>

      <InfoSection title="Antes de escrever">
        <p>
          Muita coisa já está respondida em <Link href="/duvidas" className="underline text-petroleo">Dúvidas frequentes</Link> e
          em <Link href="/trocas" className="underline text-petroleo">Trocas e devoluções</Link>. Se for sobre um pedido,
          mande o <strong>número do pedido</strong> (está em "Meus pedidos") que agiliza bastante.
        </p>
      </InfoSection>
    </InfoPage>
  )
}
