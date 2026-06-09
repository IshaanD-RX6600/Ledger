"use client";
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { fsRead, fsWrite } from "./firestoreSync";

export interface HistorySnapshot {
  date: string;
  value: number;
}

const LS_PREFIX = "ledger.history.v1.";

export function usePortfolioHistory(portfolioId: string) {
  const lsKey = LS_PREFIX + portfolioId;
  const fsKey = "history__" + portfolioId;

  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [uid, setUid] = useState<string | null>(() => auth.currentUser?.uid ?? null);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  useEffect(() => {
    try { const raw = localStorage.getItem(lsKey); setHistory(raw ? JSON.parse(raw) : []); } catch {}
  }, [lsKey]);

  useEffect(() => {
    if (!uid) return;
    fsRead<{ snapshots: HistorySnapshot[] }>(uid, fsKey).then((stored) => {
      if (stored) setHistory(stored.snapshots);
    });
  }, [uid, fsKey]);

  const saveSnapshot = useCallback((value: number) => {
    if (!value) return;
    const today = new Date().toISOString().slice(0, 10);
    setHistory((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((h) => h.date === today);
      if (idx >= 0) updated[idx] = { date: today, value };
      else updated.push({ date: today, value });
      const trimmed = updated.slice(-90);
      try { localStorage.setItem(lsKey, JSON.stringify(trimmed)); } catch {}
      if (uid) fsWrite(uid, fsKey, { snapshots: trimmed });
      return trimmed;
    });
  }, [lsKey, fsKey, uid]);

  return { history, saveSnapshot };
}
