"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/ui/context/CartContext"
import type { CartProduct } from "@/lib/cart"

// Botão que mexe no carrinho (roda no navegador).
// Fica separado para a página do produto e a home poderem ser "server" (SEO).
// O Quick Add é o único botão de carrinho da loja (fora o + e − dentro do carrinho).

// Adiciona ao carrinho e mostra "Adicionado ✓" por 1,5 s, para o cliente ter certeza que foi
function useAdicionar(product: CartProduct) {
  const { addToCart } = useCart()
  const [adicionado, setAdicionado] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), []) // limpa o timer se a página fechar

  const adicionar = () => {
    addToCart(product)
    setAdicionado(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAdicionado(false), 1500)
  }

  return { adicionado, adicionar }
}

// Botão por cima da foto do produto: pérola com letra cinza escuro; hover em neon claro
// (cores no app/globals.css: --color-perola, --color-cinza-escuro, --color-neon-claro)
export function QuickAddButton({ product }: { product: CartProduct }) {
  const { adicionado, adicionar } = useAdicionar(product)

  return (
    <Button
      className="shadow [--btn-fundo:var(--color-perola)] [--btn-texto:var(--color-cinza-escuro)] [--btn-hover:var(--color-neon-claro)]"
      onClick={adicionar}
    >
      {adicionado ? "Adicionado ✓" : "Quick Add"}
    </Button>
  )
}
