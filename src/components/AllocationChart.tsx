"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { EnrichedHolding } from "@/types";

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#ca8a04", "#9333ea", "#0891b2", "#ea580c"];

export default function AllocationChart({ rows }: { rows: EnrichedHolding[] }) {
  const data = rows
    .map((r) => ({ name: r.symbol, value: r.marketValue }))
    .filter((d) => d.value > 0);

  if (!data.length) return <p className="text-gray-400">No data yet.</p>;

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
      <h2 className="mb-3 font-semibold text-gray-900">Allocation</h2>
      <div className="h-[220px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
