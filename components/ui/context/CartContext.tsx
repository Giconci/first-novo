"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"

// Tipo do produto (igual ao que você já usa na HomePage)
type Product = {
  id: number
  name: string
  description: string
  price: number
  imageUrl?: string
  category: string
}

// Item do carrinho = produto + quantidade
export type CartItem = Product & { quantity: number }

// Tipo do contexto
type CartContextType = {
  cart: CartItem[]
  count: number // total de unidades (para o número no ícone)
  total: number // soma de preço x quantidade
  addToCart: (product: Product) => void
  decreaseQuantity: (id: number) => void
  removeFromCart: (id: number) => void
  clearCart: () => void
}

// Nome da "gaveta" onde o carrinho fica salvo no navegador
const STORAGE_KEY = "cart"

// Criando o contexto
const CartContext = createContext<CartContextType | undefined>(undefined)

// Provider que envolve o app
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  // 1) Ao abrir o site, recupera o carrinho salvo (sobrevive ao F5)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setCart(JSON.parse(saved))
    } catch {
      // navegador bloqueou ou dado corrompido: começa vazio
    }
    setLoaded(true)
  }, [])

  // 2) Sempre que o carrinho muda, salva de novo
  useEffect(() => {
    if (!loaded) return // não apaga o salvo antes de ter lido
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // sem espaço ou bloqueado: o carrinho continua funcionando na memória
    }
  }, [cart, loaded])

  // Se o produto já está no carrinho, soma +1; se não, entra com quantidade 1
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  // Tira 1 unidade; se chegar a 0, sai do carrinho
  const decreaseQuantity = (id: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  // Tira o produto inteiro, qualquer que seja a quantidade
  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  // Esvazia tudo (usado depois que o pagamento é aprovado).
  // Apaga também o salvo no navegador, para ele não voltar ao recarregar.
  const clearCart = () => {
    setCart([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // bloqueado: tudo bem, a memória já está vazia
    }
  }

  const count = cart.reduce((acc, item) => acc + item.quantity, 0)
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ cart, count, total, addToCart, decreaseQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook para usar o contexto
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider")
  }
  return context
}
