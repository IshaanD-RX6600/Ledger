"use client";
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { fsRead, fsWrite } from "./firestoreSync";

export interface PriceAlert {
  symbol: string;
  targetPrice: number;
  direction: "above" | "below";
}

const LS_KEY = "ledger.alerts.v1";
const FS_KEY = "alerts";

export function useAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [uid, setUid] = useState<string | null>(() => auth.currentUser?.uid ?? null);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  useEffect(() => {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) setAlerts(JSON.parse(raw)); } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!uid) return;
    fsRead<{ items: PriceAlert[] }>(uid, FS_KEY).then((stored) => {
      if (stored) setAlerts(stored.items);
    });
  }, [uid]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(LS_KEY, JSON.stringify(alerts));
    if (uid) fsWrite(uid, FS_KEY, { items: alerts });
  }, [alerts, loaded, uid]);

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
