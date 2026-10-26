import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/schemas/loginSchema";
import { sendEmailCode } from "@/lib/emailVerification";

// 1ª etapa do login: confere email e senha e manda o código pro email
export async function POST(req: Request) {
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  const isValid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!user || !isValid) {
    return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 });
  }

  try {
    const sent = await sendEmailCode(user);
    if (!sent) {
      return NextResponse.json({
        message: "Já enviamos um código há menos de 1 minuto. Confira seu email.",
      });
    }
  } catch (err) {
    console.error("Erro ao enviar código:", err);
    return NextResponse.json({ error: "Não foi possível enviar o código" }, { status: 500 });
  }

  return NextResponse.json({ message: "Enviamos um código para o seu email." });
}
