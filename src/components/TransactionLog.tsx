"use client";
import { useState } from "react";
import { Transaction } from "@/lib/useTransactions";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const tone = (n: number) => (n >= 0 ? "text-green-600" : "text-red-600");

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
    <div className="rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="font-semibold dark:text-white">Transaction Log</h2>
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
        <div className="border-t border-gray-100 dark:border-gray-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-500 dark:text-gray-400">
              <tr>
                {["Date", "Type", "Symbol", "Shares", "Price", "Value", "Realized G/L", ""].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => (
                <tr key={t.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{t.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.type === "buy"
                          ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400"
                          : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400"
                      }`}
                    >
                      {t.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold dark:text-white">{t.symbol}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{t.shares}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{fmt(t.price)}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{fmt(t.shares * t.price)}</td>
                  <td className={`px-4 py-3 ${t.realizedGain != null ? tone(t.realizedGain) : "text-gray-300 dark:text-gray-600"}`}>
                    {t.realizedGain != null
                      ? `${t.realizedGain >= 0 ? "+" : ""}${fmt(t.realizedGain)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onRemove(t.id)}
                      className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
