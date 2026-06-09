"use client";
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { fsRead, fsWrite } from "./firestoreSync";

const LS_KEY = "ledger.watchlist.v1";
const FS_KEY = "watchlist";

export function useWatchlist() {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [uid, setUid] = useState<string | null>(() => auth.currentUser?.uid ?? null);
  const [fsSynced, setFsSynced] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  useEffect(() => {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) setSymbols(JSON.parse(raw)); } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    setFsSynced(false);
    if (!uid) {
      setFsSynced(true);
      return;
    }
    fsRead<{ symbols: string[] }>(uid, FS_KEY).then((stored) => {
      if (stored) setSymbols(stored.symbols);
      setFsSynced(true);
    });
  }, [uid]);

  useEffect(() => {
    if (!loaded || !fsSynced) return;
    localStorage.setItem(LS_KEY, JSON.stringify(symbols));
    if (uid) fsWrite(uid, FS_KEY, { symbols });
  }, [symbols, loaded, uid, fsSynced]);

  const add = useCallback((symbol: string) => {
    setSymbols((prev) => prev.includes(symbol) ? prev : [...prev, symbol]);
  }, []);

  const remove = useCallback((symbol: string) => {
    setSymbols((prev) => prev.filter((s) => s !== symbol));
  }, []);

  const isWatched = useCallback((symbol: string) => symbols.includes(symbol), [symbols]);

  return { symbols, add, remove, isWatched };
}
