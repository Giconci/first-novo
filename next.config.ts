import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
   allowedDevOrigins: ["192.168.18.180"],
};

// withSentryConfig envia os "source maps" no build da Vercel, para o Sentry
// mostrar a linha exata do SEU código no erro (e não o código comprimido).
// Precisa de SENTRY_ORG, SENTRY_PROJECT e SENTRY_AUTH_TOKEN na Vercel;
// sem eles o build funciona normal, só não envia os source maps.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI, // menos texto no terminal local
});
