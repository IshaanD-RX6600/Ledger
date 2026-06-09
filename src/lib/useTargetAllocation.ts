"use client";
import { useState, useEffect, useCallback } from "react";

const KEY_PREFIX = "ledger.targets.v1.";

export function useTargetAllocation(portfolioId: string) {
  const key = KEY_PREFIX + portfolioId;
  const [targets, setTargets] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      setTargets(raw ? JSON.parse(raw) : {});
    } catch {}
  }, [key]);

  const setTarget = useCallback(
    (symbol: string, pct: number) => {
      setTargets((prev) => {
        const next = { ...prev, [symbol]: pct };
        try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
        return next;
      });
    },
    [key]
  );

  const removeTarget = useCallback(
    (symbol: string) => {
      setTargets((prev) => {
        const next = { ...prev };
        delete next[symbol];
        try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
        return next;
      });
    },
    [key]
  );

  return { targets, setTarget, removeTarget };
}
