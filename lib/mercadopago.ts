import { MercadoPagoConfig } from "mercadopago";

// Cliente do Mercado Pago. A chave fica no .env (MERCADOPAGO_ACCESS_TOKEN)
// e na Vercel, nunca no código.
export function getMercadoPago() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("Defina MERCADOPAGO_ACCESS_TOKEN no .env");
  }
  return new MercadoPagoConfig({ accessToken });
}
