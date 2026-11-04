import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser, requireAdmin } from "@/lib/session";
import { avisarCliente } from "@/lib/orderEmails";

// GET /api/orders/:id → um pedido (só o dono ou o admin)
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Faça login" }, { status: 401 });
  }

  const orderId = Number((await ctx.params).id);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { products: { include: { product: { select: { name: true, imageUrl: true } } } } },
  });

  // Pedido de outra pessoa responde como "não encontrado" (não revela que existe)
  if (!order || (order.userId !== user.id && user.role !== "admin")) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  return NextResponse.json(order);
}

// PATCH /api/orders/:id → admin muda o status (ex.: "shipped" quando enviar)
const statusSchema = z.object({
  status: z.enum(["pending", "paid", "rejected", "cancelled", "shipped"]),
});

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const orderId = Number((await ctx.params).id);
  const parsed = statusSchema.safeParse(await req.json().catch(() => null));
  if (isNaN(orderId) || !parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  try {
    const atual = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } });
    if (!atual) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    // Só muda se ninguém mudou antes: dois cliques seguidos não mandam dois emails
    const { count } = await prisma.order.updateMany({
      where: { id: orderId, status: atual.status },
      data: { status: parsed.data.status },
    });
    if (count > 0 && atual.status !== parsed.data.status) {
      await avisarCliente(orderId, atual.status, parsed.data.status);
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    return NextResponse.json(order);
  } catch (error) {
    console.error("Erro ao mudar status do pedido:", error);
    return NextResponse.json({ error: "Não foi possível mudar o status" }, { status: 500 });
  }
}
