import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";
import { disponivel } from "@/lib/stock";

export const dynamic = "force-dynamic";

const PER_PAGE = 12;

// Título no Google muda conforme a categoria (ex.: "Boné | Conci")
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}): Promise<Metadata> {
  const { categoria } = await searchParams;
  const current = CATEGORIES.find((c) => c.slug === categoria);
  if (!current) {
    return {
      title: "Todos os produtos",
      description: "Bonés, camisetas, calças e tênis da Conci. Envio para todo o Brasil.",
    };
  }
  return {
    title: current.label,
    description: `${current.label} da Conci, feitos em Curitiba. Envio para todo o Brasil.`,
  };
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; page?: string }>;
}) {
  const { categoria, page } = await searchParams;

  const current = CATEGORIES.find((c) => c.slug === categoria);
  const pageNumber = Math.max(1, Number(page) || 1);

  const where = {
    showOnProducts: true,
    archived: false,
    ...disponivel, // esgotado some da lista
    ...(current
      ? { category: { equals: current.label, mode: "insensitive" as const } }
      : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PER_PAGE,
      skip: (pageNumber - 1) * PER_PAGE,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const baseQuery = current ? `categoria=${current.slug}&` : "";

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">
        {current ? current.label : "Todos os produtos"}
      </h1>

      {/* Filtro de categorias */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/produtos"
          className={`px-4 py-2 rounded-full border text-sm ${
            !current ? "bg-black text-white" : "hover:bg-gray-100"
          }`}
        >
          Todos
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/produtos?categoria=${c.slug}`}
            className={`px-4 py-2 rounded-full border text-sm ${
              current?.slug === c.slug
                ? "bg-black text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {/* Lista */}
      {products.length === 0 ? (
        <p>Nenhum produto nesta categoria.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/produto/${p.id}`}
              className="border border-transparent rounded-lg p-3" // borda invisível (para voltar: tire "border-transparent")
            >
              {p.imageUrl ? (
                <div className="relative w-full h-40">
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover rounded"
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-gray-100 rounded" />
              )}
              <h2 className="font-semibold mt-2">{p.name}</h2>
              <p className="font-bold mt-1">
                {p.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          {pageNumber > 1 && (
            <Link href={`/produtos?${baseQuery}page=${pageNumber - 1}`}>
              ← Anterior
            </Link>
          )}
          <span className="text-sm">
            Página {pageNumber} de {totalPages}
          </span>
          {pageNumber < totalPages && (
            <Link href={`/produtos?${baseQuery}page=${pageNumber + 1}`}>
              Próxima →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}