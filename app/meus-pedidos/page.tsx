"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OrderList } from "@/components/OrderList";

// /meus-pedidos → o cliente acompanha as compras dele
// (a API /api/orders já devolve só os pedidos de quem está logado)
export default function MeusPedidosPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/meus-pedidos");
  }, [status, router]);

  if (status !== "authenticated") return <p>Carregando...</p>;

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Meus pedidos</h1>
      <OrderList />
    </div>
  );
}
