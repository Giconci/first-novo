"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";

// ✏️ Fotos do banner, na ordem em que aparecem (todas ficam em public/images).
// Para tirar uma foto, apague a linha; para pôr outra, copie uma linha e troque o nome.
// Só estas aparecem: outras fotos na pasta são ignoradas.
const BANNERS = [
  "/images/banner2-desktop.jpg",
  "/images/jan-kopriva-An-PNdZ0gxw-unsplash.jpg",
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  // 🔹 Troca o banner a cada 10 segundos (10000 milissegundos); depois do último, volta ao primeiro
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // 🔹 Aqui você redireciona para a página de busca
    window.location.href = `/busca?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden">
      {/* Todas as fotos ficam empilhadas; só a atual fica visível.
          A troca é um "fade" de 1,5 segundo (duration-1500). */}
      {BANNERS.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt="Coleção Conci"
          fill
          sizes="100vw"
          preload={i === 0}
          className={`object-cover transition-opacity duration-1500 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* 🔹 Menu superior com a lupa */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-end gap-3 p-4">
        {searchOpen && (
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white rounded-full px-4 py-2 shadow-lg w-full max-w-xs md:max-w-sm"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produtos..."
              autoFocus
              className="w-full bg-transparent text-black text-sm outline-none placeholder:text-gray-500"
            />
          </form>
        )}

        <button
          type="button"
          onClick={() => setSearchOpen((prev) => !prev)}
          aria-label={searchOpen ? "Fechar busca" : "Abrir busca"}
          className="flex items-center justify-center w-10 h-10 rounded-full btn-neon shadow-lg"
        >
          {searchOpen ? <X size={20} /> : <Search size={20} />}
        </button>
      </div>

      {/* 🔹 Overlay com texto centralizado */}
      {/* font-(family-name:--font-logo): mesma fonte escrita à mão da logo (app/layout.tsx).
          Sem font-bold: essa fonte só tem um peso, e o negrito "falso" borra as letras */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white bg-black/30 font-(family-name:--font-logo)">
        <h1 className="text-3xl md:text-5xl">Bem-vindo à nossa loja</h1>
        <p className="mt-2 text-xl md:text-2xl">loja Conci</p>
      </div>
    </div>
  );
}