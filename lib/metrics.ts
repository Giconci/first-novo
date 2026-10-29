import { prisma } from "@/lib/prisma";

// Pedidos que contam como venda (o dinheiro entrou)
const VENDIDO = ["paid", "shipped"];
const DIAS = 30;

// Data no horário de Brasília, no formato "2026-10-29" (serve de chave do dia)
const diaBR = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

// Métricas do painel /admin/metricas, calculadas a partir dos pedidos.
// Não precisa de tabela nova: tudo sai de Order e OrderItem.
export async function getMetrics() {
  const desde = new Date(Date.now() - DIAS * 24 * 60 * 60 * 1000);

  const [vendas, pendentes] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: VENDIDO }, createdAt: { gte: desde } },
      select: {
        total: true,
        createdAt: true,
        userId: true,
        products: { select: { quantity: true, unitPrice: true, product: { select: { name: true } } } },
      },
    }),
    prisma.order.count({ where: { status: "pending", createdAt: { gte: desde } } }),
  ]);

  const receita = vendas.reduce((soma, o) => soma + o.total, 0);

  // Receita de cada um dos últimos 30 dias (dia sem venda = 0, para o gráfico não pular dias)
  const porDia = new Map<string, number>();
  for (let i = DIAS - 1; i >= 0; i--) {
    porDia.set(diaBR(new Date(Date.now() - i * 24 * 60 * 60 * 1000)), 0);
  }
  for (const o of vendas) {
    const dia = diaBR(o.createdAt);
    if (porDia.has(dia)) porDia.set(dia, porDia.get(dia)! + o.total);
  }

  // Produtos mais vendidos (por quantidade)
  const porProduto = new Map<string, { quantidade: number; receita: number }>();
  for (const o of vendas) {
    for (const item of o.products) {
      const atual = porProduto.get(item.product.name) ?? { quantidade: 0, receita: 0 };
      atual.quantidade += item.quantity;
      atual.receita += item.quantity * item.unitPrice;
      porProduto.set(item.product.name, atual);
    }
  }

  return {
    dias: DIAS,
    receita,
    pedidos: vendas.length,
    ticketMedio: vendas.length ? receita / vendas.length : 0,
    clientes: new Set(vendas.map((o) => o.userId)).size,
    pendentes,
    receitaPorDia: [...porDia].map(([dia, valor]) => ({ dia, valor })),
    maisVendidos: [...porProduto]
      .map(([nome, v]) => ({ nome, ...v }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5),
  };
}
