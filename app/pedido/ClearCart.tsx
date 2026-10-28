"use client"

import { useEffect } from "react"
import { useCart } from "@/components/ui/context/CartContext"

// Esvazia o carrinho quando aparece na tela (só é usado quando o pedido deu certo)
export function ClearCart() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
