import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser, requireAdmin } from "@/lib/session";

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
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: parsed.data.status },
    });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
}
