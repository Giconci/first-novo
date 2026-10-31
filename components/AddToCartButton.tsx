"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/components/ui/context/CartContext"
import type { CartProduct } from "@/lib/cart"

// Botões que mexem no carrinho (rodam no navegador).
// Ficam separados para a página do produto e a home poderem ser "server" (SEO).
export function AddToCartButton({ product, soldOut }: { product: CartProduct; soldOut?: boolean }) {
  const { addToCart } = useCart()

  // stock 0 = esgotado (vazio = sem controle de estoque)
  if (soldOut) {
    return (
      <Button disabled variant="outline">
        Esgotado
      </Button>
    )
  }

  return (
    <Button
      onClick={() => addToCart(product)}
    >
      Adicionar ao Carrinho
    </Button>
  )
}

export function QuickAddButton({ product }: { product: CartProduct }) {
  const { addToCart } = useCart()

  return (
    <Button
      className="shadow"
      onClick={() => addToCart(product)}
    >
      Quick Add
    </Button>
  )
}
