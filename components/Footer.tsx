import Link from "next/link"

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
      { href: "/contato", texto: "Contato" },
    ],
  },
  {
    titulo: "Ajuda",
    links: [
      { href: "/duvidas", texto: "Dúvidas frequentes" },
      { href: "/trocas", texto: "Trocas e devoluções" },
      { href: "/meus-pedidos", texto: "Meus pedidos" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-petroleo text-white/80">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="text-2xl font-bold text-white tracking-widest">CONCI</p>
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
        © {new Date().getFullYear()} Conci · Pagamentos processados pelo Mercado Pago
      </div>
    </footer>
  )
}
