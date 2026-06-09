"use client";
import { useState, useEffect, useCallback } from "react";
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

const KEY = "ledger.portfolios.v1";
const OLD_KEY = "portfolio.holdings.v1";
const DEFAULT_ID = "default";

function loadInitial(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
    let holdings: Holding[] = [];
    try {
      const old = localStorage.getItem(OLD_KEY);
      if (old) holdings = JSON.parse(old);
    } catch {}
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

  useEffect(() => {
    setState(loadInitial());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, loaded]);

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
        if (remaining <= 0.0001) {
          return { ...p, holdings: p.holdings.filter((x) => x.symbol !== symbol) };
        }
        return { ...p, holdings: p.holdings.map((x) => x.symbol === symbol ? { ...x, shares: remaining } : x) };
      }),
    }));
  }, []);

  return {
    portfolios: state.portfolios,
    activeId: state.activeId,
    activePortfolio: active,
    holdings: active?.holdings ?? [],
    addHolding,
    removeHolding,
    sellHolding,
    createPortfolio,
    switchPortfolio,
    deletePortfolio,
    loaded,
  };
}
