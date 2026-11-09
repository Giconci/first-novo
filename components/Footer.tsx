"use client" // precisa saber em qual página está (usePathname)

import Link from "next/link"
import { usePathname } from "next/navigation"

// Rodapé de todas as páginas (fica no app/layout.tsx)
const COLUNAS = [
  {
    titulo: "Loja",
    links: [
      { href: "/produtos", texto: "Todos os produtos" },
      { href: "/produtos?categoria=bone", texto: "Bonés" },
      { href: "/produtos?categoria=camiseta", texto: "Camisetas" },
    ],
  },
  {
    titulo: "A Conci",
    links: [
      { href: "/sobre", texto: "Nossa história" },
      { href: "/sobre-nos", texto: "Sobre nós" },
      { href: "/contato", texto: "Contato" },
    ],
  },
  {
    titulo: "Ajuda",
    links: [
      { href: "/duvidas", texto: "Dúvidas frequentes" },
      { href: "/trocas", texto: "Trocas e devoluções" },
      { href: "/meus-pedidos", texto: "Meus pedidos" },
      { href: "/privacidade", texto: "Privacidade e cookies" },
    ],
  },
]

export function Footer() {
  const pathname = usePathname()

  // Página do portfólio tem visual próprio, sem o rodapé da loja
  if (pathname.startsWith("/sobre-nos")) return null

  return (
    <footer className="bg-steam-escuro text-muted-foreground">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          {/* Mesma fonte da logo da barra do topo (app/layout.tsx) */}
          <p className="font-(family-name:--font-logo) text-3xl text-white tracking-wide">CONCI</p>
          <p className="mt-2 text-sm">Bonés e camisetas feitos em Curitiba.</p>
        </div>

        {COLUNAS.map((col) => (
          <div key={col.titulo}>
            <p className="font-semibold text-white mb-3">{col.titulo}</p>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white hover:underline">
                    {l.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs">
        © {new Date().getFullYear()} Conci · Pagamentos processados pelo Mercado Pago      </div>
    </footer>
  )
}
