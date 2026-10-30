// Produto no formato que o carrinho guarda
export type CartProduct = {
  id: number
  name: string
  description: string
  price: number
  imageUrl?: string
  category: string
}

// Produto do banco (campos podem vir vazios) → formato que o carrinho espera.
// Fica fora do components/AddToCartButton.tsx porque roda no servidor.
export function toCartProduct(p: {
  id: number
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  category: string | null
}): CartProduct {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    price: p.price,
    imageUrl: p.imageUrl ?? undefined,
    category: p.category ?? "",
  }
}
