import Image from "next/image";
import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero";
import { QuickAddButton } from "@/components/AddToCartButton";
import { toCartProduct } from "@/lib/cart";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { disponivel } from "@/lib/stock";
import { CATEGORIES } from "@/lib/categories";
import { TruckIcon, QrCodeIcon, ArrowPathIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

// Busca no banco a cada visita (produto novo ou esgotado aparece na hora)
export const dynamic = "force-dynamic";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
};

// 🔹 As duas vitrines da home. Para trocar os produtos em destaque,
// mude só a categoria (nome igual ao do admin, ver lib/categories.ts) e o título aqui.
const HOME_SECTIONS = {
  top: { category: "Boné", title: "Bonés" },
  bottom: { category: "Camiseta", title: "Camisetas" },
};

const sameCategory = (a: string | null | undefined, b: string) =>
  (a ?? "").toLowerCase() === b.toLowerCase();

// ✏️ Faixa de vantagens abaixo do banner (textos de exemplo)
const VANTAGENS = [
  { icon: TruckIcon, titulo: "Entrega no Brasil todo", texto: "Envio em até 2 dias úteis" },
  { icon: QrCodeIcon, titulo: "Pix ou cartão", texto: "Em até 12x no cartão" },
  { icon: ArrowPathIcon, titulo: "Troca grátis", texto: "Primeira troca em 30 dias" },
  { icon: ShieldCheckIcon, titulo: "Compra segura", texto: "Pagamento pelo Mercado Pago" },
];

// Título da vitrine + "Ver todos" levando para a categoria em /produtos
function SectionTitle({ title, category }: { title: string; category: string }) {
  const slug = CATEGORIES.find((c) => sameCategory(c.label, category))?.slug;
  return (
    <div className="flex items-baseline justify-between mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Link
        href={slug ? `/produtos?categoria=${slug}` : "/produtos"}
        className="text-sm text-forte hover:underline"
      >
        Ver todos →
      </Link>
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p className="text-muted-foreground">Novidades em breve.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="border border-transparent rounded-lg p-4 flex flex-col bg-card" // borda invisível (para voltar: tire "border-transparent" e ponha "shadow-sm")
        >
          <div className="relative group h-48">
            {product.imageUrl && (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="object-cover rounded"
              />
            )}
            {/* Quick Add no meio da foto:
                celular (sem mouse) → sempre visível
                computador (md:)    → só aparece ao passar o mouse */}
            <div className="absolute inset-0 flex md:hidden md:group-hover:flex items-center justify-center rounded md:bg-black/20">
              <QuickAddButton product={toCartProduct(product)} />
            </div>
          </div>

          <div className="mt-3">
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-sm text-muted-foreground">{product.description}</p>
            {/* Cinza petróleo claro (cores no app/globals.css) */}
            <p className="text-lg font-bold text-forte mt-2">
              R$ {product.price.toFixed(2)}
            </p>

            <Link href={`/produto/${product.id}`}>
              <Button className="mt-2">
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage() {
  // Mesmo filtro da /api/products?home=true: marcados para a home, à venda e não arquivados
  const products = await prisma.product.findMany({
    where: { showOnHome: true, archived: false, ...disponivel },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen -m-6"> {/* -m-6 encosta nas bordas */}
      <Hero />

      {/* Vantagens logo abaixo do banner: carrossel sem fim (velocidade no app/globals.css).
          São 2 cópias iguais lado a lado. A faixa anda até o fim da 1ª cópia e recomeça,
          e como a 2ª está no mesmo lugar, o salto não aparece.
          Quem pediu ao computador para reduzir animações vê a faixa parada. */}
      <div className="overflow-hidden bg-marca border-y">
        <div className="flex w-max animate-carrossel motion-reduce:w-full motion-reduce:animate-none">
          {[0, 1].map((copia) => (
            <div
              key={copia}
              aria-hidden={copia === 1} // leitor de tela lê só a 1ª cópia
              className={`flex min-w-screen shrink-0 justify-around gap-12 px-6 py-5 text-sm motion-reduce:min-w-0 motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:gap-6 ${copia === 1 ? "motion-reduce:hidden" : ""}`}
            >
              {VANTAGENS.map((v) => (
                <div key={v.titulo} className="flex items-center gap-3 whitespace-nowrap">
                  <v.icon className="h-7 w-7 shrink-0 text-white" />
                  <div>
                    <p className="font-semibold text-white">{v.titulo}</p>
                    <p className="text-muted-foreground">{v.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Vitrine de cima */}
      <div className="p-6 mt-12" id="produtos">
        <SectionTitle title={HOME_SECTIONS.top.title} category={HOME_SECTIONS.top.category} />
        <ProductGrid
          products={products.filter((p) => sameCategory(p.category, HOME_SECTIONS.top.category))}
        />
      </div>

      {/* Faixa da história: chama para a página /sobre.
          Fundo pérola e todas as letras em cinza escuro (cores no app/globals.css) */}
      <section className="mt-12 bg-perola text-cinza-escuro rounded-lg mx-6 px-6 py-12 text-center">
        <p className="text-sm uppercase tracking-widest">Desde 2019</p>
        <h2 className="text-2xl md:text-3xl font-bold mt-2">Feito em Curitiba, pensado pra durar</h2>
        <p className="mt-3 max-w-xl mx-auto">
          Começamos com 50 bonés bordados numa garagem. Hoje enviamos para todo o Brasil,
          com o mesmo cuidado em cada peça.
        </p>
        {/* Botão também pérola, com borda e letra cinza escuro; ao passar o mouse continua neon */}
        <Link
          href="/sobre"
          className="inline-block mt-6 rounded-md btn-neon border border-cinza-escuro px-6 py-3 font-medium [--btn-fundo:var(--color-perola)] [--btn-texto:var(--color-cinza-escuro)]"
        >
          Conheça nossa história
        </Link>
      </section>

      {/* Vitrine de baixo */}
      <div className="p-6 mt-12 pb-16">
        <SectionTitle title={HOME_SECTIONS.bottom.title} category={HOME_SECTIONS.bottom.category} />
        <ProductGrid
          products={products.filter((p) => sameCategory(p.category, HOME_SECTIONS.bottom.category))}
        />
      </div>
    </div>
  );
}
