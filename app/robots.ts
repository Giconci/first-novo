import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

// Gera /robots.txt: diz ao Google o que ele pode visitar.
// Páginas de conta, compra e admin não servem para a busca.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/carrinho",
        "/pedido",
        "/meus-pedidos",
        "/login",
        "/cadastro",
        "/busca",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
