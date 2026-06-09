"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { EnrichedHolding } from "@/types";
import { useDark } from "@/lib/useDark";

export default function DayChangeChart({ rows }: { rows: EnrichedHolding[] }) {
  const dark = useDark();
  const data = rows.map((r) => ({ symbol: r.symbol, dayChange: +r.dayChange.toFixed(2) }));
  if (!data.length) return null;

  const tickColor = dark ? "#9ca3af" : "#6b7280";
  const tooltipStyle = {
    fontSize: 12,
    borderRadius: 8,
    border: `1px solid ${dark ? "#374151" : "#e5e7eb"}`,
    backgroundColor: dark ? "#1f2937" : "#ffffff",
    color: dark ? "#f9fafb" : "#111827",
  };

  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <h2 className="mb-3 font-semibold dark:text-white">Today&apos;s P/L by Holding</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <XAxis dataKey="symbol" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v: number) => `$${v}`} contentStyle={tooltipStyle} />
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
