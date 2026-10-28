import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

// GET /api/orders → lista pedidos
// admin: todos | cliente: só os dele
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Faça login" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: user.role === "admin" ? {} : { userId: user.id },
      include: {
        products: { include: { product: { select: { name: true, imageUrl: true } } } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Erro ao listar pedidos" }, { status: 500 });
  }
}
