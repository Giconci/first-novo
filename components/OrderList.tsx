"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { AddressData } from "@/schemas/addressSchema"

// Formato que vem do GET /api/orders
type Order = {
  id: number
  createdAt: string
  total: number
  status: string
  shippingAddress: AddressData | null
  user: { name: string | null; email: string }
  products: {
    id: number
    quantity: number
    unitPrice: number
    product: { name: string; imageUrl: string | null }
  }[]
}

// Nome e cor de cada status
const STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "Aguardando pagamento", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Pago – enviar", color: "bg-green-100 text-green-800" },
  shipped: { label: "Enviado", color: "bg-blue-100 text-blue-800" },
  rejected: { label: "Recusado", color: "bg-red-100 text-red-800" },
  cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-700" },
}

// Cor dos botões: cinza petróleo (definida no app/globals.css)
const PETROLEO = "bg-petroleo text-white hover:bg-petroleo-escuro"
const PETROLEO_OUTLINE = "border-petroleo text-petroleo hover:bg-petroleo/10"

// Filtros do admin (o cliente sempre vê tudo dele)
const FILTERS = [
  { value: "paid", label: "A enviar" },
  { value: "shipped", label: "Enviados" },
  { value: "pending", label: "Aguardando pagamento" },
  { value: "all", label: "Todos" },
]

// Lista de pedidos.
//   admin = true  → todos os pedidos, com cliente, endereço e botão "Marcar como enviado"
//   admin = false → só os pedidos de quem está logado (a API já filtra)
export function OrderList({ admin = false }: { admin?: boolean }) {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState(admin ? "paid" : "all")
  const [saving, setSaving] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setOrders)
      .catch(() => setError("Não foi possível carregar os pedidos"))
  }, [])

  // Admin muda o status (usa o PATCH /api/orders/:id, que só aceita admin)
  async function changeStatus(id: number, status: string) {
    setSaving(id)
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOrders((prev) => prev?.map((o) => (o.id === id ? { ...o, status } : o)) ?? null)
    } else {
      alert("Não foi possível atualizar o pedido")
    }
    setSaving(null)
  }

  if (error) return <p className="text-destructive">{error}</p>
  if (!orders) return <p>Carregando pedidos...</p>

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="space-y-4">
      {admin && (
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant="outline"
              className={filter === f.value ? PETROLEO : PETROLEO_OUTLINE}
              onClick={() => setFilter(f.value)}
            >
              {f.label} ({f.value === "all" ? orders.length : orders.filter((o) => o.status === f.value).length})
            </Button>
          ))}
        </div>
      )}

      {visible.length === 0 && <p className="text-gray-600">Nenhum pedido por aqui.</p>}

      {visible.map((order) => {
        const st = STATUS[order.status] ?? STATUS.pending
        const a = order.shippingAddress
        return (
          <div key={order.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">Pedido nº {order.id}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
              <span className={`text-sm px-2 py-1 rounded ${st.color}`}>{st.label}</span>
            </div>

            <ul className="text-sm divide-y">
              {order.products.map((item) => (
                <li key={item.id} className="flex justify-between py-1">
                  <span>{item.quantity}× {item.product.name}</span>
                  <span>R$ {(item.unitPrice * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <p className="text-right font-bold">Total: R$ {order.total.toFixed(2)}</p>

            {a && (
              <div className="text-sm bg-gray-50 rounded p-3">
                <p className="font-semibold">Entrega para {a.name}</p>
                {admin && <p>{order.user.email} · Tel. {a.phone}</p>}
                <p>
                  {a.street}, {a.number}
                  {a.complement ? ` – ${a.complement}` : ""}
                </p>
                <p>{a.district} – {a.city}/{a.state} – CEP {a.cep}</p>
              </div>
            )}

            {admin && order.status === "paid" && (
              <div className="text-right">
                <Button
                  className={PETROLEO}
                  disabled={saving === order.id}
                  onClick={() => changeStatus(order.id, "shipped")}
                >
                  {saving === order.id ? "Salvando..." : "Marcar como enviado"}
                </Button>
              </div>
            )}
            {admin && order.status === "shipped" && (
              <div className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className={PETROLEO_OUTLINE}
                  disabled={saving === order.id}
                  onClick={() => changeStatus(order.id, "paid")}
                >
                  Desfazer envio
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
