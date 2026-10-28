# Loja — e-commerce com Next.js e Mercado Pago

Loja virtual de roupas (bonés e camisetas) com carrinho, login com código por email, pagamento pelo Mercado Pago e painel de administração.

🔗 **Demo:** https://first-novo.vercel.app
> O pagamento está em **modo de teste**: nenhuma cobrança é real.

## Funcionalidades

**Cliente**
- Catálogo por categoria, busca e página de produto
- Carrinho com quantidade, salvo no navegador (`localStorage`)
- Cadastro e login com **código de 6 dígitos enviado por email**
- Endereço de entrega com **preenchimento automático pelo CEP** (ViaCEP)
- Pagamento pelo **Mercado Pago Checkout Pro** (Pix, cartão, boleto)
- Página "Meus pedidos" com o status de cada compra
- Layout responsivo com menu hambúrguer no celular

**Administrador**
- Cadastro, edição e exclusão de produtos com upload de foto (Vercel Blob)
- Lista de pedidos com filtros (a enviar, enviados, aguardando pagamento) e botão "Marcar como enviado"

## Tecnologias

| Área | Ferramenta |
|---|---|
| Framework | Next.js (App Router) + React + TypeScript |
| Estilo | Tailwind CSS + shadcn/ui |
| Banco de dados | PostgreSQL (Neon em produção) + Prisma ORM |
| Autenticação | NextAuth (credenciais + código por email) + bcrypt |
| Validação | Zod + React Hook Form (mesmo schema no cliente e no servidor) |
| Pagamento | Mercado Pago (Checkout Pro + webhook) |
| Email | Nodemailer (Gmail) |
| Imagens | Vercel Blob |
| Deploy | Vercel |

## Como o pagamento funciona

```
Carrinho ──► POST /api/checkout ──► cria o pedido (pending) e a preferência no Mercado Pago
                                          │
                                          ▼
                              cliente paga no Mercado Pago
                                          │
               ┌──────────────────────────┴──────────────────────────┐
               ▼                                                     ▼
  volta para /pedido/sucesso                     Mercado Pago chama /api/webhooks/mercadopago
               │                                                     │
               └───────────► syncPayment() consulta o pagamento ◄────┘
                             e atualiza o status do pedido
```

- O **preço e o total são calculados no servidor**, a partir do banco. O valor enviado pelo navegador nunca é usado.
- O status só muda depois de **consultar o pagamento direto no Mercado Pago**. Assim, uma chamada falsa ao webhook não marca um pedido como pago.
- O preço de cada item fica salvo no pedido (`unitPrice`). Se o produto mudar de preço depois, o histórico continua correto.

## Rodando localmente

Pré-requisitos: Node.js 20+ e PostgreSQL.

```bash
git clone https://github.com/Giconci/first-novo.git
cd first-novo
npm install

cp .env.example .env      # preencha os valores
npx prisma migrate dev    # cria as tabelas
npx prisma db seed        # cria o usuário admin local

npm run dev               # http://localhost:3000
```

Sem o Gmail configurado, o código de login aparece no terminal do `npm run dev`.

## Estrutura

```
app/            páginas e rotas de API (App Router)
  api/          checkout, webhook, pedidos, produtos, cadastro, login
  admin/        painel do administrador
components/     componentes de interface (NavBar, Hero, OrderList, AddressForm...)
lib/            regras do servidor (sessão, Mercado Pago, pagamento, email)
schemas/        validações Zod compartilhadas entre cliente e servidor
prisma/         schema do banco, migrations e seed
```

## Próximos passos

- [ ] Testes automatizados do checkout e do webhook
- [ ] Baixar o estoque quando o pedido for pago
- [ ] Chave de produção do Mercado Pago
