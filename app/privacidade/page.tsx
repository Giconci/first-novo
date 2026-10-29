import type { Metadata } from "next"
import Link from "next/link"
import { InfoPage, InfoSection } from "@/components/InfoPage"
import { ReopenCookieBanner } from "@/components/CookieBanner"

export const metadata: Metadata = {
  title: "Privacidade e cookies | Conci",
  description: "Quais dados a Conci coleta, para quê, e quais cookies o site usa.",
}

// ✏️ Revise com quem cuida da parte jurídica da loja antes de vender de verdade.

// Tudo o que o site grava no navegador hoje
const COOKIES = [
  { nome: "next-auth.session-token (no site no ar: __Secure-next-auth.session-token)", tipo: "Essencial", para: "Manter você logado (dura até 30 dias ou até clicar em Sair)." },
  { nome: "next-auth.csrf-token", tipo: "Essencial", para: "Proteger o login contra ataques de outros sites." },
  { nome: "next-auth.callback-url", tipo: "Essencial", para: "Voltar para a página certa depois do login." },
  { nome: "Carrinho (armazenamento local)", tipo: "Essencial", para: "Guardar os produtos do carrinho no seu navegador." },
  { nome: "conci_consent", tipo: "Essencial", para: "Lembrar a sua escolha neste aviso (dura 1 ano)." },
]

// Empresas que recebem algum dado para a loja funcionar
const PARCEIROS = [
  { nome: "Mercado Pago", para: "processar o pagamento. Os dados do cartão vão direto para eles, nunca passam pela Conci." },
  { nome: "Google (Gmail)", para: "enviar o código de acesso para o seu email." },
  { nome: "Vercel e Neon", para: "hospedar o site e guardar o banco de dados." },
  { nome: "ViaCEP", para: "preencher o endereço a partir do CEP (só o CEP é enviado)." },
  { nome: "Sentry", para: "avisar a Conci quando algo dá erro no site (página, navegador e horário do erro). Não usa cookies." },
]

export default function PrivacidadePage() {
  return (
    <InfoPage
      title="Privacidade e cookies"
      subtitle="O que coletamos, para quê, e como você controla seus dados."
    >
      <InfoSection title="Dados que coletamos">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Cadastro:</strong> nome, email e senha (guardada embaralhada, nem nós conseguimos ler).</li>
          <li><strong>Pedidos:</strong> produtos, valores, endereço de entrega e telefone.</li>
        </ul>
        <p>Usamos esses dados só para entregar seus pedidos e falar com você sobre eles. Não vendemos dados para ninguém.</p>
      </InfoSection>

      <InfoSection title="Cookies">
        <p>
          Hoje o site usa <strong>apenas cookies essenciais</strong>, sem os quais o login e o
          carrinho não funcionam. Não usamos cookies de anúncios. Se um dia usarmos cookies de
          medição (para saber quais páginas são mais visitadas), eles só serão ativados para
          quem escolher &quot;Aceitar todos&quot;.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="pb-2 pr-4 font-normal">Nome</th>
                <th className="pb-2 pr-4 font-normal">Tipo</th>
                <th className="pb-2 font-normal">Para quê</th>
              </tr>
            </thead>
            <tbody>
              {COOKIES.map((c) => (
                <tr key={c.nome} className="border-t align-top">
                  <td className="py-2 pr-4 font-mono text-xs break-all">{c.nome}</td>
                  <td className="py-2 pr-4">{c.tipo}</td>
                  <td className="py-2">{c.para}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p><ReopenCookieBanner /></p>
      </InfoSection>

      <InfoSection title="Quem mais recebe dados">
        <ul className="list-disc pl-5 space-y-1">
          {PARCEIROS.map((p) => (
            <li key={p.nome}><strong>{p.nome}:</strong> {p.para}</li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection title="Seus direitos (LGPD)">
        <p>
          Pela Lei Geral de Proteção de Dados, você pode pedir para ver, corrigir ou apagar seus
          dados a qualquer momento. É só falar com a gente pelo{" "}
          <Link href="/contato" className="underline text-petroleo">contato</Link>. Dados de
          pedidos podem ser mantidos pelo prazo exigido pela lei fiscal.
        </p>
      </InfoSection>
    </InfoPage>
  )
}
