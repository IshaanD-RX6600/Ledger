"use client";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { HistorySnapshot } from "@/lib/usePortfolioHistory";
import { fmtRound } from "@/lib/format";

interface Candle { date: string; close: number; }

function nearestSpy(fullDate: string, spyMap: Map<string, number>): number | undefined {
  const d = new Date(fullDate);
  for (let i = 0; i < 5; i++) {
    const key = d.toISOString().slice(0, 10);
    if (spyMap.has(key)) return spyMap.get(key);
    d.setDate(d.getDate() - 1);
  }
  return undefined;
}

const tooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  color: "#111827",
};

export default function PortfolioHistoryChart({ history }: { history: HistorySnapshot[] }) {
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [spyCandles, setSpyCandles] = useState<Candle[]>([]);
  const [loadingSpy, setLoadingSpy] = useState(false);

  useEffect(() => {
    if (!showBenchmark || history.length < 2) return;
    const daySpan = (new Date(history[history.length - 1].date).getTime() - new Date(history[0].date).getTime()) / 86400000;
    const range = daySpan <= 35 ? "1M" : daySpan <= 95 ? "3M" : daySpan <= 190 ? "6M" : "1Y";
    setLoadingSpy(true);
    fetch(`/api/candles?symbol=SPY&range=${range}`)
      .then((r) => r.json())
      .then((d) => setSpyCandles(d.candles ?? []))
      .catch(() => {})
      .finally(() => setLoadingSpy(false));
  }, [showBenchmark, history]);

  if (history.length < 2) return null;

  const portfolioStart = history[0].value;
  const portfolioLast = history[history.length - 1].value;
  const gain = portfolioLast - portfolioStart;
  const gainPct = portfolioStart ? (gain / portfolioStart) * 100 : 0;

  const spyMap = new Map(spyCandles.map((c) => [c.date, c.close]));
  const spyStart = spyCandles.length ? nearestSpy(history[0].date, spyMap) : undefined;

  const data = history.map((h) => {
    const portfolioVal = showBenchmark ? (h.value / portfolioStart) * 100 : h.value;
    const spyClose = spyStart ? nearestSpy(h.date, spyMap) : undefined;
    const spyVal = spyClose && spyStart ? (spyClose / spyStart) * 100 : undefined;
    return { date: h.date.slice(5), portfolio: portfolioVal, spy: spyVal };
  });

  const yFormatter = showBenchmark
    ? (v: number) => `${v.toFixed(0)}`
    : (v: number) => `$${(v / 1000).toFixed(0)}k`;

  const tooltipFormatter = (v: number, name: string) =>
    showBenchmark
      ? [`${v.toFixed(2)} (base 100)`, name === "portfolio" ? "Portfolio" : "SPY"]
      : [fmtRound(v), "Value"];

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-3">
          <h2 className="font-semibold text-gray-900">Portfolio History</h2>
          <span className={`text-sm font-medium ${gain >= 0 ? "text-green-600" : "text-red-600"}`}>
            {gain >= 0 ? "+" : ""}{fmtRound(gain)} ({gainPct >= 0 ? "+" : ""}{gainPct.toFixed(2)}%)
          </span>
        </div>
        <button
          onClick={() => setShowBenchmark((b) => !b)}
          className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
            showBenchmark
              ? "border-orange-200 bg-orange-50 text-orange-700"
              : "border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          {loadingSpy ? "Loading…" : "vs SPY"}
        </button>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={yFormatter} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={50} />
          <Tooltip formatter={tooltipFormatter} contentStyle={tooltipStyle} />
          {showBenchmark && <Legend />}
          <Line type="monotone" dataKey="portfolio" stroke="#4f46e5" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Portfolio" />
          {showBenchmark && (
            <Line type="monotone" dataKey="spy" stroke="#f97316" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="SPY" connectNulls />
          )}
        </LineChart>
      </ResponsiveContainer>
      {showBenchmark && (
        <p className="mt-2 text-xs text-gray-400 text-right">Normalized to 100 at portfolio start date</p>
      )}
    </div>
  );
}
