"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { addressSchema, AddressData, AddressInput } from "@/schemas/addressSchema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

const EMPTY: AddressInput = {
  name: "", phone: "", cep: "", street: "", number: "",
  complement: "", district: "", city: "", state: "",
}

// Campos do formulário: nome do campo, rótulo e largura (em colunas de 6)
const FIELDS: { name: keyof AddressInput; label: string; span: string; placeholder?: string }[] = [
  { name: "name", label: "Nome de quem recebe", span: "sm:col-span-4" },
  { name: "phone", label: "Telefone", span: "sm:col-span-2", placeholder: "(41) 99999-9999" },
  { name: "cep", label: "CEP", span: "sm:col-span-2", placeholder: "80000-000" },
  { name: "street", label: "Rua", span: "sm:col-span-4" },
  { name: "number", label: "Número", span: "sm:col-span-2" },
  { name: "complement", label: "Complemento (opcional)", span: "sm:col-span-4", placeholder: "Apto, bloco..." },
  { name: "district", label: "Bairro", span: "sm:col-span-2" },
  { name: "city", label: "Cidade", span: "sm:col-span-3" },
  { name: "state", label: "UF", span: "sm:col-span-1", placeholder: "PR" },
]

type Props = {
  onSubmit: (address: AddressData) => void
  loading: boolean
}

// Formulário de endereço de entrega (aparece no carrinho para quem está logado)
export function AddressForm({ onSubmit, loading }: Props) {
  const form = useForm<AddressInput, unknown, AddressData>({
    resolver: zodResolver(addressSchema),
    defaultValues: EMPTY,
  })

  // Já comprou antes? Preenche com o endereço do último pedido
  useEffect(() => {
    fetch("/api/orders")
      .then((res) => (res.ok ? res.json() : []))
      .then((orders: { shippingAddress: AddressInput | null }[]) => {
        const last = orders.find((o) => o.shippingAddress)?.shippingAddress
        if (last && !form.formState.isDirty) form.reset({ ...EMPTY, ...last })
      })
      .catch(() => {}) // sem endereço anterior: formulário em branco
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // CEP completo (8 números)? Busca rua, bairro, cidade e UF no ViaCEP.
  // ViaCEP: serviço gratuito dos Correios/comunidade, sem chave. Se falhar,
  // o cliente só digita o endereço na mão.
  async function buscarCep(valor: string) {
    const cep = valor.replace(/\D/g, "")
    if (cep.length !== 8) return

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (data.erro) {
        form.setError("cep", { message: "CEP não encontrado" })
        return
      }
      form.clearErrors("cep")
      // Só preenche o que veio (alguns CEPs de cidade pequena não têm rua/bairro)
      if (data.logradouro) form.setValue("street", data.logradouro, { shouldValidate: true })
      if (data.bairro) form.setValue("district", data.bairro, { shouldValidate: true })
      form.setValue("city", data.localidade, { shouldValidate: true })
      form.setValue("state", data.uf, { shouldValidate: true })
      form.setFocus("number") // próximo campo que falta
    } catch {
      // sem internet ou ViaCEP fora do ar: segue digitando na mão
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-left">
        <h2 className="text-lg font-semibold">Endereço de entrega</h2>

        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          {FIELDS.map((f) => (
            <FormField
              key={f.name}
              control={form.control}
              name={f.name}
              render={({ field }) => (
                <FormItem className={f.span}>
                  <FormLabel>{f.label}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={f.placeholder}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        field.onChange(e)
                        if (f.name === "cep") buscarCep(e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="text-right">
          <Button
            type="submit"
            className="bg-petroleo text-white hover:bg-petroleo-escuro"
            disabled={loading}
          >
            {loading ? "Indo para o pagamento..." : "Ir para o pagamento"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
