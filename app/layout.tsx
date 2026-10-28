"use client"

import "./globals.css"
import { Geist } from "next/font/google"
import { cn } from "@/lib/utils"
import { SessionProvider, useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { ShoppingCartIcon } from "@heroicons/react/24/outline"
import { CartProvider, useCart } from "@/components/ui/context/CartContext"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

function NavBar() {
  const { data: session } = useSession()
  const { count } = useCart()

  return (
    <nav className="border-b p-4 flex gap-4 items-center">
      <Link href="/" className="px-2 py-1 rounded hover:bg-gray-100">
        Home
      </Link>

      <Link href="/produtos" className="px-2 py-1 rounded hover:bg-gray-100">
        Produtos
      </Link>

      <Link href="/login" className="px-2 py-1 rounded hover:bg-gray-100">
        Login
      </Link>
      <Link href="/cadastro" className="px-2 py-1 rounded hover:bg-gray-100">
        Cadastro
      </Link>

      <Link href="/carrinho" className="ml-auto relative">
        <ShoppingCartIcon className="h-6 w-6 text-gray-700 hover:text-black" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
          {count}
        </span>
      </Link>

      {session && (
        <>
          <span className="px-2 py-1">
            Olá {session.user?.role === "admin" ? "Administrador" : session.user?.name}
          </span>

          {session.user?.role === "admin" ? (
            <Link href="/admin" className="px-2 py-1 rounded hover:bg-gray-100">
              Admin
            </Link>
          ) : (
            <Link href="/meus-pedidos" className="px-2 py-1 rounded hover:bg-gray-100">
              Meus pedidos
            </Link>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-2 py-1 rounded hover:bg-gray-100"
          >
            Sair
          </button>
        </>
      )}
    </nav>
  )
}

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