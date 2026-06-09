"use client";
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { fsRead, fsWrite } from "./firestoreSync";
import { Holding } from "@/types";

interface Portfolio {
  id: string;
  name: string;
  holdings: Holding[];
}

interface State {
  portfolios: Portfolio[];
  activeId: string;
}

const LS_KEY = "ledger.portfolios.v1";
const OLD_KEY = "portfolio.holdings.v1";
const DEFAULT_ID = "default";
const FS_KEY = "portfolios";

function loadLocal(): State {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
    let holdings: Holding[] = [];
    try { const old = localStorage.getItem(OLD_KEY); if (old) holdings = JSON.parse(old); } catch {}
    return { portfolios: [{ id: DEFAULT_ID, name: "My Portfolio", holdings }], activeId: DEFAULT_ID };
  } catch {
    return { portfolios: [{ id: DEFAULT_ID, name: "My Portfolio", holdings: [] }], activeId: DEFAULT_ID };
  }
}

export function usePortfolios() {
  const [state, setState] = useState<State>({
    portfolios: [{ id: DEFAULT_ID, name: "My Portfolio", holdings: [] }],
    activeId: DEFAULT_ID,
  });
  const [loaded, setLoaded] = useState(false);
  const [uid, setUid] = useState<string | null>(() => auth.currentUser?.uid ?? null);
  // Gate that prevents writing to Firestore before we've read from it first.
  // Without this, an empty localStorage on a new browser would overwrite Firestore data.
  const [fsSynced, setFsSynced] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  useEffect(() => {
    setState(loadLocal());
    setLoaded(true);
  }, []);

  // Read from Firestore when uid resolves. Block writes until this completes.
  useEffect(() => {
    setFsSynced(false);
    if (!uid) {
      setFsSynced(true);
      return;
    }
    fsRead<State>(uid, FS_KEY).then((stored) => {
      if (stored) setState(stored);
      setFsSynced(true);
    });
  }, [uid]);

  // Write only after both local load and Firestore read are complete
  useEffect(() => {
    if (!loaded || !fsSynced) return;
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    if (uid) fsWrite(uid, FS_KEY, state);
  }, [state, loaded, uid, fsSynced]);

  const active = state.portfolios.find((p) => p.id === state.activeId) ?? state.portfolios[0];

  const addHolding = useCallback((h: Holding) => {
    setState((prev) => ({
      ...prev,
      portfolios: prev.portfolios.map((p) => {
        if (p.id !== prev.activeId) return p;
        const ex = p.holdings.find((x) => x.symbol === h.symbol);
        if (ex) {
          const total = ex.shares + h.shares;
          const cb = (ex.shares * ex.costBasis + h.shares * h.costBasis) / total;
          return { ...p, holdings: p.holdings.map((x) => x.symbol === h.symbol ? { ...x, shares: total, costBasis: cb } : x) };
        }
        return { ...p, holdings: [...p.holdings, h] };
      }),
    }));
  }, []);

  const removeHolding = useCallback((symbol: string) => {
    setState((prev) => ({
      ...prev,
      portfolios: prev.portfolios.map((p) =>
        p.id !== prev.activeId ? p : { ...p, holdings: p.holdings.filter((x) => x.symbol !== symbol) }
      ),
    }));
  }, []);

  const createPortfolio = useCallback((name: string) => {
    const id = `p-${Date.now()}`;
    setState((prev) => ({ portfolios: [...prev.portfolios, { id, name, holdings: [] }], activeId: id }));
  }, []);

  const switchPortfolio = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeId: id }));
  }, []);

  const deletePortfolio = useCallback((id: string) => {
    setState((prev) => {
      const remaining = prev.portfolios.filter((p) => p.id !== id);
      if (!remaining.length) return prev;
      return { portfolios: remaining, activeId: prev.activeId === id ? remaining[0].id : prev.activeId };
    });
  }, []);

  const sellHolding = useCallback((symbol: string, shares: number) => {
    setState((prev) => ({
      ...prev,
      portfolios: prev.portfolios.map((p) => {
        if (p.id !== prev.activeId) return p;
        const h = p.holdings.find((x) => x.symbol === symbol);
        if (!h) return p;
        const remaining = h.shares - shares;
        if (remaining <= 0.0001) return { ...p, holdings: p.holdings.filter((x) => x.symbol !== symbol) };
        return { ...p, holdings: p.holdings.map((x) => x.symbol === symbol ? { ...x, shares: remaining } : x) };
      }),
    }));
  }, []);

  return {
    portfolios: state.portfolios,
    activeId: state.activeId,
    activePortfolio: active,
    holdings: active?.holdings ?? [],
    addHolding, removeHolding, sellHolding,
    createPortfolio, switchPortfolio, deletePortfolio,
    loaded,
  };
}
