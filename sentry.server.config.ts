// Sentry no servidor (APIs, Server Components, webhook do Mercado Pago).
// Carregado pelo instrumentation.ts. Sem NEXT_PUBLIC_SENTRY_DSN, fica desligado.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.VERCEL_ENV ?? "development", // production | preview | development
  tracesSampleRate: 0.1, // mede a velocidade de 10% das requisições (plano grátis tem limite)
});
