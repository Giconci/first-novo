import type { Metadata } from "next"
import Link from "next/link"
import { InfoPage } from "@/components/InfoPage"

export const metadata: Metadata = {
  title: "Dúvidas frequentes | Conci",
  description: "Pagamento, entrega, tamanhos e trocas.",
}

// ✏️ Respostas de exemplo. Prazos e valores precisam ser os reais.
const PERGUNTAS = [
  {
    p: "Quais são as formas de pagamento?",
    r: "Pix, cartão de crédito (em até 12x) e boleto, todos pelo Mercado Pago. Nós não vemos nem guardamos os dados do seu cartão.",
  },
  {
    p: "Em quanto tempo meu pedido chega?",
    r: "Enviamos em até 2 dias úteis depois da confirmação do pagamento. Pelos Correios, a entrega leva de 3 a 10 dias úteis, conforme a região.",
  },
  {
    p: "Como acompanho meu pedido?",
    r: "Em \"Meus pedidos\", no menu do site, você vê o status de cada compra: aguardando pagamento, pago ou enviado.",
  },
  {
    p: "Paguei com Pix e o pedido ainda está \"aguardando pagamento\". E agora?",
    r: "A confirmação costuma levar poucos segundos. Atualize a página de \"Meus pedidos\". Se depois de 1 hora não mudar, fale com a gente.",
  },
  {
    p: "Como escolho o tamanho da camiseta?",
    r: "Compare com uma camiseta que você já tem: meça a largura do peito (de axila a axila) e o comprimento. As medidas estão na descrição de cada produto.",
  },
  {
    p: "Os bonés têm ajuste?",
    r: "Sim, todos têm regulagem atrás e servem na maioria das cabeças (de 54 a 60 cm).",
  },
  {
    p: "Posso trocar se não servir?",
    r: "Pode, em até 30 dias, e a primeira troca é grátis. Veja o passo a passo em Trocas e devoluções.",
    link: { href: "/trocas", texto: "Ver trocas e devoluções" },
  },
  {
    p: "Por que preciso de um código no email para entrar?",
    r: "É uma camada a mais de segurança: mesmo que alguém descubra sua senha, não consegue entrar sem acesso ao seu email.",
  },
]

export default function DuvidasPage() {
  return (
    <InfoPage title="Dúvidas frequentes" subtitle="As perguntas que mais recebemos.">
      {/* <details> abre e fecha sozinho, sem JavaScript */}
      <div className="divide-y rounded-lg border bg-white">
        {PERGUNTAS.map((item) => (
          <details key={item.p} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-petroleo">
              {item.p}
              <span className="text-xl transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3">{item.r}</p>
            {item.link && (
              <Link href={item.link.href} className="mt-2 inline-block underline text-petroleo">
                {item.link.texto}
              </Link>
            )}
          </details>
        ))}
      </div>

      <p className="text-center">
        Não achou o que procurava?{" "}
        <Link href="/contato" className="underline text-petroleo">Fale com a gente</Link>.
      </p>
    </InfoPage>
  )
}
