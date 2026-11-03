"use client" // tem formulário, então roda no navegador

import { FormEvent, useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { PONTOS_ESCUROS, Rotulo, TEXTO } from "./estilo"

// ✏️ Número que recebe as mensagens (só dígitos: 55 + DDD + número)
const WHATSAPP = "5541984019897"

const contacts = [
  { name: "WhatsApp", description: "+55 41 98401-9897", link: `https://wa.me/${WHATSAPP}` },
  { name: "Email", description: "gui.conci@hotmail.com", link: "mailto:gui.conci@hotmail.com" },
  { name: "Curitiba", description: "Centro, 123", link: "https://goo.gl/maps/4yacADQtLB8jz8zn9" },
]

const campo =
  `w-full border-0 border-b border-dotted border-black/50 bg-transparent py-3 outline-none transition focus:border-solid focus:border-black ${TEXTO}`
const rotuloCampo = `font-mono uppercase tracking-[0.2em] text-black/50 ${TEXTO}`

// 🎬 framer motion: troque <section> por <motion.section>
export function Contact() {
  const formRef = useRef<HTMLFormElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null)

  // Botão principal: manda a mensagem para o email (rota /api/contato)
  const enviarEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    setEnviando(true)
    setAviso(null)
    try {
      const resposta = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
      const dados = await resposta.json().catch(() => ({}))
      if (resposta.ok) {
        setAviso({ ok: true, texto: dados.message ?? "Mensagem enviada!" })
        form.reset()
      } else {
        setAviso({ ok: false, texto: dados.error ?? "Não foi possível enviar." })
      }
    } catch {
      setAviso({ ok: false, texto: "Sem conexão. Tente de novo ou use o WhatsApp." })
    } finally {
      setEnviando(false)
    }
  }

  // Botão secundário: abre o WhatsApp com a mensagem já escrita
  const enviarWhatsApp = () => {
    const form = formRef.current
    if (!form || !form.reportValidity()) return // mostra os campos que faltam
    const dados = new FormData(form)
    const texto =
      `Olá! Meu nome é ${dados.get("fullName")} (${dados.get("email")}).\n\n` +
      `${dados.get("message")}`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, "_blank")
  }

  return (
    <section id="contato" className={`bg-white px-6 py-28 text-black md:py-40 ${PONTOS_ESCUROS}`}>
      <div className="mx-auto max-w-6xl">
        <Rotulo numero="04" texto="Contato" destaque />
        <h2 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">Fale comigo.</h2>
        <p className={`mt-8 max-w-md leading-relaxed text-black/60 ${TEXTO}`}>
          Entre em contato pelo formulário ou WhatsApp, com certeza irei poder te ajudar.
        </p>

        <div className="mt-20 grid gap-20 md:grid-cols-3 md:gap-16">
          <form ref={formRef} onSubmit={enviarEmail} className="space-y-10 md:col-span-2">
            {/* Armadilha anti-spam: escondido de pessoas, só robô preenche */}
            <input type="text" name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <div className="grid gap-10 md:grid-cols-2">
              <label className="block">
                <span className={rotuloCampo}>Seu nome</span>
                <input className={campo} type="text" name="fullName" required />
              </label>
              <label className="block">
                <span className={rotuloCampo}>Seu email</span>
                <input className={campo} type="email" name="email" required />
              </label>
            </div>
            <label className="block">
              <span className={rotuloCampo}>Mensagem</span>
              <textarea className={`${campo} h-36 resize-none`} name="message" required />
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={enviando}
                className={`inline-flex items-center gap-2 rounded-full bg-black px-9 py-4 font-semibold text-white transition hover:bg-black/80 disabled:opacity-50 ${TEXTO}`}
              >
                {enviando ? "Enviando..." : "Enviar por email"} <ArrowUpRight className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={enviarWhatsApp}
                className={`inline-flex items-center gap-2 rounded-full border-2 border-black px-9 py-4 font-semibold transition hover:bg-black hover:text-white ${TEXTO}`}
              >
                Enviar pelo WhatsApp <ArrowUpRight className="h-5 w-5" />
              </button>
            </div>
            {aviso && (
              <p role="status" className={`${aviso.ok ? "text-green-700" : "text-red-600"} ${TEXTO}`}>
                {aviso.texto}
              </p>
            )}
          </form>

          <ul>
            {contacts.map((c) => (
              <li key={c.name} className="border-b border-dotted border-black/40 py-6 first:pt-0">
                <p className={rotuloCampo}>{c.name}</p>
                <a
                  href={c.link}
                  target={c.link.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className={`mt-2 inline-flex items-center gap-1 font-medium hover:underline ${TEXTO}`}
                >
                  {c.description} <ArrowUpRight className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
