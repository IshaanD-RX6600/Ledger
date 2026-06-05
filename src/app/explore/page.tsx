"use client";
import { useState } from "react";
import StockSearch from "@/components/StockSearch";
import StockChart from "@/components/StockChart";
import StockAISummary from "@/components/StockAISummary";

interface Candle {
  date: string;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export default function ExplorePage() {
  const [selected, setSelected] = useState<{ symbol: string; description: string } | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);

  function handleSelect(symbol: string, description: string) {
    setSelected({ symbol, description });
    setCandles([]);
    fetch(`/api/candles?symbol=${encodeURIComponent(symbol)}&range=3M`)
      .then((r) => r.json())
      .then((data) => setCandles(data.candles ?? []));
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Explore</h1>
      </div>

      <StockSearch onSelect={handleSelect} />

      {selected ? (
        <>
          <StockChart symbol={selected.symbol} description={selected.description} />
          <StockAISummary
            symbol={selected.symbol}
            description={selected.description}
            candles={candles}
          />
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-400 text-sm">Search for a stock symbol to see its chart and AI summary.</p>
        </div>
      )}
    </main>
  );
}
