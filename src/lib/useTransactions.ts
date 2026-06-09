"use client";
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { fsRead, fsWrite } from "./firestoreSync";

export interface Transaction {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  shares: number;
  price: number;
  date: string;
  realizedGain?: number;
}

const LS_PREFIX = "ledger.transactions.v1.";

export function useTransactions(portfolioId: string) {
  const lsKey = LS_PREFIX + portfolioId;
  const fsKey = "transactions__" + portfolioId;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [uid, setUid] = useState<string | null>(() => auth.currentUser?.uid ?? null);
  const [fsSynced, setFsSynced] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  useEffect(() => {
    try { const raw = localStorage.getItem(lsKey); setTransactions(raw ? JSON.parse(raw) : []); } catch {}
  }, [lsKey]);

  useEffect(() => {
    setFsSynced(false);
    if (!uid) {
      setFsSynced(true);
      return;
    }
    fsRead<{ items: Transaction[] }>(uid, fsKey).then((stored) => {
      if (stored) setTransactions(stored.items);
      setFsSynced(true);
    });
  }, [uid, fsKey]);

  const persist = useCallback((txns: Transaction[]) => {
    try { localStorage.setItem(lsKey, JSON.stringify(txns)); } catch {}
    if (uid && fsSynced) fsWrite(uid, fsKey, { items: txns });
  }, [lsKey, fsKey, uid, fsSynced]);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setTransactions((prev) => {
      const next = [...prev, { ...t, id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }];
      persist(next);
      return next;
    });
  }, [persist]);

  const removeTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const next = prev.filter((t) => t.id !== id);
      persist(next);
      return next;
    });
  }, [persist]);

  return { transactions, addTransaction, removeTransaction };
}
