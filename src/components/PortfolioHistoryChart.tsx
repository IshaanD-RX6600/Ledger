"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { HistorySnapshot } from "@/lib/usePortfolioHistory";
import { useDark } from "@/lib/useDark";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function PortfolioHistoryChart({ history }: { history: HistorySnapshot[] }) {
  const dark = useDark();
  if (history.length < 2) return null;

  const data = history.map((h) => ({ date: h.date.slice(5), value: h.value }));
  const first = data[0].value;
  const last = data[data.length - 1].value;
  const gain = last - first;
  const gainPct = first ? (gain / first) * 100 : 0;

  const gridColor = dark ? "#374151" : "#f3f4f6";
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
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-semibold dark:text-white">Portfolio History</h2>
        <span className={`text-sm font-medium ${gain >= 0 ? "text-green-600" : "text-red-600"}`}>
          {gain >= 0 ? "+" : ""}{fmt(gain)} ({gainPct >= 0 ? "+" : ""}{gainPct.toFixed(2)}%)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip formatter={(v: number) => [fmt(v), "Value"]} contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
