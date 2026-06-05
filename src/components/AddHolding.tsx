"use client";
import { useState } from "react";
import { Holding } from "@/types";

export default function AddHolding({ onAdd }: { onAdd: (h: Holding) => void }) {
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [cost, setCost] = useState("");

  const submit = () => {
    const s = symbol.trim().toUpperCase();
    const sh = parseFloat(shares);
    const cb = parseFloat(cost);
    if (!s || isNaN(sh) || isNaN(cb) || sh <= 0) return;
    onAdd({ symbol: s, shares: sh, costBasis: cb });
    setSymbol(""); setShares(""); setCost("");
  };

  const input = "rounded-lg border border-gray-200 px-3 py-2 text-sm";

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <input className={input} placeholder="Symbol (AAPL)" value={symbol}
        onChange={(e) => setSymbol(e.target.value)} />
      <input className={input} placeholder="Shares" type="number" value={shares}
        onChange={(e) => setShares(e.target.value)} />
      <input className={input} placeholder="Avg cost" type="number" value={cost}
        onChange={(e) => setCost(e.target.value)} />
      <button onClick={submit}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        Add
      </button>
    </div>
  );
}
