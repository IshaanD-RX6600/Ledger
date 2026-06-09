"use client";
import { useState, useEffect, useCallback } from "react";

const KEY = "ledger.watchlist.v1";

export function useWatchlist() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSymbols(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(symbols));
  }, [symbols, loaded]);

  const add = useCallback((symbol: string) => {
    setSymbols((prev) => prev.includes(symbol) ? prev : [...prev, symbol]);
  }, []);

  const remove = useCallback((symbol: string) => {
    setSymbols((prev) => prev.filter((s) => s !== symbol));
  }, []);

  const isWatched = useCallback((symbol: string) => symbols.includes(symbol), [symbols]);

  return { symbols, add, remove, isWatched };
}
