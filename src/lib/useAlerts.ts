"use client";
import { useState, useEffect, useCallback } from "react";

export interface PriceAlert {
  symbol: string;
  targetPrice: number;
  direction: "above" | "below";
}

const KEY = "ledger.alerts.v1";

export function useAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setAlerts(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(alerts));
  }, [alerts, loaded]);

  const setAlert = useCallback((symbol: string, targetPrice: number, direction: "above" | "below") => {
    setAlerts((prev) => {
      const idx = prev.findIndex((a) => a.symbol === symbol);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { symbol, targetPrice, direction };
        return updated;
      }
      return [...prev, { symbol, targetPrice, direction }];
    });
  }, []);

  const removeAlert = useCallback((symbol: string) => {
    setAlerts((prev) => prev.filter((a) => a.symbol !== symbol));
  }, []);

  const getAlert = useCallback((symbol: string) => alerts.find((a) => a.symbol === symbol), [alerts]);

  return { alerts, setAlert, removeAlert, getAlert };
}
