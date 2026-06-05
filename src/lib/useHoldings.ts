"use client";
import { useState, useEffect, useCallback } from "react";
import { Holding } from "@/types";

const KEY = "portfolio.holdings.v1";

export function useHoldings() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setHoldings(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(holdings));
  }, [holdings, loaded]);

  const addHolding = useCallback((h: Holding) => {
    setHoldings((prev) => {
      const existing = prev.find((p) => p.symbol === h.symbol);
      if (existing) {
        const totalShares = existing.shares + h.shares;
        const costBasis =
          (existing.shares * existing.costBasis + h.shares * h.costBasis) /
          totalShares;
        return prev.map((p) =>
          p.symbol === h.symbol ? { ...p, shares: totalShares, costBasis } : p
        );
      }
      return [...prev, h];
    });
  }, []);

  const removeHolding = useCallback((symbol: string) => {
    setHoldings((prev) => prev.filter((p) => p.symbol !== symbol));
  }, []);

  return { holdings, addHolding, removeHolding, loaded };
}
