import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";

// GET /api/sentry-teste → gera um erro de propósito para ver se chega no Sentry.
// Só o admin consegue chamar (senão qualquer um encheria o Sentry de erros).
export async function GET() {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  throw new Error("Teste do Sentry: se você está vendo isto no painel, está funcionando!");
}
