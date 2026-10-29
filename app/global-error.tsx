"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Tela de último recurso: aparece quando algo quebra a página inteira
// (até o layout). Avisa o Sentry e oferece tentar de novo.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "sans-serif", textAlign: "center", padding: "4rem 1rem" }}>
        <h1>Algo deu errado</h1>
        <p>Já fomos avisados e vamos resolver. Tente de novo em instantes.</p>
        <button onClick={reset} style={{ marginTop: 16, padding: "8px 16px" }}>
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
