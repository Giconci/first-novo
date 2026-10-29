import * as Sentry from "@sentry/nextjs";

// O Next.js chama register() uma vez quando o servidor liga:
// aqui ligamos o Sentry no runtime certo (node ou edge).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("./sentry.server.config");
  if (process.env.NEXT_RUNTIME === "edge") await import("./sentry.edge.config");
}

// Todo erro em página, API ou Server Component vai para o Sentry
export const onRequestError = Sentry.captureRequestError;
