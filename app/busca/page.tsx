"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  category: string | null;
};

function BuscaContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    fetch(`/api/busca?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Resultados para "{q}"</h1>

      {loading ? (
        <p>Buscando...</p>
      ) : products.length === 0 ? (
        <p>Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/produto/${p.id}`}
              className="border border-transparent rounded-lg p-3" // borda invisível (para voltar: tire "border-transparent")
            >
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-40 object-cover rounded"
                />
              )}
              <h2 className="font-semibold mt-2">{p.name}</h2>
              {p.category && (
                <p className="text-sm text-gray-500">{p.category}</p>
              )}
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
    </div>
  );
}

export default function BuscaPage() {
  return (
    <Suspense fallback={<p className="p-6">Carregando...</p>}>
      <BuscaContent />
    </Suspense>
  );
}