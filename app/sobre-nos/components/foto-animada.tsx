"use client" // a animação acompanha a rolagem da página, então roda no navegador

import { useRef } from "react"
import Image from "next/image"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

// Foto do "Sobre mim" com animação de rolagem (biblioteca motion, o antigo Framer Motion):
// - começa invisível e vai aparecendo conforme a página desce
// - aparece em preto e branco e, quando fica totalmente visível, ganha as cores
// - passando o mouse por cima, mostra sempre a cor original
// ✏️ A foto fica em public/guifoto.jpg
export function FotoAnimada() {
  const caixa = useRef<HTMLDivElement>(null)
  const semAnimacao = useReducedMotion() // quem pediu ao computador pra reduzir animações vê a foto direto

  // progresso vai de 0 (topo da foto entrando por baixo da tela) a 1 (centro da foto no centro da tela)
  const { scrollYProgress: progresso } = useScroll({ target: caixa, offset: ["start end", "center center"] })

  // ✏️ Até onde da rolagem cada efeito vai: [começa, termina] (de 0 a 1)
  const opacidade = useTransform(progresso, [0, 0.7], [0, 1])
  const subida = useTransform(progresso, [0, 0.7], [60, 0]) // sobe 60px enquanto aparece

  // Cor em etapa separada: começa com o centro da foto a 70% do topo da tela e termina com ele a 45%.
  // ✏️ Número maior = cor chega mais cedo; menor = mais tarde (0% = topo da tela, 100% = base)
  const { scrollYProgress: progressoCor } = useScroll({ target: caixa, offset: ["center 70%", "center 45%"] })
  const filtro = useTransform(progressoCor, [0, 1], ["grayscale(1)", "grayscale(0)"])

  return (
    <motion.div
      ref={caixa}
      className="relative mx-auto w-full max-w-sm"
      style={semAnimacao ? undefined : { opacity: opacidade, y: subida }}
    >
      {/* hover:[filter:none]!: com o mouse em cima, mostra a cor original (ganha da animação) */}
      <motion.div
        className="relative aspect-[4/5] overflow-hidden rounded-xl bg-neutral-300 hover:transition-[filter] hover:duration-500 hover:[filter:none]!"
        style={semAnimacao ? undefined : { filter: filtro }}
      >
        <Image
          src="/guifoto.jpg"
          alt="Foto de Guilherme Luz Conci"
          fill
          sizes="(min-width: 768px) 384px, 100vw"
          className="object-cover"
        />
      </motion.div>
    </motion.div>
  )
}
