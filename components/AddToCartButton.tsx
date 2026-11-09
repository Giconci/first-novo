"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/ui/context/CartContext"
import type { CartProduct } from "@/lib/cart"

// Botões que mexem no carrinho (rodam no navegador).
// Ficam separados para a página do produto e a home poderem ser "server" (SEO).

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

export function AddToCartButton({ product, soldOut }: { product: CartProduct; soldOut?: boolean }) {
  const { adicionado, adicionar } = useAdicionar(product)

  // stock 0 = esgotado (vazio = sem controle de estoque)
  if (soldOut) {
    return (
      <Button disabled variant="outline" size="lg" className="px-6">
        Esgotado
      </Button>
    )
  }

  return (
    <Button size="lg" className="px-6" onClick={adicionar}>
      {adicionado ? "Adicionado ✓" : "Adicionar ao Carrinho"}
    </Button>
  )
}

// Botão por cima da foto do produto
export function QuickAddButton({ product }: { product: CartProduct }) {
  const { adicionado, adicionar } = useAdicionar(product)

  return (
    <Button className="shadow" onClick={adicionar}>
      {adicionado ? "Adicionado ✓" : "Quick Add"}
    </Button>
  )
}

// Só no celular: barra presa no pé da tela, com o preço e um botão grande (fácil de tocar com o polegar).
// Fica sempre visível, mesmo rolando a página. No computador (md:) some e vale o botão normal.
export function BarraCarrinhoMobile({
  product,
  soldOut,
  preco,
}: {
  product: CartProduct
  soldOut?: boolean
  preco: string
}) {
  const { adicionado, adicionar } = useAdicionar(product)

  return (
    // pb com safe-area: no iPhone, não fica embaixo da barrinha de gesto
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-white/10 bg-steam-escuro px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
      <div className="shrink-0">
        <p className="text-xs text-muted-foreground">Preço</p>
        <p className="text-lg font-bold text-white">{preco}</p>
      </div>
      <Button
        className="h-12 flex-1 text-base"
        disabled={soldOut}
        onClick={adicionar}
      >
        {soldOut ? "Esgotado" : adicionado ? "Adicionado ✓" : "Adicionar ao carrinho"}
      </Button>
    </div>
  )
}
