"use client"

import { SessionProvider } from "next-auth/react"
import { CartProvider } from "@/components/ui/context/CartContext"

// Tudo que precisa rodar no navegador (login e carrinho) fica aqui.
// Assim o app/layout.tsx continua "server" e pode ter título/descrição (SEO).
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  )
}
