"use client";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

type HeroBanner = {
  id: number;
  desktop: string;
  mobile: string;
};

export default function Hero() {
  const [banners] = useState<HeroBanner[]>([
    {
      id: 1,
      desktop: "/images/banner1-desktop.jpg",
      mobile: "/images/banner1-mobile.jpg",
    },
    {
      id: 2,
      desktop: "/images/banner2-desktop.jpg",
      mobile: "/images/banner2-mobile.jpg",
    },
    {
      id: 3,
      desktop: "/images/banner3-desktop.jpg",
      mobile: "/images/banner3-mobile.jpg",
    },
  ]);

  const [current, setCurrent] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  // 🔹 Troca o banner a cada 5 segundos
  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  if (banners.length === 0) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // 🔹 Aqui você redireciona para a página de busca
    window.location.href = `/busca?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="relative w-full mb-18 h-64 md:h-96 overflow-hidden">
      <picture>
        <source media="(max-width: 768px)" srcSet={banners[current].mobile} />
        <img
          src={banners[current].desktop}
          alt={`Banner ${current + 1}`}
          className="w-full h-auto object-cover transition-opacity duration-500"
        />
      </picture>

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
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 text-black shadow-lg hover:bg-white transition"
        >
          {searchOpen ? <X size={20} /> : <Search size={20} />}
        </button>
      </div>

      {/* 🔹 Overlay com texto centralizado */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/30">
        <h1 className="text-3xl md:text-5xl font-bold">Bem-vindo à nossa loja</h1>
        <p className="mt-2 text-lg md:text-xl">loja Conci</p>
      </div>
    </div>
  );
}