# Roteiro: código por email (cadastro e login)

## O que já está pronto

O site manda um **código de 6 dígitos por email**:
- no **cadastro** (para confirmar que o email é da pessoa);
- em **todo login** (clientes e admin): email + senha → código no email → entra.

Enquanto o Gmail não estiver configurado, o código aparece **no terminal** do `npm run dev`
(linha `📧 Email para ... Seu código é: 123456`). Dá para testar tudo assim.

### Bibliotecas

| Biblioteca | Faz o quê | Nova? |
|---|---|---|
| **nodemailer** | Envia o email pelo Gmail (o "carteiro") | **Sim** |
| zod | Valida os formulários | Já tinha |
| bcryptjs | Guarda a senha com hash | Já tinha |
| crypto (vem no Node) | Gera o código e o hash do código | Já vem |
| prisma | Salva usuário e códigos no banco | Já tinha |
| next-auth | Só cria a sessão se o código estiver certo | Já tinha |

### Arquivos

| Arquivo | Faz o quê |
|---|---|
| `lib/emailVerification.ts` | Gera, confere e envia o código (usa o nodemailer) |
| `app/api/login-code/route.ts` | 1ª etapa do login: confere email/senha e manda o código |
| `app/api/register/route.ts` | Cria a conta e manda o código |
| `app/api/auth/[...nextauth]/route.ts` | 2ª etapa: só deixa entrar com o código certo |
| `components/EmailCodeStep.tsx` | Tela "digite o código" (cadastro e login) |
| `app/login/page.tsx`, `app/cadastro/page.tsx` | Mostram a tela do código |
| `prisma/schema.prisma` + `prisma/migrations/2026102612*` e `2026102615*` | Coluna `emailVerified` e tabela `EmailCode` |

Regras: código vale **10 min**, uso único, **5 tentativas** erradas invalidam, no máximo **1 código por minuto**. No banco fica só o hash.

---

## Hoje: testar pelo terminal

1. No terminal do site: `Ctrl+C`
2. `npx prisma generate`  (se der `EPERM`, feche o VS Code e rode de novo)
3. `npm run dev`
4. Abra http://localhost:3000/cadastro, cadastre-se, pegue o código no terminal e digite.
5. Saia, vá em http://localhost:3000/login, entre com email/senha, pegue o código novo no terminal.

---

## Depois que o Google liberar a conta da loja

### 1. Gerar a senha de app (no Google, logado na conta da loja)
1. Gmail da loja → foto no canto superior direito → **Gerenciar sua Conta do Google**
2. **Segurança** → **Verificação em duas etapas** → **Ativar** (celular + código SMS)
3. Abra https://myaccount.google.com/apppasswords
4. Nome do app: `loja` → **Criar** → copie as 16 letras (só aparecem uma vez)

### 2. Colar no `.env` (sem espaços na senha)
```
GMAIL_USER=email-da-loja@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```
O `.env` não vai para o GitHub (está no `.gitignore`).

### 3. Reiniciar e testar
`Ctrl+C` → `npm run dev` → cadastre um email seu → o código deve **chegar na caixa de entrada**
(confira o spam). O email aparece na pasta **Enviados** da conta da loja.

### 4. Trocar o admin para um email real
Hoje o admin é `admin@teste.com` (não existe) — com código no login, o código dele não chega
em lugar nenhum. Em `prisma/seed.ts`, troque pelos seus dados:
```ts
await prisma.user.upsert({
  where: { email: "SEU-EMAIL-REAL" },
  update: { passwordHash, role: "admin" },
  create: { name: "Admin", email: "SEU-EMAIL-REAL", passwordHash, role: "admin" },
});
```
Troque também `senha123` por uma senha forte (o seed vai para o GitHub). Depois: `npx prisma db seed`.

### 5. Produção (Vercel) — só quando tudo funcionar local
1. Vercel → projeto → **Settings → Environment Variables**: adicione `GMAIL_USER` e `GMAIL_APP_PASSWORD`
   (mesmos valores do `.env`). Confira se `NEXTAUTH_URL` é o domínio real.
2. Commit e push para `main`.
   ⚠️ Isso **publica o site** e o build roda `prisma migrate deploy` **no banco Neon de produção**
   (cria `emailVerified` e `EmailCode`; usuários antigos ficam marcados como confirmados).
   Sem as variáveis do passo 1, **ninguém consegue entrar** (nem o admin): o código só iria para os logs da Vercel.
3. Rode o seed na produção, se quiser o admin novo lá também.
