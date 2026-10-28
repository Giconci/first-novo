"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OrderList } from "@/components/OrderList";

// /admin/pedidos → todas as vendas, com endereço e botão "Marcar como enviado"
// (a proteção de verdade está na API: só admin recebe todos os pedidos)
export default function AdminPedidosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = session?.user.role === "admin";

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/admin/pedidos");
    else if (status === "authenticated" && !isAdmin) router.push("/");
  }, [status, isAdmin, router]);

  if (!isAdmin) return <p>Carregando...</p>;

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <Link href="/admin" className="underline">← Produtos</Link>
      </div>
      <OrderList admin />
    </div>
  );
}
