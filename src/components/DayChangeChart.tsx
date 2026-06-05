"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { EnrichedHolding } from "@/types";

export default function DayChangeChart({ rows }: { rows: EnrichedHolding[] }) {
  const data = rows.map((r) => ({ symbol: r.symbol, dayChange: +r.dayChange.toFixed(2) }));
  if (!data.length) return null;

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
      <h2 className="mb-3 font-semibold">Today&apos;s P/L by Holding</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <XAxis dataKey="symbol" />
          <YAxis />
          <Tooltip formatter={(v: number) => `$${v}`} />
          <Bar dataKey="dayChange">
            {data.map((d, i) => (
              <Cell key={i} fill={d.dayChange >= 0 ? "#16a34a" : "#dc2626"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
