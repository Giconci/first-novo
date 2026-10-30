// Endereço público do site, usado no SEO (sitemap, robots, prévia de link no WhatsApp).
// Na Vercel ele vem sozinho (VERCEL_PROJECT_PRODUCTION_URL).
// Se um dia tiver domínio próprio, defina NEXT_PUBLIC_SITE_URL="https://seudominio.com.br".
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")

export const SITE_NAME = "Conci"

export const SITE_DESCRIPTION =
  "Bonés, camisetas, calças e tênis feitos em Curitiba. Envio para todo o Brasil, Pix ou cartão em até 12x."
