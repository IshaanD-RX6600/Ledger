"use client";
import { useState, useEffect, useCallback } from "react";

export interface HistorySnapshot {
  date: string;
  value: number;
}

const KEY_PREFIX = "ledger.history.v1.";

export function usePortfolioHistory(portfolioId: string) {
  const key = KEY_PREFIX + portfolioId;
  const [history, setHistory] = useState<HistorySnapshot[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      setHistory(raw ? JSON.parse(raw) : []);
    } catch {}
  }, [key]);

  const saveSnapshot = useCallback((value: number) => {
    if (!value) return;
    const today = new Date().toISOString().slice(0, 10);
    setHistory((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((h) => h.date === today);
      if (idx >= 0) updated[idx] = { date: today, value };
      else updated.push({ date: today, value });
      const trimmed = updated.slice(-90);
      try { localStorage.setItem(key, JSON.stringify(trimmed)); } catch {}
      return trimmed;
    });
  }, [key]);

  return { history, saveSnapshot };
}
