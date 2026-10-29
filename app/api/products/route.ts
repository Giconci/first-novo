import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/session";

// GET /api/products → lista produtos
// /api/products          → todos (usado no admin)
// /api/products?home=true → só os marcados para a home
export async function GET(req: NextRequest) {
  try {
    const home = req.nextUrl.searchParams.get("home") === "true"; // 🔹 NOVO

    const products = await prisma.product.findMany({
      // arquivados (excluídos que têm pedidos) nunca aparecem
      where: home ? { showOnHome: true, archived: false } : { archived: false },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Erro ao listar produtos" }, { status: 500 });
  }
}

// POST /api/products → cria novo produto
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(); // 🔒 só admin cria
  if (admin instanceof NextResponse) return admin;

  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const file = formData.get("image") as File | null;
    const description = formData.get("description") as string;

    // 🔹 NOVO: FormData envia tudo como texto, então comparamos com "true"
    const showOnHome = formData.get("showOnHome") === "true";
    const showOnProducts = formData.get("showOnProducts") === "true";

    let imageUrl: string | null = null;

    if (file && file.size > 0) { // 🔹 file.size evita salvar arquivo vazio
      // Envia a foto para o Vercel Blob e guarda só o link no banco
      const blob = await put("products/" + file.name, file, {
        access: "public",
        addRandomSuffix: true,
      });
      imageUrl = blob.url;
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        category,
        description,
        imageUrl,
        showOnHome,       // 🔹 NOVO
        showOnProducts,   // 🔹 NOVO
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erro ao criar produto:", error); // 🔹 mostra o erro real no terminal
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}