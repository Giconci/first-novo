import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/session";

// GET /api/products/:id → busca produto específico
export async function GET(req: NextRequest, context: any) {
  const { id } = await context.params;
  const productId = Number(id);

  if (isNaN(productId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.archived) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 });
  }
}

// PUT /api/products/:id → atualiza produto (recebe FormData do admin)
export async function PUT(req: NextRequest, context: any) {
  const admin = await requireAdmin(); // 🔒 só admin edita
  if (admin instanceof NextResponse) return admin;

  const { id } = await context.params;
  const productId = Number(id);

  if (isNaN(productId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const formData = await req.formData();

    const data: any = {
      name: String(formData.get("name") ?? ""),
      price: parseFloat(String(formData.get("price") ?? "0")),
      category: String(formData.get("category") ?? ""),
      description: String(formData.get("description") ?? ""),
      showOnHome: formData.get("showOnHome") === "true",
      showOnProducts: formData.get("showOnProducts") === "true",
    };

    // Só troca a imagem se veio uma nova
    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      // Envia a foto para o Vercel Blob e guarda só o link no banco
      const blob = await put("products/" + file.name, file, {
        access: "public",
        addRandomSuffix: true,
      });
      data.imageUrl = blob.url;
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

// DELETE /api/products/:id → exclui produto
// Produto que já aparece em algum pedido não pode sumir do banco (o pedido
// aponta para ele). Nesse caso ele é ARQUIVADO: some do site e do admin,
// mas continua no histórico de pedidos e nas métricas.
export async function DELETE(req: NextRequest, context: any) {
  const admin = await requireAdmin(); // 🔒 só admin exclui
  if (admin instanceof NextResponse) return admin;

  const { id } = await context.params;
  const productId = Number(id);

  try {
    const pedidos = await prisma.orderItem.count({ where: { productId } });
    if (pedidos > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: { archived: true, showOnHome: false, showOnProducts: false },
      });
      return NextResponse.json({ message: "Produto arquivado", archived: true });
    }

    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ message: "Produto excluído", archived: false });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 });
  }
}