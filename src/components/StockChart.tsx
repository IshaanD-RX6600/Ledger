"use client";
import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Candle {
  date: string;
  close: number;
  high: number;
  low: number;
  volume: number;
}

interface Props {
  symbol: string;
  description: string;
}

const RANGES = ["1M", "3M", "6M", "1Y"] as const;
type Range = (typeof RANGES)[number];

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

export default function StockChart({ symbol, description }: Props) {
  const [range, setRange] = useState<Range>("3M");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    setCandles([]);
    fetch(`/api/candles?symbol=${encodeURIComponent(symbol)}&range=${range}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCandles(data.candles ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol, range]);

  const first = candles[0]?.close ?? 0;
  const last = candles[candles.length - 1]?.close ?? 0;
  const gain = last - first;
  const gainPct = first ? (gain / first) * 100 : 0;
  const isUp = gain >= 0;
  const color = isUp ? "#16a34a" : "#dc2626";

  const periodHigh = candles.length ? Math.max(...candles.map((c) => c.high)) : 0;
  const periodLow = candles.length ? Math.min(...candles.map((c) => c.low)) : 0;

  const tickedDates = candles.filter((_, i) => {
    const step = Math.max(1, Math.floor(candles.length / 6));
    return i % step === 0;
  });

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{symbol}</h2>
          <p className="text-sm text-gray-400">{description}</p>
          {candles.length > 0 && (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold">{fmt(last)}</span>
              <span className={`text-sm font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
                {isUp ? "+" : ""}{fmt(gain)} ({isUp ? "+" : ""}{gainPct.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                range === r
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="h-48 flex items-center justify-center text-sm text-gray-400">
          Loading chart…
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {!loading && !error && candles.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={candles} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                ticks={tickedDates.map((c) => c.date)}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(d) => {
                  const dt = new Date(d);
                  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
                formatter={(v: number) => [fmt(v), "Close"]}
                labelFormatter={(l) => new Date(l).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={color}
                strokeWidth={2}
                fill="url(#colorClose)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex gap-6 border-t border-gray-100 pt-3">
            <div>
              <p className="text-xs text-gray-400">Period High</p>
              <p className="text-sm font-semibold text-green-600">{fmt(periodHigh)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Period Low</p>
              <p className="text-sm font-semibold text-red-600">{fmt(periodLow)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Data points</p>
              <p className="text-sm font-semibold text-gray-700">{candles.length} days</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
