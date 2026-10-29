import type { Prisma } from "@prisma/client";

// Estoque do produto (campo stock):
//   null → sem controle (sempre à venda)
//   0    → esgotado: some da loja até o admin repor
//   N    → N unidades; cada venda paga desconta (lib/payment.ts)

// Filtro do Prisma para "pode ser vendido agora"
export const disponivel: Prisma.ProductWhereInput = {
  OR: [{ stock: null }, { stock: { gt: 0 } }],
};

// Lê o campo "stock" do formulário do admin: vazio = sem controle
export function parseStock(valor: FormDataEntryValue | null): number | null {
  const texto = String(valor ?? "").trim();
  if (texto === "") return null;
  const n = Math.floor(Number(texto));
  return Number.isFinite(n) && n >= 0 ? n : null;
}
