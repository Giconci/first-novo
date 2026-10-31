// O admin fica no tema claro (tabelas e formulários foram feitos para fundo branco).
// A loja inteira é escura; a classe tema-claro (app/globals.css) volta as cores só aqui.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="tema-claro -m-6 p-6 min-h-full">{children}</div>
}
