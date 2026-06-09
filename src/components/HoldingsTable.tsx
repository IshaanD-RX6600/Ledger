"use client";
import { useState } from "react";
import { EnrichedHolding } from "@/types";
import { PriceAlert } from "@/lib/useAlerts";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const tone = (n: number) => (n >= 0 ? "text-green-600" : "text-red-600");

function exportCSV(rows: EnrichedHolding[]) {
  const header = ["Symbol", "Shares", "Cost Basis", "Current Price", "Market Value", "Day Change %", "Total Gain", "Total Gain %"];
  const lines = rows.map((r) =>
    [
      r.symbol,
      r.shares,
      r.costBasis.toFixed(2),
      r.current.toFixed(2),
      r.marketValue.toFixed(2),
      r.dayChangePct.toFixed(2) + "%",
      r.totalGain.toFixed(2),
      r.totalGainPct.toFixed(1) + "%",
    ].join(",")
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "portfolio.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function HoldingsTable({
  rows,
  onRemove,
  alerts,
  onSetAlert,
  onRemoveAlert,
}: {
  rows: EnrichedHolding[];
  onRemove: (symbol: string) => void;
  alerts: PriceAlert[];
  onSetAlert: (symbol: string, target: number, direction: "above" | "below") => void;
  onRemoveAlert: (symbol: string) => void;
}) {
  const [editingAlert, setEditingAlert] = useState<string | null>(null);
  const [alertInput, setAlertInput] = useState("");
  const [alertDir, setAlertDir] = useState<"above" | "below">("above");

  function getAlert(symbol: string) {
    return alerts.find((a) => a.symbol === symbol);
  }

  function isTriggered(symbol: string, current: number) {
    const a = getAlert(symbol);
    if (!a || !current) return false;
    return a.direction === "above" ? current >= a.targetPrice : current <= a.targetPrice;
  }

  function startEditAlert(row: EnrichedHolding) {
    const existing = getAlert(row.symbol);
    setAlertInput(existing ? existing.targetPrice.toString() : row.current.toFixed(2));
    setAlertDir(existing?.direction ?? "above");
    setEditingAlert(row.symbol);
  }

  function saveAlert(symbol: string) {
    const price = parseFloat(alertInput);
    if (!isNaN(price) && price > 0) onSetAlert(symbol, price, alertDir);
    setEditingAlert(null);
  }

  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex justify-end px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => exportCSV(rows)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-500 dark:text-gray-400">
            <tr>
              {["Symbol", "Shares", "Price", "Day", "Mkt Value", "Total G/L", "Alert", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const triggered = isTriggered(r.symbol, r.current);
              const alert = getAlert(r.symbol);
              return (
                <tr
                  key={r.symbol}
                  className={`border-t border-gray-100 dark:border-gray-800 ${
                    triggered ? "bg-yellow-50 dark:bg-yellow-950/30" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="font-semibold dark:text-white">{r.symbol}</span>
                    {triggered && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-300">
                        🔔 Target hit
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 dark:text-gray-300">{r.shares}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{fmt(r.current)}</td>
                  <td className={`px-4 py-3 ${tone(r.dayChange)}`}>
                    {r.dayChangePct.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 dark:text-gray-300">{fmt(r.marketValue)}</td>
                  <td className={`px-4 py-3 ${tone(r.totalGain)}`}>
                    {fmt(r.totalGain)} ({r.totalGainPct.toFixed(1)}%)
                  </td>
                  <td className="px-4 py-3">
                    {editingAlert === r.symbol ? (
                      <div className="flex items-center gap-1">
                        <select
                          value={alertDir}
                          onChange={(e) => setAlertDir(e.target.value as "above" | "below")}
                          className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs px-1 py-0.5 dark:text-gray-200 outline-none"
                        >
                          <option value="above">≥</option>
                          <option value="below">≤</option>
                        </select>
                        <input
                          autoFocus
                          className="w-20 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs px-1.5 py-0.5 dark:text-gray-200 outline-none focus:border-indigo-400"
                          value={alertInput}
                          onChange={(e) => setAlertInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveAlert(r.symbol);
                            if (e.key === "Escape") setEditingAlert(null);
                          }}
                        />
                        <button
                          onClick={() => saveAlert(r.symbol)}
                          className="text-xs text-indigo-600 dark:text-indigo-400 font-medium"
                        >
                          ✓
                        </button>
                        {alert && (
                          <button
                            onClick={() => { onRemoveAlert(r.symbol); setEditingAlert(null); }}
                            className="text-xs text-red-400 dark:text-red-500"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ) : alert ? (
                      <button
                        onClick={() => startEditAlert(r)}
                        className={`text-xs ${
                          triggered
                            ? "text-yellow-600 dark:text-yellow-400 font-medium"
                            : "text-gray-400 dark:text-gray-500"
                        } hover:text-indigo-600 dark:hover:text-indigo-400`}
                      >
                        {alert.direction === "above" ? "≥" : "≤"} {fmt(alert.targetPrice)}
                      </button>
                    ) : (
                      <button
                        onClick={() => startEditAlert(r)}
                        className="text-xs text-gray-300 dark:text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        + Set
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onRemove(r.symbol)}
                      className="text-gray-400 hover:text-red-600 dark:text-gray-600 dark:hover:text-red-400"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
