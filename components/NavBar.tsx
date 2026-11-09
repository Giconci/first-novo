"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { useCart } from "@/components/ui/context/CartContext"
import { SkateIcon } from "@/components/SkateIcon"

const linkClass = "px-2 py-1 rounded hover:bg-white/10 hover:text-neon"

// Barra do topo.
//   computador (md: = tela ≥ 768px) → links em linha
//   celular                         → botão ☰ que abre/fecha a lista de links
export function NavBar() {
  const { data: session } = useSession()
  const { count } = useCart()
  const [open, setOpen] = useState(false) // menu do celular aberto?

  const pathname = usePathname()

  const close = () => setOpen(false) // fecha ao clicar num link

  // Página do portfólio tem visual próprio, sem o menu da loja
  if (pathname.startsWith("/sobre-nos")) return null

  // Os mesmos links servem para o computador e para o celular
  const links = (
    <>
      <Link href="/" className={linkClass} onClick={close}>Home</Link>
      <Link href="/produtos" className={linkClass} onClick={close}>Produtos</Link>
      <Link href="/sobre" className={linkClass} onClick={close}>Sobre</Link>
      <Link href="/contato" className={linkClass} onClick={close}>Contato</Link>

      {session ? (
        <>
          {session.user?.role === "admin" ? (
            <Link href="/admin" className={linkClass} onClick={close}>Admin</Link>
          ) : (
            <Link href="/meus-pedidos" className={linkClass} onClick={close}>Meus pedidos</Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`${linkClass} text-left`}
          >
            Sair
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className={linkClass} onClick={close}>Login</Link>
          <Link href="/cadastro" className={linkClass} onClick={close}>Cadastro</Link>
        </>
      )}
    </>
  )

  return (
    <nav className="border-b p-4 bg-steam-escuro">
      <div className="flex gap-4 items-center">
        {/* ☰ só no celular */}
        <button
          className="md:hidden p-1 rounded hover:bg-white/10"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>

        {/* Links em linha só no computador (o "Home" é o primeiro, colado à esquerda) */}
        <div className="hidden md:flex gap-4 items-center">{links}</div>

        {session && (
          <span className="ml-auto text-sm md:text-base">
            Olá {session.user?.role === "admin" ? "Administrador" : session.user?.name}
          </span>
        )}

        {/* Carrinho sempre visível (ícone de skate: 28px no celular, 32px no computador) */}
        <Link
          href="/carrinho"
          className={`${session ? "" : "ml-auto"} relative`}
          onClick={close}
          aria-label="Carrinho"
        >
          <SkateIcon className="h-7 w-7 md:h-8 md:w-8 text-foreground hover:text-neon" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
            {count}
          </span>
        </Link>

        {/* Marca da loja: no canto direito da tela, leva para a home */}
        <Link href="/" className="text-xl font-bold tracking-widest text-white" onClick={close}>
          CONCI
        </Link>
      </div>

      {/* Lista que abre embaixo, só no celular */}
      {open && <div className="md:hidden flex flex-col gap-1 pt-3">{links}</div>}
    </nav>
  )
}
