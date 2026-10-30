import "./globals.css"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { cn } from "@/lib/utils"
import { Providers } from "@/components/Providers"
import { NavBar } from "@/components/NavBar"
import { Footer } from "@/components/Footer"
import { CookieBanner } from "@/components/CookieBanner"
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

// SEO padrão do site. Cada página pode trocar o título;
// o "template" coloca " | Conci" no fim sozinho (ex.: "Contato | Conci").
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Bonés, camisetas e tênis feitos em Curitiba`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      {/* flex-col + flex-1: o rodapé fica sempre no fim da tela, mesmo em página curta */}
      <body className="min-h-screen flex flex-col">
        <Providers>
          <NavBar />
          <main className="p-6 flex-1">{children}</main>
          <Footer />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  )
}
