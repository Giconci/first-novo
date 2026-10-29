import { Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { getMercadoPago } from "@/lib/mercadopago";

// Status do Mercado Pago → status do nosso pedido
function toOrderStatus(mpStatus?: string) {
  switch (mpStatus) {
    case "approved":
      return "paid";
    case "rejected":
      return "rejected";
    case "cancelled":
    case "refunded":
    case "charged_back":
      return "cancelled";
    default:
      return "pending"; // pending, in_process, authorized...
  }
}

// Pergunta ao Mercado Pago como está o pagamento e atualiza o pedido.
// Nunca confiamos no "status" que vem no endereço: alguém poderia digitar
// ?status=approved na mão. Quem diz se foi pago é sempre o Mercado Pago.
// (Vai ser usada também pelo webhook no passo 5.)
export async function syncPayment(paymentId: string) {
  const payment = await new Payment(getMercadoPago()).get({ id: paymentId });

  // external_reference = id do nosso pedido (gravado no /api/checkout)
  const orderId = Number(payment.external_reference);
  if (!Number.isInteger(orderId)) return null;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return null;

  // Pedido já enviado não volta para trás
  if (order.status === "shipped") return order;

  const novoStatus = toOrderStatus(payment.status);

  return prisma.$transaction(async (tx) => {
    // Só muda se ninguém mudou antes: o webhook e a página de retorno podem
    // chegar juntos para o mesmo pagamento, e o estoque só pode mexer UMA vez
    const { count } = await tx.order.updateMany({
      where: { id: orderId, status: order.status },
      data: { status: novoStatus, paymentId: String(payment.id) },
    });
    if (count === 0) return tx.order.findUnique({ where: { id: orderId } });

    // Pago agora → tira do estoque. Estornado depois de pago → devolve.
    const baixa = novoStatus === "paid" && order.status !== "paid";
    const devolve = order.status === "paid" && novoStatus === "cancelled";
    if (baixa || devolve) {
      const itens = await tx.orderItem.findMany({ where: { orderId } });
      for (const item of itens) {
        await tx.product.updateMany({
          where: { id: item.productId, stock: { not: null } }, // sem controle: não mexe
          data: { stock: baixa ? { decrement: item.quantity } : { increment: item.quantity } },
        });
      }
      // Duas pessoas pagaram a última unidade ao mesmo tempo: não deixa negativo
      if (baixa) await tx.product.updateMany({ where: { stock: { lt: 0 } }, data: { stock: 0 } });
    }

    return tx.order.findUnique({ where: { id: orderId } });
  });
}
