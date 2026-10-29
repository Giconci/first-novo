"use client"

import "./globals.css"
import { Geist } from "next/font/google"
import { cn } from "@/lib/utils"
import { SessionProvider } from "next-auth/react"
import { CartProvider } from "@/components/ui/context/CartContext"
import { NavBar } from "@/components/NavBar"
import { Footer } from "@/components/Footer"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      {/* flex-col + flex-1: o rodapé fica sempre no fim da tela, mesmo em página curta */}
      <body className="min-h-screen flex flex-col">
        <SessionProvider>
          <CartProvider>
            <NavBar />
            <main className="p-6 flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  )
}