"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { readConsent, saveConsent, OPEN_COOKIE_BANNER, type Consent } from "@/lib/consent"

// Aviso de cookies no rodapé da tela. Aparece até a pessoa escolher,
// e pode ser reaberto pela página /privacidade.
export function CookieBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Só no navegador: o servidor não sabe o que a pessoa escolheu antes
    if (!readConsent()) setOpen(true)
    const reopen = () => setOpen(true)
    window.addEventListener(OPEN_COOKIE_BANNER, reopen)
    return () => window.removeEventListener(OPEN_COOKIE_BANNER, reopen)
  }, [])

  const choose = (value: Consent) => {
    saveConsent(value)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 p-4"
    >
      <div className="max-w-3xl mx-auto rounded-lg bg-white border shadow-lg p-4 md:flex md:items-center md:gap-6">
        <p className="text-sm text-gray-700">
          Usamos cookies essenciais para manter seu login e seu carrinho. Com sua permissão,
          também usaremos cookies de medição para melhorar a loja.{" "}
          <Link href="/privacidade" className="underline text-petroleo">Saiba mais</Link>
        </p>
        <div className="mt-3 md:mt-0 flex gap-2 shrink-0">
          <button
            onClick={() => choose("essential")}
            className="flex-1 md:flex-none border border-petroleo text-petroleo px-4 py-2 rounded text-sm hover:bg-gray-50"
          >
            Só essenciais
          </button>
          <button
            onClick={() => choose("all")}
            className="flex-1 md:flex-none bg-petroleo text-white px-4 py-2 rounded text-sm hover:bg-petroleo-escuro"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  )
}

// Botão "Alterar minhas preferências" (usado na página /privacidade)
export function ReopenCookieBanner() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_BANNER))}
      className="underline text-petroleo"
    >
      Alterar minhas preferências de cookies
    </button>
  )
}
