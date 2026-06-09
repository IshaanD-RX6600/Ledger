"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { EnrichedHolding } from "@/types";

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#ca8a04", "#9333ea", "#0891b2", "#ea580c", "#db2777"];

interface Profile {
  sector: string;
  name: string;
}

export default function SectorChart({ rows }: { rows: EnrichedHolding[] }) {
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  const symbolsKey = rows.map((r) => r.symbol).sort().join(",");

  useEffect(() => {
    if (!symbolsKey) return;
    fetch(`/api/profile?symbols=${encodeURIComponent(symbolsKey)}`)
      .then((r) => r.json())
      .then((data) => setProfiles(data.profiles ?? {}))
      .catch(() => {});
  }, [symbolsKey]);

  if (!rows.length) return null;

  const sectorMap = new Map<string, number>();
  rows.forEach((r) => {
    const sector = profiles[r.symbol]?.sector ?? "Unknown";
    sectorMap.set(sector, (sectorMap.get(sector) ?? 0) + r.marketValue);
  });

  const data = Array.from(sectorMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0 || (data.length === 1 && data[0].name === "Unknown")) return null;

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
      <h2 className="mb-3 font-semibold text-gray-900">Sector Breakdown</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
