"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Recharts desenha no navegador, por isso este componente é "use client".
// Os dados chegam prontos do servidor (lib/metrics.ts).

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const diaMes = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`; // "2026-10-29" → "29/10"

export function RevenueChart({ data }: { data: { dia: string; valor: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          {/* grade e eixos discretos: quem chama atenção são as barras */}
          <CartesianGrid vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="dia"
            tickFormatter={diaMes}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={{ stroke: "#d1d5db" }}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            tickFormatter={(v) => `R$ ${v}`}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            width={64}
          />
          <Tooltip
            cursor={{ fill: "#f3f4f6" }}
            formatter={(v) => [brl(Number(v)), "Receita"]}
            labelFormatter={(dia) => diaMes(String(dia))}
          />
          {/* cor petróleo do site (--color-petroleo em globals.css) */}
          <Bar dataKey="valor" fill="#36454F" radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
