"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Holding } from "@/types";

interface SearchResult {
  symbol: string;
  description: string;
}

const inputCls =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-400";

export default function AddHolding({ onAdd }: { onAdd: (h: Holding) => void }) {
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [cost, setCost] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const symbolRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        symbolRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setOpen(true);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(symbol), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [symbol, search]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(r: SearchResult) {
    setSymbol(r.symbol);
    setResults([]);
    setOpen(false);
  }

  function submit() {
    const s = symbol.trim().toUpperCase();
    const sh = parseFloat(shares);
    const cb = parseFloat(cost);
    if (!s || isNaN(sh) || isNaN(cb) || sh <= 0) return;
    onAdd({ symbol: s, shares: sh, costBasis: cb });
    setSymbol(""); setShares(""); setCost("");
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <div ref={containerRef} className="relative">
        <input
          ref={symbolRef}
          className={inputCls}
          placeholder="Symbol (AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          onFocus={() => results.length && setOpen(true)}
          autoComplete="off"
          title="Press / to focus"
        />
        {searching && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">…</span>
        )}
        {open && results.length > 0 && (
          <ul className="absolute z-50 mt-1 w-56 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden">
            {results.map((r) => (
              <li
                key={r.symbol}
                onMouseDown={() => handleSelect(r)}
                className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-indigo-50 transition-colors"
              >
                <span className="font-semibold text-sm text-gray-900">{r.symbol}</span>
                <span className="text-xs text-gray-400 truncate ml-3 max-w-[120px] text-right">
                  {r.description}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <input
        className={inputCls}
        placeholder="Shares"
        type="number"
        value={shares}
        onChange={(e) => setShares(e.target.value)}
      />
      <input
        className={inputCls}
        placeholder="Avg cost"
        type="number"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
      />
      <button
        onClick={submit}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Add
      </button>
    </div>
  );
}
