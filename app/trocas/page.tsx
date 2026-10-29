import type { Metadata } from "next"
import Link from "next/link"
import { InfoPage, InfoSection } from "@/components/InfoPage"

export const metadata: Metadata = {
  title: "Trocas e devoluções | Conci",
  description: "Como trocar ou devolver um produto comprado na Conci.",
}

// ✏️ Política de exemplo. Revise prazos e regras antes de vender de verdade.
const PASSOS = [
  "Entre em contato em até 30 dias depois de receber o pedido, informando o número do pedido.",
  "Enviamos um código de postagem dos Correios. A primeira troca é por nossa conta.",
  "Embale o produto sem uso, com a etiqueta, e poste na agência mais próxima.",
  "Assim que o produto chegar, mandamos o novo tamanho ou devolvemos o dinheiro.",
]

export default function TrocasPage() {
  return (
    <InfoPage title="Trocas e devoluções" subtitle="Não serviu ou não gostou? A primeira troca é grátis.">
      <InfoSection title="Como funciona">
        <ol className="space-y-4">
          {PASSOS.map((passo, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-petroleo text-white font-bold">
                {i + 1}
              </span>
              <p className="pt-1">{passo}</p>
            </li>
          ))}
        </ol>
      </InfoSection>

      <InfoSection title="Direito de arrependimento">
        <p>
          Pelo Código de Defesa do Consumidor (art. 49), você pode desistir da compra em até
          <strong> 7 dias</strong> depois de receber, sem precisar explicar o motivo. Devolvemos o
          valor total, incluindo o frete.
        </p>
      </InfoSection>

      <InfoSection title="Como recebo o dinheiro de volta">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Pix:</strong> na mesma conta que pagou, em até 3 dias úteis.</li>
          <li><strong>Cartão:</strong> estorno pelo Mercado Pago. Aparece em 1 ou 2 faturas, conforme o banco.</li>
          <li><strong>Boleto:</strong> por Pix ou transferência para a conta que você informar.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Produto com defeito">
        <p>
          Se chegou com defeito, a troca é sempre por nossa conta, em até 90 dias. Mande uma foto pelo{" "}
          <Link href="/contato" className="underline text-petroleo">contato</Link> que resolvemos rápido.
        </p>
      </InfoSection>
    </InfoPage>
  )
}
