"use client";
import { useState } from "react";
import { Transaction } from "@/lib/useTransactions";
import { fmt, tone } from "@/lib/format";

export default function TransactionLog({
  transactions,
  onRemove,
}: {
  transactions: Transaction[];
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  if (!transactions.length) return null;

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const totalRealized = transactions
    .filter((t) => t.type === "sell")
    .reduce((sum, t) => sum + (t.realizedGain ?? 0), 0);
  const hasSells = transactions.some((t) => t.type === "sell");

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="font-semibold text-gray-900">Transaction Log</h2>
          <span className="text-xs text-gray-400">{transactions.length} transactions</span>
          {hasSells && (
            <span className={`text-xs font-medium ${tone(totalRealized)}`}>
              Realized: {totalRealized >= 0 ? "+" : ""}{fmt(totalRealized)}
            </span>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-gray-50">
            {sorted.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    t.type === "buy" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {t.type.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {t.symbol}{" "}
                    <span className="text-xs font-normal text-gray-400">{t.date}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {t.shares} × {fmt(t.price)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-gray-700">{fmt(t.shares * t.price)}</p>
                  {t.realizedGain != null && (
                    <p className={`text-xs font-medium ${tone(t.realizedGain)}`}>
                      {t.realizedGain >= 0 ? "+" : ""}{fmt(t.realizedGain)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onRemove(t.id)}
                  className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  {["Date", "Type", "Symbol", "Shares", "Price", "Value", "Realized G/L", ""].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((t) => (
                  <tr key={t.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{t.date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          t.type === "buy"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{t.symbol}</td>
                    <td className="px-4 py-3 text-gray-700">{t.shares}</td>
                    <td className="px-4 py-3 text-gray-700">{fmt(t.price)}</td>
                    <td className="px-4 py-3 text-gray-700">{fmt(t.shares * t.price)}</td>
                    <td className={`px-4 py-3 ${t.realizedGain != null ? tone(t.realizedGain) : "text-gray-300"}`}>
                      {t.realizedGain != null
                        ? `${t.realizedGain >= 0 ? "+" : ""}${fmt(t.realizedGain)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onRemove(t.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
