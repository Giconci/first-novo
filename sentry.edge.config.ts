// Sentry no runtime "edge" (código que roda mais perto do usuário, ex.: proxy).
// Carregado pelo instrumentation.ts. Sem NEXT_PUBLIC_SENTRY_DSN, fica desligado.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.VERCEL_ENV ?? "development",
  tracesSampleRate: 0.1,
});
