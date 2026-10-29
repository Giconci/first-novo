// Sentry no navegador do cliente: erros de clique, carrinho, checkout...
// O Next.js carrega este arquivo antes do site ficar interativo.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
  tracesSampleRate: 0.1,
});

// Mede quanto tempo leva para trocar de página
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
