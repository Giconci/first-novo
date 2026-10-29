"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/ui/context/CartContext"

type Product = {
  id: number
  name: string
  description: string
  price: number
  imageUrl?: string
  category: string
  stock: number | null
}

export default function ProdutoPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCart()

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) {
          throw new Error("Erro ao carregar produto")
        }
        const data = await res.json()
        setProduct(data)
      } catch (err) {
        setError("Não foi possível carregar o produto.")
      }
    }
    if (id) fetchProduct()
  }, [id])

  if (error) return <p className="p-6 text-red-600">{error}</p>
  if (!product) return <p className="p-6">Carregando produto...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full max-w-md h-64 object-cover rounded mb-4"
        />
      )}
      <p className="text-gray-700 mb-2">{product.description}</p>
      <p className="text-lg font-bold text-petroleo-claro mb-4">
        R$ {product.price ? product.price.toFixed(2) : "0.00"}
      </p>
      {/* stock 0 = esgotado (vazio = sem controle de estoque) */}
      {product.stock === 0 ? (
        <Button disabled className="bg-gray-300 text-gray-600">
          Esgotado
        </Button>
      ) : (
        <Button
          className="bg-petroleo text-white hover:bg-petroleo-escuro"
          onClick={() => addToCart(product)}
        >
          Adicionar ao Carrinho
        </Button>
      )}
    </div>
  )
}
