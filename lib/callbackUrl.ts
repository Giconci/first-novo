// Lê o ?callbackUrl= do endereço: para onde voltar depois do login/cadastro.
// Ex.: /login?callbackUrl=/carrinho → volta pro carrinho.
// Só aceita caminhos do próprio site (começando com "/", nunca "//outro-site").
export function getCallbackUrl(fallback: string) {
  const target = new URLSearchParams(window.location.search).get("callbackUrl")
  return target && target.startsWith("/") && !target.startsWith("//") ? target : fallback
}

// Monta um link que leva o callbackUrl junto (ex.: do login para o cadastro)
export function withCallbackUrl(path: string) {
  const target = new URLSearchParams(window.location.search).get("callbackUrl")
  return target ? `${path}?callbackUrl=${encodeURIComponent(target)}` : path
}
