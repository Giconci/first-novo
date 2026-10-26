import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/schemas/registerSchema";
import { sendEmailCode } from "@/lib/emailVerification";

export async function POST(req: Request) {
  try {
    // Valida no servidor com o mesmo schema do formulário
    const parsed = registerSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { name, email, password } = parsed.data;

    // Gera o hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Tenta criar o usuário
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    // Manda o código de confirmação por email.
    // Se o envio falhar, a conta já existe: o usuário pode pedir reenvio na tela.
    let message = "Cadastro feito! Enviamos um código para o seu email.";
    try {
      await sendEmailCode(user);
    } catch (err) {
      console.error("Erro ao enviar código de confirmação:", err);
      message = "Cadastro feito, mas não conseguimos enviar o código. Clique em Reenviar código.";
    }

    return NextResponse.json(
      { message },
      { status: 201 }
    );
  } catch (error: any) {
    // Trata erro de email duplicado
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email já está em uso" },
        { status: 400 }
      );
    }

    // Trata outros erros inesperados
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { error: "Erro interno no cadastro" },
      { status: 500 }
    );
  }
}
