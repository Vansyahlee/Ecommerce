"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type RevenueChartPoint = { ts: string; revenue: number };

const formatIdTime = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  });

function compactIdr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function RevenueChart({ data }: { data: RevenueChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="vanzRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#e11d48" stopOpacity={0.75} />
            <stop offset="95%" stopColor="#0f172a" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1f2937" strokeDasharray="4 4" />
        <XAxis
          dataKey="ts"
          tickFormatter={(v: string | number) =>
            new Date(String(v)).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
          }
          stroke="#94a3b8"
          tick={{ fontSize: 11, fontWeight: 800 }}
        />
        <YAxis
          tickFormatter={(v: string | number) => `${Math.round(Number(v) / 1000)}k`}
          stroke="#94a3b8"
          tick={{ fontSize: 11, fontWeight: 800 }}
        />
        <Tooltip
          contentStyle={{
            background: "#0b1220",
            border: "1px solid #1f2937",
            borderRadius: 18,
            color: "#fff",
            fontWeight: 900,
          }}
          labelFormatter={(v: string | number) => formatIdTime(String(v))}
          formatter={(value: string | number) => [compactIdr(Number(value)), "Revenue"]}
        />
        <Area type="monotone" dataKey="revenue" stroke="#fb7185" fill="url(#vanzRevenue)" strokeWidth={2.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}