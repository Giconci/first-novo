import { prisma } from "@/lib/prisma";
import { escapar, sendEmail } from "@/lib/emailVerification";
import { SITE_URL } from "@/lib/site";
import type { AddressData } from "@/schemas/addressSchema";

// Emails automáticos dos pedidos.
//   Cliente: pagamento aprovado, pagamento recusado, pedido cancelado, pedido enviado
//   Admin:   nova venda, estoque acabando
//
// Estas funções NUNCA dão erro para quem chama: se o Gmail falhar, o pedido
// continua valendo e a falha fica só no log. Não há nova tentativa de envio.

export type ProdutoEstoque = { name: string; stock: number | null };

const reais = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

async function buscarPedido(orderId: number) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true } },
      products: { include: { product: { select: { name: true } } } },
    },
  });
}
type Pedido = NonNullable<Awaited<ReturnType<typeof buscarPedido>>>;

async function enviar(para: string, assunto: string, html: string) {
  try {
    await sendEmail(para, assunto, html);
  } catch (error) {
    console.error(`Erro ao enviar email "${assunto}":`, error);
  }
}

// O email do admin vem do banco (role = "admin"), então não precisa de configuração nova
async function emailsDosAdmins() {
  const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { email: true } });
  return admins.map((a) => a.email);
}

function htmlItens(pedido: Pedido) {
  const linhas = pedido.products
    .map((i) => `<li>${i.quantity}× ${escapar(i.product.name)}: ${reais(i.unitPrice * i.quantity)}</li>`)
    .join("");
  return `<ul>${linhas}</ul><p><strong>Total: ${reais(pedido.total)}</strong></p>`;
}

function htmlEndereco(pedido: Pedido, comTelefone = false) {
  const a = pedido.shippingAddress as AddressData | null;
  if (!a) return "";
  const complemento = a.complement ? ` – ${escapar(a.complement)}` : "";
  const telefone = comTelefone ? `<br>Telefone: ${escapar(a.phone)}` : "";
  return `<p><strong>Entrega para ${escapar(a.name)}</strong><br>
    ${escapar(a.street)}, ${escapar(a.number)}${complemento}<br>
    ${escapar(a.district)} – ${escapar(a.city)}/${escapar(a.state)} – CEP ${escapar(a.cep)}${telefone}</p>`;
}

const linkMeusPedidos = `<p><a href="${SITE_URL}/meus-pedidos">Ver meus pedidos</a></p>`;
const linkCarrinho = `<p><a href="${SITE_URL}/carrinho">Voltar ao carrinho</a></p>`;

// Monta o email para o cliente conforme a mudança de status.
// Mudança que não precisa de aviso devolve null.
function emailDoCliente(pedido: Pedido, de: string, para: string) {
  const n = pedido.id;

  // Enviado → pago é o admin desfazendo um clique, não um pagamento novo
  if (para === "paid" && de !== "shipped") {
    return {
      assunto: `Pagamento aprovado: pedido nº ${n}`,
      html: `<p>Recebemos seu pedido e o pagamento foi aprovado. Já estamos separando tudo.</p>
        ${htmlItens(pedido)}${htmlEndereco(pedido)}${linkMeusPedidos}`,
    };
  }

  // Só a partir de "pending": novas recusas seguidas não geram outro email
  if (para === "rejected" && de === "pending") {
    return {
      assunto: `Pagamento não aprovado: pedido nº ${n}`,
      html: `<p>O pagamento do pedido nº ${n} não foi aprovado e nenhum valor foi cobrado.
        Você pode tentar de novo com outra forma de pagamento.</p>${linkCarrinho}`,
    };
  }

  if (para === "cancelled") {
    const naoPagou = de === "pending" || de === "rejected";
    return {
      assunto: `Pedido nº ${n} cancelado`,
      html: naoPagou
        ? `<p>O pedido nº ${n} foi cancelado e nenhum valor foi cobrado.</p>${linkCarrinho}`
        : `<p>O pedido nº ${n} foi cancelado. Se você tiver dúvidas sobre o valor pago,
           é só responder este email.</p>${linkMeusPedidos}`,
    };
  }

  if (para === "shipped") {
    return {
      assunto: `Pedido nº ${n} enviado`,
      html: `<p>Seu pedido já está a caminho!</p>
        ${htmlItens(pedido)}${htmlEndereco(pedido)}${linkMeusPedidos}`,
    };
  }

  return null;
}

// Chamar depois que o status do pedido MUDOU de verdade
export async function avisarCliente(orderId: number, de: string, para: string) {
  try {
    const pedido = await buscarPedido(orderId);
    if (!pedido) return;
    const email = emailDoCliente(pedido, de, para);
    if (email) await enviar(pedido.user.email, email.assunto, email.html);
  } catch (error) {
    console.error(`Erro ao preparar email do pedido ${orderId}:`, error);
  }
}

export async function avisarAdminNovaVenda(orderId: number) {
  try {
    const [pedido, admins] = await Promise.all([buscarPedido(orderId), emailsDosAdmins()]);
    if (!pedido) return;
    const comprador = escapar(pedido.user.name ?? pedido.user.email);
    const html = `<p><strong>Nova venda!</strong> Pedido nº ${pedido.id}, de ${comprador}
      (${escapar(pedido.user.email)}).</p>
      ${htmlItens(pedido)}${htmlEndereco(pedido, true)}
      <p><a href="${SITE_URL}/admin/pedidos">Abrir pedidos no painel</a></p>`;
    await Promise.all(
      admins.map((email) => enviar(email, `Nova venda: pedido nº ${pedido.id} (${reais(pedido.total)})`, html))
    );
  } catch (error) {
    console.error(`Erro ao preparar aviso de venda do pedido ${orderId}:`, error);
  }
}

export async function avisarAdminEstoqueBaixo(produtos: ProdutoEstoque[]) {
  if (produtos.length === 0) return;
  try {
    const admins = await emailsDosAdmins();
    const linhas = produtos
      .map((p) => `<li>${escapar(p.name)}: ${p.stock === 0 ? "esgotado" : `${p.stock} em estoque`}</li>`)
      .join("");
    const html = `<p>Hora de repor:</p><ul>${linhas}</ul>
      <p><a href="${SITE_URL}/admin">Abrir o painel</a></p>`;
    await Promise.all(admins.map((email) => enviar(email, "Estoque acabando", html)));
  } catch (error) {
    console.error("Erro ao preparar aviso de estoque:", error);
  }
}
