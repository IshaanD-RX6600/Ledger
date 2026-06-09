"use client";
import { useState, useEffect, useCallback } from "react";

export interface Transaction {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  shares: number;
  price: number;
  date: string;
  realizedGain?: number;
}

const KEY_PREFIX = "ledger.transactions.v1.";

export function useTransactions(portfolioId: string) {
  const key = KEY_PREFIX + portfolioId;
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      setTransactions(raw ? JSON.parse(raw) : []);
    } catch {}
  }, [key]);

  const persist = useCallback(
    (txns: Transaction[]) => {
      try { localStorage.setItem(key, JSON.stringify(txns)); } catch {}
    },
    [key]
  );

  const addTransaction = useCallback(
    (t: Omit<Transaction, "id">) => {
      setTransactions((prev) => {
        const next = [...prev, { ...t, id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) => {
        const next = prev.filter((t) => t.id !== id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return { transactions, addTransaction, removeTransaction };
}
