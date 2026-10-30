import { cache } from "react"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AddToCartButton } from "@/components/AddToCartButton"
import { toCartProduct } from "@/lib/cart"
import { SITE_NAME } from "@/lib/site"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ id: string }> }

// cache: o generateMetadata e a página usam o mesmo produto, mas o banco é consultado só 1 vez
const getProduct = cache(async (id: string) => {
  const productId = Number(id)
  if (!Number.isInteger(productId)) return null
  const product = await prisma.product.findUnique({ where: { id: productId } })
  return product && !product.archived ? product : null
})

// Título, descrição e foto que aparecem no Google e na prévia do link (WhatsApp, Instagram...)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).id)
  if (!product) return { title: "Produto não encontrado" }

  const description =
    product.description?.slice(0, 160) ||
    `${product.name} por ${formatBRL(product.price)}. Envio para todo o Brasil.`

  return {
    title: product.name,
    description,
    alternates: { canonical: `/produto/${product.id}` },
    openGraph: {
      // o openGraph da página substitui o do layout inteiro, por isso repete siteName/locale
      siteName: SITE_NAME,
      locale: "pt_BR",
      type: "website",
      title: product.name,
      description,
      url: `/produto/${product.id}`,
      images: product.imageUrl ? [{ url: product.imageUrl, alt: product.name }] : undefined,
    },
  }
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default async function ProdutoPage({ params }: Props) {
  const product = await getProduct((await params).id)
  if (!product) notFound()

  const soldOut = product.stock === 0

  // "Dados estruturados": o Google entende que é um produto com preço e estoque
  // e pode mostrar isso direto no resultado da busca.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.imageUrl ?? undefined,
    category: product.category ?? undefined,
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "BRL",
      availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  }

  return (
    <div className="p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      {product.imageUrl && (
        <div className="relative w-full max-w-md h-64 mb-4">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            preload
            className="object-cover rounded"
          />
        </div>
      )}
      <p className="text-gray-700 mb-2">{product.description}</p>
      <p className="text-lg font-bold text-petroleo-claro mb-4">
        R$ {product.price.toFixed(2)}
      </p>
      <AddToCartButton product={toCartProduct(product)} soldOut={soldOut} />
    </div>
  )
}
