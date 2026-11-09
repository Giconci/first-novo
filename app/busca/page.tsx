"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toCartProduct } from "@/lib/cart";
import { QuickAddButton } from "@/components/AddToCartButton";

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
  // Guarda o resultado junto com a busca que o gerou.
  // "Buscando..." = ainda não chegou o resultado da busca atual (não precisa de um estado "loading").
  const [resultado, setResultado] = useState<{ q: string; products: Product[] } | null>(null);
  const loading = q !== "" && resultado?.q !== q;
  const products = resultado?.q === q ? resultado.products : [];

  useEffect(() => {
    if (!q) return;
    let ativa = true; // se o cliente buscar outra coisa antes de chegar, ignora a resposta antiga
    fetch(`/api/busca?q=${encodeURIComponent(q)}`)
      .then((res) => (res.ok ? res.json() : []))
      .catch(() => []) // sem internet ou erro no servidor: mostra "Nenhum produto encontrado"
      .then((lista: Product[]) => {
        if (ativa) setResultado({ q, products: lista });
      });
    return () => {
      ativa = false;
    };
  }, [q]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Resultados para &ldquo;{q}&rdquo;</h1>

      {loading ? (
        <p>Buscando...</p>
      ) : products.length === 0 ? (
        <p>Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            // Cartão = <div> com o link dentro (o Quick Add é botão, e botão não pode ficar dentro de link)
            <div key={p.id} className="group relative border border-transparent rounded-lg p-3">
            <Link href={`/produto/${p.id}`} className="block">
              {p.imageUrl && (
                <div className="relative w-full h-40">
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover rounded"
                  />
                </div>
              )}
              <h2 className="font-semibold mt-2">{p.name}</h2>
              {p.category && (
                <p className="text-sm text-muted-foreground">{p.category}</p>
              )}
              <p className="font-bold mt-1">
                {p.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </Link>

            {/* Quick Add por cima da foto: celular sempre visível, computador ao passar o mouse */}
            {p.imageUrl && (
              <div className="pointer-events-none absolute inset-x-3 top-3 h-40 flex md:hidden md:group-hover:flex items-center justify-center rounded md:bg-black/20">
                <div className="pointer-events-auto">
                  <QuickAddButton product={toCartProduct({ ...p, description: null })} />
                </div>
              </div>
            )}
            </div>
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