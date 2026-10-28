"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useCart } from "@/components/ui/context/CartContext" // <-- Importando o contexto
import { Button, buttonVariants } from "@/components/ui/button"
import { AddressForm } from "@/components/AddressForm"
import type { AddressData } from "@/schemas/addressSchema"

export default function CarrinhoPage() {
  // total agora vem pronto do contexto (preço x quantidade)
  const { cart, total, addToCart, decreaseQuantity, removeFromCart } = useCart()
  // Quem está logado (o carrinho é livre, mas finalizar exige conta)
  const { status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Manda só id + quantidade + endereço; o servidor busca os preços no banco
  async function finalizarCompra(address: AddressData) {
    setLoading(true)
    setError("")

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        address,
      }),
    })

    // Sem login: vai para o login e volta para o carrinho depois
    if (res.status === 401) {
      window.location.href = "/login?callbackUrl=/carrinho"
      return
    }

    const data = await res.json()
    if (!res.ok || !data.url) {
      setError(data.error ?? "Não foi possível finalizar a compra")
      setLoading(false)
      return
    }

    // Vai para a página de pagamento do Mercado Pago
    window.location.href = data.url
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Seu Carrinho</h1>

      {cart.length === 0 ? (
        <p className="text-gray-600">Seu carrinho está vazio.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 border rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-500">R$ {item.price.toFixed(2)} cada</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Controle de quantidade: − 2 + */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => decreaseQuantity(item.id)}>
                    −
                  </Button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <Button variant="outline" size="sm" onClick={() => addToCart(item)}>
                    +
                  </Button>
                </div>

                {/* Subtotal do item */}
                <p className="w-24 text-right font-semibold">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </p>

                <Button variant="destructive" onClick={() => removeFromCart(item.id)}>
                  Remover
                </Button>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="mt-6 text-right">
            <h2 className="text-xl font-bold">Total: R$ {total.toFixed(2)}</h2>
            {status === "unauthenticated" ? (
              // 🔒 Sem conta não finaliza: entra ou cadastra e volta pra cá
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-600">
                  Para finalizar a compra, entre na sua conta.
                </p>
                <div className="flex justify-end gap-2">
                  <Link
                    href="/cadastro?callbackUrl=/carrinho"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Criar conta
                  </Link>
                  <Link
                    href="/login?callbackUrl=/carrinho"
                    className={buttonVariants({ className: "bg-petroleo text-white hover:bg-petroleo-escuro" })}
                  >
                    Entrar
                  </Link>
                </div>
              </div>
            ) : status === "authenticated" ? (
              // Logado: preenche o endereço e vai para o pagamento
              <div className="mt-6 border rounded-lg p-4">
                <AddressForm onSubmit={finalizarCompra} loading={loading} />
              </div>
            ) : null}
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
