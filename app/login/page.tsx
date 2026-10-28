"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginData } from "@/schemas/loginSchema";
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
import { useEffect, useState } from "react";
import Link from "next/link";
import { EmailCodeStep } from "@/components/EmailCodeStep";
import { getCallbackUrl, withCallbackUrl } from "@/lib/callbackUrl";

// Para onde ir depois do login: ?callbackUrl=/carrinho volta pro carrinho.
function afterLogin() {
  return getCallbackUrl("/admin")
}

export default function LoginPage() {
  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Quando email e senha estão certos, guardamos aqui e mostramos a etapa do código
  const [pending, setPending] = useState<{ data: LoginData; message: string } | null>(null);

  // Link "Cadastre-se" levando junto o callbackUrl (montado no navegador)
  const [signupHref, setSignupHref] = useState("/cadastro");
  useEffect(() => setSignupHref(withCallbackUrl("/cadastro")), []);

  // 1ª etapa: confere email e senha e manda o código pro email
  async function onSubmit(data: LoginData) {
    const res = await fetch("/api/login-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (!res.ok) {
      form.setError("email", { message: result.error ?? "Email ou senha inválidos" });
    } else {
      setPending({ data, message: result.message });
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <h2 className="text-xl font-bold">Login</h2>
        </CardHeader>
        <CardContent>
          {pending ? (
            <EmailCodeStep
              email={pending.data.email}
              password={pending.data.password}
              redirectTo={afterLogin()}
              initialNotice={pending.message}
            />
          ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <Input type="password" placeholder="Senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Entrar
              </Button>

              <p className="text-center text-sm">
                Não tem conta?{" "}
                <Link href={signupHref} className="underline">Cadastre-se</Link>
              </p>
            </form>
          </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
