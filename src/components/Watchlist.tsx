"use client";
import { useEffect, useState } from "react";

interface WatchedQuote {
  symbol: string;
  current: number;
  changePct: number;
}

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const tone = (n: number) => (n >= 0 ? "text-green-600" : "text-red-600");

export default function Watchlist({
  symbols,
  onRemove,
}: {
  symbols: string[];
  onRemove: (symbol: string) => void;
}) {
  const [quotes, setQuotes] = useState<WatchedQuote[]>([]);

  useEffect(() => {
    if (!symbols.length) { setQuotes([]); return; }
    fetch(`/api/quotes?symbols=${symbols.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        setQuotes(
          (data.quotes ?? []).map((q: { symbol: string; current: number; changePct: number }) => ({
            symbol: q.symbol,
            current: q.current,
            changePct: q.changePct,
          }))
        );
      })
      .catch(() => {});
  }, [symbols]);

  if (!symbols.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 text-center">
        <p className="text-sm text-gray-400">No symbols in your watchlist yet.</p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
          Search a stock above and click &quot;Add to Watchlist&quot; to track it here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="font-semibold dark:text-white">Watchlist</h2>
      </div>
      <ul>
        {symbols.map((sym) => {
          const q = quotes.find((x) => x.symbol === sym);
          return (
            <li
              key={sym}
              className="flex items-center justify-between px-5 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0"
            >
              <span className="font-semibold text-sm dark:text-white">{sym}</span>
              <div className="flex items-center gap-4">
                {q ? (
                  <>
                    <span className="text-sm dark:text-gray-200">{fmt(q.current)}</span>
                    <span className={`text-sm font-medium ${tone(q.changePct)}`}>
                      {q.changePct >= 0 ? "+" : ""}{q.changePct.toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-300 dark:text-gray-600">Loading…</span>
                )}
                <button
                  onClick={() => onRemove(sym)}
                  className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
