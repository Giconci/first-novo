import { NextRequest, NextResponse } from "next/server";
import { syncPayment } from "@/lib/payment";

// POST /api/webhooks/mercadopago → o Mercado Pago avisa aqui quando um pagamento muda
// (aprovado, recusado, Pix caiu...), mesmo que o cliente tenha fechado a aba.
//
// O aviso só traz o NÚMERO do pagamento, não se foi pago. Por isso chamamos
// syncPayment(), que pergunta ao Mercado Pago o status de verdade. Assim, um
// aviso falso enviado por outra pessoa não consegue marcar pedido como pago.
//
// Só funciona com o site publicado (https): o Mercado Pago não alcança o localhost.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const query = req.nextUrl.searchParams;

  // O Mercado Pago manda em dois formatos:
  //   novo:   { type: "payment", data: { id: "123" } }  (ou ?type=payment&data.id=123)
  //   antigo: ?topic=payment&id=123
  const type = body?.type ?? query.get("type") ?? query.get("topic");
  const paymentId = String(body?.data?.id ?? query.get("data.id") ?? query.get("id") ?? "");

  // Avisos de outras coisas (ex.: merchant_order) não interessam: responde OK
  if (type !== "payment" || !/^\d+$/.test(paymentId)) {
    return NextResponse.json({ ok: true });
  }

  try {
    const order = await syncPayment(paymentId);
    console.log(`Webhook MP: pagamento ${paymentId} → pedido ${order?.id ?? "?"} (${order?.status ?? "não encontrado"})`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    // Erro 500 faz o Mercado Pago tentar de novo mais tarde
    console.error("Webhook MP: erro ao consultar pagamento", paymentId, error);
    return NextResponse.json({ error: "Falha ao processar" }, { status: 500 });
  }
}
