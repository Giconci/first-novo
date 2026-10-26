"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Etapa do código: usada depois do cadastro e em todo login
export function EmailCodeStep({
  email,
  password,
  redirectTo,
  initialNotice,
}: {
  email: string;
  password: string;
  redirectTo: string;
  initialNotice: string;
}) {
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState(initialNotice);
  const [error, setError] = useState("");

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      code,
    });

    if (result?.error) {
      setError("Código inválido ou expirado");
    } else {
      window.location.href = redirectTo;
    }
  }

  async function resend() {
    const res = await fetch("/api/login-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setNotice(data.message ?? data.error);
  }

  return (
    <form onSubmit={confirm} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {notice} Enviado para <strong>{email}</strong>.
      </p>

      <Input
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="Código de 6 dígitos"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={code.length !== 6}>
        Confirmar
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={resend}>
        Reenviar código
      </Button>
    </form>
  );
}
