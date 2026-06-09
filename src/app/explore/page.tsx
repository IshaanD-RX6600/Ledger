"use client";
import { useState } from "react";
import StockSearch from "@/components/StockSearch";
import StockChart from "@/components/StockChart";
import StockAISummary from "@/components/StockAISummary";
import NewsFeed from "@/components/NewsFeed";
import Watchlist from "@/components/Watchlist";
import { useWatchlist } from "@/lib/useWatchlist";

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
  const { symbols, add, remove, isWatched } = useWatchlist();

  function handleSelect(symbol: string, description: string) {
    setSelected({ symbol, description });
    setCandles([]);
    fetch(`/api/candles?symbol=${encodeURIComponent(symbol)}&range=3M`)
      .then((r) => r.json())
      .then((data) => setCandles(data.candles ?? []));
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-bold dark:text-white">Explore</h1>

      <StockSearch onSelect={handleSelect} />

      {selected ? (
        <>
          <div className="flex justify-end">
            <button
              onClick={() =>
                isWatched(selected.symbol) ? remove(selected.symbol) : add(selected.symbol)
              }
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors ${
                isWatched(selected.symbol)
                  ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-400"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill={isWatched(selected.symbol) ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              {isWatched(selected.symbol) ? "Watching" : "Add to Watchlist"}
            </button>
          </div>
          <StockChart symbol={selected.symbol} description={selected.description} />
          <StockAISummary
            symbol={selected.symbol}
            description={selected.description}
            candles={candles}
          />
          <NewsFeed symbol={selected.symbol} />
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
          <p className="text-gray-400 text-sm">Search for a stock symbol to see its chart and AI summary.</p>
        </div>
      )}

      <Watchlist symbols={symbols} onRemove={remove} />
    </main>
  );
}
