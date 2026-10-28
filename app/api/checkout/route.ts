import { NextResponse } from "next/server";
import { z } from "zod";
import { Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getMercadoPago } from "@/lib/mercadopago";
import { addressSchema } from "@/schemas/addressSchema";

// O navegador manda só QUAIS produtos e QUANTOS. O preço vem sempre do banco,
// para ninguém conseguir mudar o valor pelo navegador.
const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Carrinho vazio"),
  address: addressSchema, // sem endereço completo não finaliza
});

// POST /api/checkout → cria o pedido e devolve o link de pagamento do Mercado Pago
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Faça login para finalizar a compra" }, { status: 401 });
  }

  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const semEndereco = parsed.error.issues.some((i) => i.path[0] === "address");
    return NextResponse.json(
      { error: semEndereco ? "Preencha o endereço de entrega" : "Carrinho inválido" },
      { status: 400 }
    );
  }

  // Junta itens repetidos (ex.: o mesmo boné enviado duas vezes)
  const quantities = new Map<number, number>();
  for (const item of parsed.data.items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  // Busca os produtos de verdade no banco
  const products = await prisma.product.findMany({
    where: { id: { in: [...quantities.keys()] } },
  });
  if (products.length !== quantities.size) {
    return NextResponse.json(
      { error: "Algum produto do carrinho não existe mais" },
      { status: 400 }
    );
  }

  const lines = products.map((p) => ({ product: p, quantity: quantities.get(p.id)! }));
  const total = lines.reduce((acc, l) => acc + l.product.price * l.quantity, 0);

  // 1) Cria o pedido no banco como "pending" (aguardando pagamento)
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      total,
      shippingAddress: parsed.data.address, // cópia do endereço desta compra
      products: {
        create: lines.map((l) => ({
          productId: l.product.id,
          quantity: l.quantity,
          unitPrice: l.product.price,
        })),
      },
    },
  });

  // 2) Cria a "preferência" no Mercado Pago (a página de pagamento deles)
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const isPublic = baseUrl.startsWith("https://"); // o Mercado Pago não alcança o localhost

  try {
    const preference = await new Preference(getMercadoPago()).create({
      body: {
        items: lines.map((l) => ({
          id: String(l.product.id),
          title: l.product.name,
          picture_url: l.product.imageUrl ?? undefined,
          quantity: l.quantity,
          unit_price: l.product.price,
          currency_id: "BRL",
        })),
        payer: { email: user.email },
        external_reference: String(order.id), // liga o pagamento ao nosso pedido
        back_urls: {
          success: `${baseUrl}/pedido/sucesso`,
          pending: `${baseUrl}/pedido/pendente`,
          failure: `${baseUrl}/pedido/falha`,
        },
        // Só funcionam com endereço público (https), ou seja, na Vercel
        ...(isPublic && {
          auto_return: "approved",
          notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        }),
      },
    });

    return NextResponse.json({ orderId: order.id, url: preference.init_point });
  } catch (error) {
    console.error("Erro ao criar pagamento no Mercado Pago:", error);
    await prisma.order.update({ where: { id: order.id }, data: { status: "cancelled" } });
    return NextResponse.json(
      { error: "Não foi possível iniciar o pagamento. Tente de novo." },
      { status: 502 }
    );
  }
}
