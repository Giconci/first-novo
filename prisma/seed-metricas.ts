import { PrismaClient } from "@prisma/client";

// Cria vendas de exemplo para ver o painel /admin/metricas funcionando.
//   npx tsx prisma/seed-metricas.ts           → cria ~40 pedidos pagos nos últimos 30 dias
//   npx tsx prisma/seed-metricas.ts --limpar  → apaga só esses pedidos de exemplo
// 🔒 Só roda no banco local: se o DATABASE_URL não for localhost, para na hora.

const prisma = new PrismaClient();
const MARCA = "DEMO"; // paymentId dos pedidos de exemplo (é assim que achamos eles para apagar)

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.includes("localhost") && !url.includes("127.0.0.1")) {
    throw new Error("Este script só roda no banco local (DATABASE_URL com localhost).");
  }

  const demo = await prisma.order.findMany({ where: { paymentId: MARCA }, select: { id: true } });
  await prisma.orderItem.deleteMany({ where: { orderId: { in: demo.map((o) => o.id) } } });
  await prisma.order.deleteMany({ where: { paymentId: MARCA } });
  if (process.argv.includes("--limpar")) {
    console.log(`Apagados ${demo.length} pedidos de exemplo.`);
    return;
  }

  const users = await prisma.user.findMany({ select: { id: true } });
  const products = await prisma.product.findMany({ select: { id: true, price: true } });
  if (!users.length || !products.length) throw new Error("Cadastre um usuário e um produto antes.");

  const sorteia = <T,>(lista: T[]) => lista[Math.floor(Math.random() * lista.length)];

  for (let i = 0; i < 40; i++) {
    const quando = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const itens = Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => {
      const p = sorteia(products);
      return { productId: p.id, quantity: 1 + Math.floor(Math.random() * 2), unitPrice: p.price };
    });
    await prisma.order.create({
      data: {
        userId: sorteia(users).id,
        createdAt: quando,
        status: Math.random() < 0.2 ? "shipped" : "paid",
        paymentId: MARCA,
        total: itens.reduce((s, it) => s + it.quantity * it.unitPrice, 0),
        products: { create: itens },
      },
    });
  }
  console.log("Criados 40 pedidos de exemplo. Abra /admin/metricas.");
}

main().finally(() => prisma.$disconnect());
