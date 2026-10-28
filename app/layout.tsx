"use client"

import "./globals.css"
import { Geist } from "next/font/google"
import { cn } from "@/lib/utils"
import { SessionProvider } from "next-auth/react"
import { CartProvider } from "@/components/ui/context/CartContext"
import { NavBar } from "@/components/NavBar"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      <body>
        <SessionProvider>
          <CartProvider>
            <NavBar />
            <main className="p-6">{children}</main>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  )
}