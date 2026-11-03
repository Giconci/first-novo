"use client" // tem formulário, então roda no navegador

import { FormEvent } from "react"
import { ArrowUpRight } from "lucide-react"
import { PONTOS_ESCUROS, Rotulo } from "./estilo"

// ✏️ Número que recebe as mensagens (só dígitos: 55 + DDD + número)
const WHATSAPP = "5541984019897"

const contacts = [
  { name: "WhatsApp", description: "+55 41 98401-9897", link: `https://wa.me/${WHATSAPP}` },
  { name: "Email", description: "gui.conci@hotmail.com", link: "mailto:gui.conci@hotmail.com" },
  { name: "Curitiba", description: "Centro, 123", link: "https://goo.gl/maps/4yacADQtLB8jz8zn9" },
]

const campo =
  "w-full border-0 border-b border-dotted border-black/50 bg-transparent py-3 outline-none transition focus:border-solid focus:border-black"
const rotuloCampo = "font-mono text-xs uppercase tracking-[0.2em] text-black/50"

// 🎬 framer motion: troque <section> por <motion.section>
export function Contact() {
  // Ao enviar, abre o WhatsApp com a mensagem já escrita (sem serviço externo de email)
  const enviar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const dados = new FormData(event.currentTarget)
    const texto =
      `Olá! Meu nome é ${dados.get("fullName")} (${dados.get("email")}).\n\n` +
      `${dados.get("message")}`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, "_blank")
  }

  return (
    <section id="contato" className={`bg-white px-6 py-28 text-black md:py-40 ${PONTOS_ESCUROS}`}>
      <div className="mx-auto max-w-6xl">
        <Rotulo numero="04" texto="Contato" />
        <h2 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">Fale comigo.</h2>
        <p className="mt-8 max-w-md leading-relaxed text-black/60">
          Entre em contato pelo formulário ou WhatsApp, com certeza irei poder te ajudar.
        </p>

        <div className="mt-20 grid gap-20 md:grid-cols-3 md:gap-16">
          <form onSubmit={enviar} className="space-y-10 md:col-span-2">
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
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-black px-8 py-4 font-semibold text-white transition hover:bg-black/80"
            >
              Enviar pelo WhatsApp <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>

          <ul>
            {contacts.map((c) => (
              <li key={c.name} className="border-b border-dotted border-black/40 py-6 first:pt-0">
                <p className={rotuloCampo}>{c.name}</p>
                <a
                  href={c.link}
                  target={c.link.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-medium hover:underline"
                >
                  {c.description} <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
