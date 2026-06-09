"use client";
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { fsRead, fsWrite } from "./firestoreSync";

const LS_PREFIX = "ledger.targets.v1.";

export function useTargetAllocation(portfolioId: string) {
  const lsKey = LS_PREFIX + portfolioId;
  const fsKey = "targets__" + portfolioId;

  const [targets, setTargets] = useState<Record<string, number>>({});
  const [uid, setUid] = useState<string | null>(() => auth.currentUser?.uid ?? null);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  useEffect(() => {
    try { const raw = localStorage.getItem(lsKey); setTargets(raw ? JSON.parse(raw) : {}); } catch {}
  }, [lsKey]);

  useEffect(() => {
    if (!uid) return;
    fsRead<{ data: Record<string, number> }>(uid, fsKey).then((stored) => {
      if (stored) setTargets(stored.data);
    });
  }, [uid, fsKey]);

  const persist = useCallback((data: Record<string, number>) => {
    try { localStorage.setItem(lsKey, JSON.stringify(data)); } catch {}
    if (uid) fsWrite(uid, fsKey, { data });
  }, [lsKey, fsKey, uid]);

  const setTarget = useCallback((symbol: string, pct: number) => {
    setTargets((prev) => {
      const next = { ...prev, [symbol]: pct };
      persist(next);
      return next;
    });
  }, [persist]);

  const removeTarget = useCallback((symbol: string) => {
    setTargets((prev) => {
      const next = { ...prev };
      delete next[symbol];
      persist(next);
      return next;
    });
  }, [persist]);

  return { targets, setTarget, removeTarget };
}
