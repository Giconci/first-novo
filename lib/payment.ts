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

  return prisma.order.update({
    where: { id: orderId },
    data: { status: toOrderStatus(payment.status), paymentId: String(payment.id) },
  });
}
