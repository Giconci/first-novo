-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "stock" DROP NOT NULL,
ALTER COLUMN "stock" DROP DEFAULT;

-- Nenhum produto usava o estoque (todos estavam com 0). Vazio = "sem controle",
-- para nenhum produto sumir da loja até o admin cadastrar as quantidades.
UPDATE "Product" SET "stock" = NULL WHERE "stock" = 0;
