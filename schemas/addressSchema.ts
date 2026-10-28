import { z } from "zod";

// Endereço de entrega. O mesmo schema valida no navegador (formulário do
// carrinho) e no servidor (/api/checkout), então as regras ficam num lugar só.
export const addressSchema = z.object({
  name: z.string().trim().min(3, "Nome de quem vai receber"),
  phone: z.string()
    .transform((v) => v.replace(/\D/g, "")) // guarda só os números
    .pipe(z.string().min(10, "Telefone com DDD").max(11, "Telefone inválido")),
  cep: z.string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().length(8, "CEP deve ter 8 números")),
  street: z.string().trim().min(1, "Campo obrigatório"),
  number: z.string().trim().min(1, "Campo obrigatório"),
  complement: z.string().trim().max(60).optional(),
  district: z.string().trim().min(1, "Campo obrigatório"),
  city: z.string().trim().min(1, "Campo obrigatório"),
  state: z.string().trim().toUpperCase().length(2, "UF com 2 letras (ex.: PR)"),
});

export type AddressData = z.infer<typeof addressSchema>;
// O que o formulário digita (antes de limpar telefone/CEP)
export type AddressInput = z.input<typeof addressSchema>;
