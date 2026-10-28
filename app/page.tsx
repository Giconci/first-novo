"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero"; 
import { useCart } from "@/components/ui/context/CartContext"; 
import Link from "next/link"; 

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
};

// 🔹 As duas vitrines da home. Para trocar os produtos em destaque,
// mude só a categoria (nome igual ao do admin, ver lib/categories.ts) e o título aqui.
const HOME_SECTIONS = {
  top: { category: "Boné", title: "Bonés" },
  bottom: { category: "Camiseta", title: "Camisetas" },
};

const sameCategory = (a: string | null | undefined, b: string) =>
  (a ?? "").toLowerCase() === b.toLowerCase();

function ProductGrid({
  products,
  onAdd,
}: {
  products: Product[];
  onAdd: (product: Product) => void;
}) {
  if (products.length === 0) {
    return <p className="text-gray-500">Novidades em breve.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="border border-transparent rounded-lg p-4 flex flex-col bg-white" // borda invisível (para voltar: tire "border-transparent" e ponha "shadow-sm")
        >
          <div className="relative group">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover rounded"
              />
            )}
            {/* Quick Add no meio da foto:
                celular (sem mouse) → sempre visível
                computador (md:)    → só aparece ao passar o mouse */}
            <div className="absolute inset-0 flex md:hidden md:group-hover:flex items-center justify-center rounded md:bg-black/20">
              <Button
                variant="secondary"
                className="bg-white/90 text-petroleo shadow hover:bg-white"
                onClick={() => onAdd(product)}
              >
                Quick Add
              </Button>
            </div>
          </div>

          <div className="mt-3">
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-sm text-muted-foreground">{product.description}</p>
            {/* Cinza petróleo claro (cores no app/globals.css) */}
            <p className="text-lg font-bold text-petroleo-claro mt-2">
              R$ {product.price.toFixed(2)}
            </p>

            <Link href={`/produto/${product.id}`}>
              <Button className="mt-2 bg-petroleo-claro text-white hover:bg-petroleo-claro-escuro">
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch("/api/products?home=true");
      const data = await res.json();
      setProducts(data);
    }
    fetchProducts();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen"> {/* fundo cinza claro */}
      <Hero /> 

      {/* Vitrine de cima: espaçamento entre Hero e título */}
      <div className="p-6 mt-12" id="produtos">
        <h1 className="text-2xl font-bold mb-6">{HOME_SECTIONS.top.title}</h1>
        <ProductGrid
          products={products.filter((p) => sameCategory(p.category, HOME_SECTIONS.top.category))}
          onAdd={addToCart}
        />
      </div>

      {/* Seção de informações institucionais */}
      <div className="p-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">Nossa História</h2>
            <p className="text-gray-700">
              Fundada em Curitiba, nossa empresa tem anos de experiência no setor de moda e calçados.
              Trabalhamos sempre com dedicação para oferecer produtos de qualidade e estilo para nossos clientes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-2">Compromisso com Você</h2>
            <p className="text-gray-700">
              Prezamos pela confiança e satisfação de quem compra conosco. 
              Nossa equipe está sempre pronta para atender e garantir que sua experiência seja a melhor possível.
            </p>
          </div>
        </div>
      </div>

      {/* Vitrine de baixo */}
      <div className="p-6 mt-12">
        <h2 className="text-2xl font-bold mb-6">{HOME_SECTIONS.bottom.title}</h2>
        <ProductGrid
          products={products.filter((p) => sameCategory(p.category, HOME_SECTIONS.bottom.category))}
          onAdd={addToCart}
        />
      </div>

      {/* Footer */}
      <footer className="bg-gray-200 text-center py-4 mt-12">
        <p className="text-sm text-gray-700">
          © {new Date().getFullYear()} Conci - Todos os direitos reservados
        </p>
        <p className="text-sm text-gray-600">Contato: conciluzcwb@gmail.com</p>
      </footer>
    </div>
  );
}
