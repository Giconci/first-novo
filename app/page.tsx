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

      {/* Espaçamento entre Hero e título */}
      <div className="p-6 mt-12" id="produtos">
        <h1 className="text-2xl font-bold mb-6">
          Loja de Roupas, Tênis e Cadarços
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition flex flex-col bg-white"
            >
              <div className="relative group">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded"
                  />
                )}
                <div className="absolute inset-0 bg-gray bg-opacity-40 hidden group-hover:flex items-center justify-center rounded">
                  <Button
                    variant="secondary"
                    className="bg-white text-black hover:bg-gray-200"
                    onClick={() => addToCart(product)}
                  >
                    Quick Add
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  R$ {product.price.toFixed(2)}
                </p>

                <Link href={`/produto/${product.id}`}>
                  <Button className="mt-2 bg-blue-600 text-white hover:bg-blue-700">
                    Ver Detalhes
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
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

      {/* Footer */}
      <footer className="bg-gray-200 text-center py-4 mt-12">
        <p className="text-sm text-gray-700">
          © {new Date().getFullYear()} Conci - Todos os direitos reservados
        </p>
        <p className="text-sm text-gray-600">Contato: gui.conci@hotmail.com</p>
      </footer>
    </div>
  );
}
