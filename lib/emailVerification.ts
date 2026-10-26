import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

const CODE_TTL_MS = 10 * 60 * 1000; // código vale 10 minutos
const MAX_ATTEMPTS = 5; // depois disso o código é invalidado
const RESEND_INTERVAL_MS = 60 * 1000; // no máximo um código por minuto

// No banco guardamos só o hash do código. Misturamos o NEXTAUTH_SECRET e o id
// do usuário pra que ninguém consiga descobrir o código a partir do banco.
function hashCode(userId: string, code: string) {
  return crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET ?? "")
    .update(userId + ":" + code)
    .digest("hex");
}

// Gera um código novo de 6 dígitos, salva o hash e manda por email.
// Retorna false se já foi enviado um código há menos de 1 minuto.
export async function sendEmailCode(user: { id: string; email: string }) {
  const last = await prisma.emailCode.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  if (last && Date.now() - last.createdAt.getTime() < RESEND_INTERVAL_MS) {
    return false;
  }

  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

  // Só o código mais recente vale
  await prisma.emailCode.deleteMany({ where: { userId: user.id } });
  await prisma.emailCode.create({
    data: {
      userId: user.id,
      codeHash: hashCode(user.id, code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  await sendEmail(
    user.email,
    "Seu código de acesso",
    `<p>Seu código é:</p>
     <p style="font-size:28px;font-weight:bold;letter-spacing:4px">${code}</p>
     <p>Ele expira em 10 minutos. Se não foi você, ignore este email.</p>`
  );

  return true;
}

// Confere o código digitado. Se estiver certo, apaga o código (uso único).
export async function checkEmailCode(userId: string, code: string) {
  const record = await prisma.emailCode.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt < new Date() || record.attempts >= MAX_ATTEMPTS) {
    return false;
  }

  const expected = Buffer.from(record.codeHash);
  const received = Buffer.from(hashCode(userId, code));
  const ok = expected.length === received.length && crypto.timingSafeEqual(expected, received);

  if (!ok) {
    await prisma.emailCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return false;
  }

  await prisma.emailCode.deleteMany({ where: { userId } });
  return true;
}

async function sendEmail(to: string, subject: string, html: string) {
  // Sem senha de app configurada (ex.: antes de configurar o Gmail),
  // só mostra o email no terminal
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log("📧 Email para", to, "->", html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Loja" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
