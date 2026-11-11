"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Bars3Icon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useCart } from "@/components/ui/context/CartContext"
import { SkateIcon } from "@/components/SkateIcon"
import { CATEGORIES } from "@/lib/categories"

const linkClass = "px-2 py-1 rounded hover:bg-white/10 hover:text-neon"

// Barra do topo.
//   computador (md: = tela ≥ 768px) → links em linha
//   celular                         → botão ☰ que abre/fecha a lista de links
export function NavBar() {
  const { data: session } = useSession()
  const { count } = useCart()
  const [open, setOpen] = useState(false) // menu do celular aberto?
  const [produtosOpen, setProdutosOpen] = useState(false) // categorias abertas no celular?

  const pathname = usePathname()

  // fecha tudo ao clicar num link
  const close = () => {
    setOpen(false)
    setProdutosOpen(false)
  }

  // Página do portfólio tem visual próprio, sem o menu da loja
  if (pathname.startsWith("/sobre-nos")) return null

  // "Todos os produtos" + as categorias de lib/categories.ts (as mesmas do filtro em /produtos)
  const opcoesProdutos = [
    { href: "/produtos", label: "Todos os produtos" },
    ...CATEGORIES.map((c) => ({ href: `/produtos?categoria=${c.slug}`, label: c.label })),
  ]

  // Botão "Produtos" com as categorias:
  //   computador → abre ao passar o mouse (group-hover) ou ao navegar pelo teclado (group-focus-within)
  //   celular    → abre e fecha ao tocar
  const produtosMenu = (mobile: boolean) =>
    mobile ? (
      <div className="flex flex-col">
        <button
          onClick={() => setProdutosOpen(!produtosOpen)}
          className={`${linkClass} flex items-center justify-between text-left`}
          aria-expanded={produtosOpen}
        >
          Produtos
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${produtosOpen ? "rotate-180" : ""}`} />
        </button>
        {produtosOpen && (
          <div className="ml-3 flex flex-col gap-1 border-l border-white/20 pl-3 pt-1">
            {opcoesProdutos.map((o) => (
              <Link key={o.href} href={o.href} className={linkClass} onClick={close}>{o.label}</Link>
            ))}
          </div>
        )}
      </div>
    ) : (
      <div className="relative group">
        <Link href="/produtos" className={`${linkClass} flex items-center gap-1`} onClick={close}>
          Produtos
          <ChevronDownIcon className="h-4 w-4 transition-transform group-hover:rotate-180" />
        </Link>
        {/* pt-2: "ponte" invisível entre o botão e a lista, para o mouse não perder o hover no caminho */}
        <div className="absolute left-0 top-full hidden pt-2 group-hover:block group-focus-within:block">
          <div className="flex min-w-48 flex-col rounded-md border border-white/10 bg-marca py-2 shadow-lg">
            {opcoesProdutos.map((o) => (
              <Link
                key={o.href}
                href={o.href}
                className="px-4 py-2 hover:bg-white/10 hover:text-neon"
                onClick={close}
              >
                {o.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    )

  // Os mesmos links servem para o computador e para o celular (só o "Produtos" muda)
  const links = (mobile: boolean) => (
    <>
      <Link href="/" className={linkClass} onClick={close}>Home</Link>
      {produtosMenu(mobile)}
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
        // Só "Login": o link para criar conta ("Cadastre-se") fica dentro da página de login
        <Link href="/login" className={linkClass} onClick={close}>Login</Link>
      )}
    </>
  )

  return (
    // sticky top-0: a barra gruda no topo e acompanha a rolagem
    // bg-marca/60: 40% transparente; backdrop-blur: desfoca o que passa por baixo (efeito vidro)
    // z-50: fica por cima do conteúdo da página
    <nav className="sticky top-0 z-50 border-b p-4 bg-marca/60 backdrop-blur-md">
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
        <div className="hidden md:flex gap-4 items-center">{links(false)}</div>

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

        {/* Marca da loja: no canto direito da tela, leva para a home e sobe para o topo.
            Já na home, o link não "navega" e a página ficaria parada: por isso o scrollTo.
            font-(family-name:--font-logo): fonte da logo (Titan One), definida no app/layout.tsx */}
        <Link
          href="/"
          className="font-(family-name:--font-logo) text-2xl tracking-wide text-white"
          onClick={() => {
            close()
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
        >
          CONCI
        </Link>
      </div>

      {/* Lista que abre embaixo, só no celular */}
      {open && <div className="md:hidden flex flex-col gap-1 pt-3">{links(true)}</div>}
    </nav>
  )
}
