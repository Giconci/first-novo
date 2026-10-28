import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";

export type SessionUser = { id: string; email: string; role: string };

// Quem está logado (ou null). Use nas rotas de API.
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as Partial<SessionUser> | undefined;
  if (!user?.id || !user.email) return null;
  return { id: user.id, email: user.email, role: user.role ?? "customer" };
}

// Para rotas só de admin: devolve o usuário, ou uma resposta de erro pronta.
//   const admin = await requireAdmin();
//   if (admin instanceof NextResponse) return admin;
export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Faça login" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Apenas admin" }, { status: 403 });
  }
  return user;
}
