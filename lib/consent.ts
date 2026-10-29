// Escolha do visitante sobre cookies (LGPD).
//   "all"       → aceitou tudo (essenciais + medição/marketing)
//   "essential" → só o necessário para o site funcionar (login e carrinho)
// Fica num cookie (e não no localStorage) para o servidor também conseguir ler
// com cookies() do "next/headers", quando um dia o site tiver analytics.
export type Consent = "all" | "essential";

export const CONSENT_COOKIE = "conci_consent";
const UM_ANO = 60 * 60 * 24 * 365;

// Eventos para os componentes conversarem sem recarregar a página
export const CONSENT_CHANGED = "conci:consent";    // a escolha mudou
export const OPEN_COOKIE_BANNER = "conci:abrir-cookies"; // reabrir o aviso

export function readConsent(): Consent | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(all|essential)`));
  return (match?.[1] as Consent) ?? null;
}

export function saveConsent(value: Consent) {
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${UM_ANO}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED, { detail: value }));
}

// Use antes de carregar qualquer script de medição ou anúncio
export const canTrack = () => readConsent() === "all";
