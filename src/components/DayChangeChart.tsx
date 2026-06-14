"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { EnrichedHolding } from "@/types";

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  color: "#111827",
};

export default function DayChangeChart({ rows }: { rows: EnrichedHolding[] }) {
  const data = rows.map((r) => ({ symbol: r.symbol, dayChange: +r.dayChange.toFixed(2) }));
  if (!data.length) return null;

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
      <h2 className="mb-3 font-semibold text-gray-900">Today&apos;s P/L by Holding</h2>
      <div className="h-[200px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="symbol" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => `$${v}`} contentStyle={tooltipStyle} />
            <Bar dataKey="dayChange">
              {data.map((d, i) => (
                <Cell key={i} fill={d.dayChange >= 0 ? "#16a34a" : "#dc2626"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
