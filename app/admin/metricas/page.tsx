import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getMetrics } from "@/lib/metrics";
import { RevenueChart } from "@/components/RevenueChart";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// /admin/metricas → painel de vendas.
// Página de servidor: confere o admin e lê o banco antes de mandar o HTML,
// então os números nunca chegam ao navegador de quem não é admin.
export default async function MetricasPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/admin/metricas");
  if (user.role !== "admin") redirect("/");

  const m = await getMetrics();

  const cards = [
    { titulo: "Receita", valor: brl(m.receita) },
    { titulo: "Pedidos pagos", valor: String(m.pedidos) },
    { titulo: "Ticket médio", valor: brl(m.ticketMedio) },
    { titulo: "Clientes que compraram", valor: String(m.clientes) },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Métricas</h1>
          <p className="text-sm text-gray-500">Últimos {m.dias} dias · pedidos pagos ou enviados</p>
        </div>
        <Link href="/admin" className="underline">← Produtos</Link>
      </div>

      {/* Números principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.titulo} className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">{c.titulo}</p>
            <p className="text-2xl font-bold text-petroleo mt-1">{c.valor}</p>
          </div>
        ))}
      </div>

      {m.pendentes > 0 && (
        <p className="text-sm text-gray-600">
          ⏳ {m.pendentes} pedido(s) aguardando pagamento (não entram na receita).{" "}
          <Link href="/admin/pedidos" className="underline">Ver pedidos</Link>
        </p>
      )}

      {/* Gráfico de receita por dia */}
      <section className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold mb-4">Receita por dia</h2>
        <RevenueChart data={m.receitaPorDia} />
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-gray-500">Ver em tabela</summary>
          <table className="mt-2 w-full">
            <tbody>
              {m.receitaPorDia.filter((d) => d.valor > 0).map((d) => (
                <tr key={d.dia} className="border-t">
                  <td className="py-1">{d.dia.split("-").reverse().join("/")}</td>
                  <td className="py-1 text-right">{brl(d.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>

      {/* Ranking de produtos */}
      <section className="rounded-lg border bg-white p-4">
        <h2 className="font-semibold mb-4">Mais vendidos</h2>
        {m.maisVendidos.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma venda no período.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="pb-2 font-normal">Produto</th>
                <th className="pb-2 font-normal text-right">Unidades</th>
                <th className="pb-2 font-normal text-right">Receita</th>
              </tr>
            </thead>
            <tbody>
              {m.maisVendidos.map((p) => (
                <tr key={p.nome} className="border-t">
                  <td className="py-2">{p.nome}</td>
                  <td className="py-2 text-right">{p.quantidade}</td>
                  <td className="py-2 text-right">{brl(p.receita)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
