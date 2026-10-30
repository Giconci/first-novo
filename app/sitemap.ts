import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { CATEGORIES } from "@/lib/categories"
import { disponivel } from "@/lib/stock"
import { SITE_URL } from "@/lib/site"

// Gera /sitemap.xml: a lista de páginas que entregamos ao Google.
// Busca no banco a cada acesso, então produto novo entra sozinho.
export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { archived: false, ...disponivel }, // esgotado e arquivado ficam de fora
    select: { id: true, updatedAt: true },
  })

  const paginas = ["", "/produtos", "/sobre", "/contato", "/duvidas", "/trocas", "/privacidade"]

  return [
    ...paginas.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...CATEGORIES.map((c) => ({ url: `${SITE_URL}/produtos?categoria=${c.slug}` })),
    ...products.map((p) => ({
      url: `${SITE_URL}/produto/${p.id}`,
      lastModified: p.updatedAt,
    })),
  ]
}
