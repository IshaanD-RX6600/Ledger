"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface Result {
  symbol: string;
  description: string;
}

interface Props {
  onSelect: (symbol: string, description: string) => void;
}

export default function StockSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(r: Result) {
    setQuery(r.symbol);
    setOpen(false);
    onSelect(r.symbol, r.description);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search symbol (e.g. AAPL)"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
            …
          </span>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden">
          {results.map((r) => (
            <li
              key={r.symbol}
              onMouseDown={() => handleSelect(r)}
              className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-indigo-50 transition-colors"
            >
              <span className="font-semibold text-sm text-gray-900">{r.symbol}</span>
              <span className="text-xs text-gray-400 truncate ml-4 max-w-[200px] text-right">
                {r.description}
              </span>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && results.length === 0 && query.trim() && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-lg px-4 py-3 text-sm text-gray-400">
          No results for "{query}"
        </div>
      )}
    </div>
  );
}
