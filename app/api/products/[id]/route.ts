import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";

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

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 });
  }
}

// PUT /api/products/:id → atualiza produto (recebe FormData do admin)
export async function PUT(req: NextRequest, context: any) {
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
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = Date.now() + "-" + file.name;
      fs.writeFileSync(path.join(uploadDir, fileName), buffer);
      data.imageUrl = "/uploads/" + fileName;
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
export async function DELETE(req: NextRequest, context: any) {
  const { id } = await context.params;
  const productId = Number(id);

  try {
    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ message: "Produto excluído" });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 });
  }
}