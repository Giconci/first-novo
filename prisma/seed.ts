import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Credenciais do admin vêm do .env (nunca ficam no código)
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env antes de rodar o seed.");
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD precisa ter pelo menos 12 caracteres.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Cria ou promove o admin real (sem duplicar)
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "admin" },
    create: {
      name: "Admin",
      email,
      passwordHash,
      role: "admin",
      emailVerified: new Date(),
    },
  });

  // Só o ADMIN_EMAIL é admin; qualquer outro admin vira cliente
  await prisma.user.updateMany({
    where: { role: "admin", email: { not: email } },
    data: { role: "customer" },
  });

  console.log(`Seed concluído. Admin: ${email}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
