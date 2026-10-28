"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterData } from "@/schemas/registerSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { registerUser } from "@/lib/auth"; // 👈 agora usamos o service
import { useEffect, useState } from "react";
import Link from "next/link";
import { EmailCodeStep } from "@/components/EmailCodeStep";
import { getCallbackUrl, withCallbackUrl } from "@/lib/callbackUrl";

export default function RegisterPage() {
  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "all",
    criteriaMode: "firstError",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Depois do cadastro, guardamos os dados e mostramos a etapa do código
  const [pending, setPending] = useState<{ data: RegisterData; message: string } | null>(null);

  // Link "Entrar" levando junto o callbackUrl (montado no navegador)
  const [loginHref, setLoginHref] = useState("/login");
  useEffect(() => setLoginHref(withCallbackUrl("/login")), []);

  async function onSubmit(data: RegisterData) {
    try {
      const result = await registerUser(data.name, data.email, data.password);
      console.log("Resposta do backend:", result);
      setPending({ data, message: result.message }); // "Cadastro feito! Enviamos um código..."
    } catch (err: any) {
      console.error(err);
      alert("Falha no cadastro: " + err.message);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <h2 className="text-xl font-bold">Cadastro</h2>
        </CardHeader>
        <CardContent>
          {pending ? (
            <EmailCodeStep
              email={pending.data.email}
              password={pending.data.password}
              redirectTo={getCallbackUrl("/")} // veio do carrinho? volta pro carrinho
              initialNotice={pending.message}
            />
          ) : (
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="text" placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="password" placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                className="w-full"
                onClick={form.handleSubmit(onSubmit)}
              >
                Cadastrar
              </Button>

              <p className="text-center text-sm">
                Já tem conta?{" "}
                <Link href={loginHref} className="underline">Entrar</Link>
              </p>
            </div>
          </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
