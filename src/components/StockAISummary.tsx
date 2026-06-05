"use client";
import { useState } from "react";

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
  candles: Candle[];
}

export default function StockAISummary({ symbol, description, candles }: Props) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timestamp, setTimestamp] = useState("");

  const generate = async () => {
    if (!candles.length) return;
    setLoading(true);
    setError("");
    setSummary("");
    try {
      const res = await fetch("/api/stock-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, description, candles }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate summary");
      setSummary(data.summary);
      setTimestamp(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">AI Market Summary</h2>
          <p className="text-xs text-gray-400">Powered by Gemini 2.5 Flash</p>
        </div>
        <button
          onClick={generate}
          disabled={loading || !candles.length}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating…" : "Generate Summary"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {summary && (
        <div className="space-y-1">
          <p className="text-sm leading-relaxed text-gray-700">{summary}</p>
          <p className="text-xs text-gray-400">Generated at {timestamp}</p>
        </div>
      )}

      {!summary && !error && !loading && (
        <p className="text-sm text-gray-400">
          {candles.length
            ? "Click Generate Summary to get an AI analysis of this stock."
            : "Select a stock and wait for chart data to load."}
        </p>
      )}
    </div>
  );
}
