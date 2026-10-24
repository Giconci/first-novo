import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

const PER_PAGE = 12;

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
              className="border rounded-lg p-3 hover:shadow-lg transition"
            >
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-40 object-cover rounded"
                />
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