import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkEmailCode } from "@/lib/emailVerification";

// Configuração do login. Fica aqui (e não dentro da rota) para que outras
// rotas consigam saber quem está logado com getServerSession(authOptions).
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        code: { label: "Código", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        const code = credentials?.code;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        // 2ª etapa: só entra com o código que chegou no email
        // (a tela lê essa mensagem pra avisar "código inválido")
        if (!code || !(await checkEmailCode(user.id, code))) {
          throw new Error("INVALID_CODE");
        }

        // Acertar o código prova que o email é dessa pessoa
        if (!user.emailVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
        }

        // 🔒 Admin é quem tem o email do ADMIN_EMAIL (.env / Vercel).
        // Chegando aqui, a pessoa já acertou senha E código enviado para esse
        // email, ou seja, provou que é dona dele. Qualquer outro entra como cliente.
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const isAdmin = !!adminEmail && user.email.toLowerCase() === adminEmail;

        // Deixa o banco igual (aparece "admin" no Prisma Studio / Neon)
        if (isAdmin && user.role !== "admin") {
          await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } });
        }

        // ✅ Retorna objeto compatível com User
        return {
          id: String(user.id),
          name: user.name ?? "", // garante string
          email: user.email,
          role: isAdmin ? "admin" : "customer",
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET, // ⚠️ precisa estar definido no .env
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub; // id do usuário (para ligar pedidos a ele)
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
};
