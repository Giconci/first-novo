// Molde das páginas institucionais (Sobre, Contato, Trocas, Dúvidas):
// faixa de título em cinza petróleo + conteúdo centralizado.
export function InfoPage({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="-m-6"> {/* ocupa a largura toda (o layout tem p-6) */}
      <section className="bg-petroleo text-white px-6 py-14 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
        {subtitle && <p className="mt-3 text-white/80 max-w-xl mx-auto">{subtitle}</p>}
      </section>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10 text-gray-700 leading-relaxed">
        {children}
      </div>
    </div>
  )
}

// Bloco com título dentro da página
export function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-petroleo mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
