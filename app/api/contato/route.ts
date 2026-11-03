import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/emailVerification";

// ✏️ Email que recebe as mensagens do formulário do portfólio (/sobre-nos)
const DESTINO = "gui.conci@hotmail.com";

const contatoSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(5000),
  // Campo escondido "armadilha": pessoa não vê nem preenche, robô de spam preenche
  site: z.string().max(0).optional(),
});

// Freio contra spam: no máximo 1 mensagem por minuto por IP
// (fica na memória do servidor, então é um freio simples, não uma garantia)
const ultimoEnvio = new Map<string, number>();
const INTERVALO_MS = 60 * 1000;

// Impede que o texto digitado vire HTML dentro do email
function escapar(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  const parsed = contatoSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Preencha nome, email e mensagem corretamente." }, { status: 400 });
  }
  const { fullName, email, message } = parsed.data;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "desconhecido";
  const agora = Date.now();
  const anterior = ultimoEnvio.get(ip);
  if (anterior && agora - anterior < INTERVALO_MS) {
    return NextResponse.json({ error: "Aguarde 1 minuto para enviar outra mensagem." }, { status: 429 });
  }
  ultimoEnvio.set(ip, agora);

  try {
    await sendEmail(
      DESTINO,
      `Portfólio: mensagem de ${fullName}`,
      `<p><strong>Nome:</strong> ${escapar(fullName)}</p>
       <p><strong>Email:</strong> ${escapar(email)}</p>
       <p><strong>Mensagem:</strong></p>
       <p style="white-space:pre-wrap">${escapar(message)}</p>`,
      email // "Responder" vai direto para quem mandou
    );
  } catch (err) {
    ultimoEnvio.delete(ip); // deu erro: deixa tentar de novo
    console.error("Erro ao enviar mensagem do portfólio:", err);
    return NextResponse.json({ error: "Não foi possível enviar agora. Tente pelo WhatsApp." }, { status: 500 });
  }

  return NextResponse.json({ message: "Mensagem enviada! Vou responder em breve." });
}
