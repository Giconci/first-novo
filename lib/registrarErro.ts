import * as Sentry from "@sentry/nextjs";

// Para erros capturados por um try/catch: como o catch "segura" o erro, o Sentry
// não fica sabendo sozinho. Esta função avisa o Sentry e mantém o erro no log.
//
// area: aparece como etiqueta no painel, para filtrar (ex.: "checkout")
// dados: ajudam a investigar. Só números de pedido/pagamento, nada de dado pessoal.
export async function registrarErro(
  error: unknown,
  area: string,
  dados: Record<string, string | number> = {}
) {
  console.error(`Erro em ${area}:`, dados, error);

  // Uma falha no Sentry nunca pode atrapalhar o checkout ou o pagamento
  try {
    Sentry.captureException(error, { tags: { area }, extra: dados });

    // Na Vercel, o servidor pode "dormir" logo depois de responder:
    // espera o envio terminar, por no máximo 2 segundos
    await Sentry.flush(2000);
  } catch (falhaNoSentry) {
    console.error("Não foi possível avisar o Sentry:", falhaNoSentry);
  }
}
