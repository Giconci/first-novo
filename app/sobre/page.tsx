import type { Metadata } from "next"
import Link from "next/link"
import { InfoPage, InfoSection } from "@/components/InfoPage"

export const metadata: Metadata = {
  title: "Nossa história | Conci",
  description: "Como a Conci nasceu em Curitiba e o que acreditamos.",
}

// ✏️ Texto de exemplo (inventado). Troque pela história real da loja.
const MARCOS = [
  { ano: "2019", texto: "Os primeiros 50 bonés, bordados à mão numa garagem no bairro Água Verde." },
  { ano: "2021", texto: "Chegam as camisetas, com algodão de fornecedores do Paraná e de Santa Catarina." },
  { ano: "2023", texto: "Mais de 3 mil clientes e o primeiro espaço próprio, no centro de Curitiba." },
  { ano: "2026", texto: "Loja online nova, com pagamento por Pix e cartão e entrega para todo o Brasil." },
]

const VALORES = [
  { titulo: "Feito pra durar", texto: "Tecido grosso, costura reforçada. Peça boa é a que você usa por anos." },
  { titulo: "Produção local", texto: "Trabalhamos com oficinas de Curitiba e região, que conhecemos pelo nome." },
  { titulo: "Preço justo", texto: "Sem intermediários: da oficina direto para você." },
]

export default function SobrePage() {
  return (
    <InfoPage
      title="Nossa história"
      subtitle="De uma garagem em Curitiba para todo o Brasil."
    >
      <InfoSection title="Como tudo começou">
        <p>
          A Conci nasceu em 2019, quando a gente não encontrava um boné simples, bem feito e com
          preço honesto. Então resolvemos fazer o nosso. Os primeiros saíram de uma máquina de
          bordar emprestada, e os amigos foram os primeiros clientes.
        </p>
        <p>
          Hoje fazemos bonés e camisetas com o mesmo cuidado do começo: poucos modelos,
          materiais escolhidos a dedo e atenção em cada pedido.
        </p>
      </InfoSection>

      <InfoSection title="Nossa trajetória">
        <ol className="border-l-2 border-petroleo-claro/40 pl-6 space-y-6">
          {MARCOS.map((m) => (
            <li key={m.ano} className="relative">
              <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full bg-petroleo-claro" />
              <p className="font-bold text-petroleo">{m.ano}</p>
              <p>{m.texto}</p>
            </li>
          ))}
        </ol>
      </InfoSection>

      <InfoSection title="No que acreditamos">
        <div className="grid sm:grid-cols-3 gap-4">
          {VALORES.map((v) => (
            <div key={v.titulo} className="rounded-lg bg-gray-50 p-5">
              <p className="font-semibold text-petroleo">{v.titulo}</p>
              <p className="text-sm mt-1">{v.texto}</p>
            </div>
          ))}
        </div>
      </InfoSection>

      <div className="text-center">
        <Link
          href="/produtos"
          className="inline-block rounded-md bg-petroleo px-6 py-3 text-white hover:bg-petroleo-escuro"
        >
          Conheça os produtos
        </Link>
      </div>
    </InfoPage>
  )
}
