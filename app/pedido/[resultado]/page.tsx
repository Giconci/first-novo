import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { syncPayment } from "@/lib/payment";
import { ClearCart } from "../ClearCart";
import type { AddressData } from "@/schemas/addressSchema";

// Uma página só para os 3 endereços de volta do Mercado Pago:
//   /pedido/sucesso   /pedido/pendente   /pedido/falha
// O Mercado Pago manda junto ?payment_id=...&external_reference=<id do pedido>
const RESULTADOS = ["sucesso", "pendente", "falha"];

const MENSAGENS: Record<string, { title: string; text: string }> = {
  paid: {
    title: "✅ Pagamento aprovado!",
    text: "Obrigado pela compra. Já estamos separando seu pedido.",
  },
  pending: {
    title: "⏳ Pagamento em análise",
    text: "Se você escolheu Pix ou boleto, o pedido é confirmado assim que o pagamento cair.",
  },
  rejected: {
    title: "❌ Pagamento não aprovado",
    text: "Nenhum valor foi cobrado. Seu carrinho continua salvo para tentar de novo.",
  },
  cancelled: {
    title: "❌ Pagamento cancelado",
    text: "Nenhum valor foi cobrado. Seu carrinho continua salvo para tentar de novo.",
  },
  shipped: {
    title: "📦 Pedido enviado!",
    text: "Seu pedido já está a caminho.",
  },
};

export default async function PedidoPage(props: PageProps<"/pedido/[resultado]">) {
  const { resultado } = await props.params;
  if (!RESULTADOS.includes(resultado)) notFound();

  const query = await props.searchParams;
  const paymentId = typeof query.payment_id === "string" ? query.payment_id : "";
  const orderRef = typeof query.external_reference === "string" ? query.external_reference : "";

  const user = await getSessionUser();
  if (!user) {
    return (
      <Box title="Faça login para ver seu pedido">
        <Link href="/login" className="underline">Entrar</Link>
      </Box>
    );
  }

  // 1) Confirma com o Mercado Pago e atualiza o pedido no banco
  //    (se o cliente desistiu, o payment_id vem "null")
  if (/^\d+$/.test(paymentId)) {
    try {
      await syncPayment(paymentId);
    } catch (error) {
      console.error("Erro ao consultar pagamento no Mercado Pago:", error);
    }
  }

  // 2) Busca o pedido — só mostra se for do cliente logado (ou para o admin)
  const orderId = Number(orderRef);
  const order = Number.isInteger(orderId) && orderId > 0
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: { products: { include: { product: true } } },
      })
    : null;
  const canSee = order && (order.userId === user.id || user.role === "admin");

  if (!order || !canSee) {
    const voltar = resultado === "falha"
      ? "O pagamento não foi concluído. Seu carrinho continua salvo."
      : "Não encontramos esse pedido.";
    return (
      <Box title="Pedido">
        <p>{voltar}</p>
        <Link href="/carrinho" className="underline">Voltar ao carrinho</Link>
      </Box>
    );
  }

  const msg = MENSAGENS[order.status] ?? MENSAGENS.pending;
  const address = order.shippingAddress as AddressData | null;
  const deuCerto = order.status === "paid" || order.status === "pending" || order.status === "shipped";

  return (
    <Box title={msg.title}>
      {/* Pedido feito (pago ou aguardando Pix): o carrinho já virou pedido */}
      {deuCerto && <ClearCart />}

      <p>{msg.text}</p>
      <p className="text-sm text-gray-500">Pedido nº {order.id}</p>

      <ul className="divide-y border rounded-lg">
        {order.products.map((item) => (
          <li key={item.id} className="flex justify-between p-3">
            <span>{item.quantity}× {item.product.name}</span>
            <span>R$ {(item.unitPrice * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <p className="text-right font-bold">Total: R$ {order.total.toFixed(2)}</p>

      {address && (
        <div className="text-sm border rounded-lg p-3">
          <p className="font-semibold">Entrega para {address.name}</p>
          <p>
            {address.street}, {address.number}
            {address.complement ? ` – ${address.complement}` : ""}
          </p>
          <p>{address.district} – {address.city}/{address.state} – CEP {address.cep}</p>
        </div>
      )}

      <Link href={deuCerto ? "/" : "/carrinho"} className="underline">
        {deuCerto ? "Continuar comprando" : "Voltar ao carrinho"}
      </Link>
    </Box>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children}
    </div>
  );
}
