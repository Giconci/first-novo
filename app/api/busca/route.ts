import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { disponivel } from "@/lib/stock";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json([]);
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        archived: false,
        AND: [disponivel], // esgotado não aparece na busca
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Erro na busca:", error);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}