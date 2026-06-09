"use client";
import { useState } from "react";
import { EnrichedHolding } from "@/types";
import { PriceAlert } from "@/lib/useAlerts";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
const tone = (n: number) => (n >= 0 ? "text-green-600" : "text-red-600");

function driftColor(drift: number) {
  const abs = Math.abs(drift);
  if (abs <= 2) return "text-green-600";
  if (abs <= 5) return "text-amber-600";
  return "text-red-600";
}

function exportCSV(rows: EnrichedHolding[]) {
  const header = ["Symbol", "Shares", "Cost Basis", "Current Price", "Market Value", "Day Change %", "Total Gain", "Total Gain %"];
  const lines = rows.map((r) =>
    [r.symbol, r.shares, r.costBasis.toFixed(2), r.current.toFixed(2), r.marketValue.toFixed(2),
     r.dayChangePct.toFixed(2) + "%", r.totalGain.toFixed(2), r.totalGainPct.toFixed(1) + "%"].join(",")
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "portfolio.csv"; a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  rows: EnrichedHolding[];
  onRemove: (symbol: string) => void;
  alerts: PriceAlert[];
  onSetAlert: (symbol: string, target: number, direction: "above" | "below") => void;
  onRemoveAlert: (symbol: string) => void;
  targets: Record<string, number>;
  onSetTarget: (symbol: string, pct: number) => void;
  onRemoveTarget: (symbol: string) => void;
  notes: Record<string, string>;
  onSetNote: (symbol: string, text: string) => void;
  onSell: (symbol: string, shares: number, price: number) => void;
}

export default function HoldingsTable({
  rows, onRemove,
  alerts, onSetAlert, onRemoveAlert,
  targets, onSetTarget, onRemoveTarget,
  notes, onSetNote,
  onSell,
}: Props) {
  const [editingAlert, setEditingAlert] = useState<string | null>(null);
  const [alertInput, setAlertInput] = useState("");
  const [alertDir, setAlertDir] = useState<"above" | "below">("above");

  const [editingTarget, setEditingTarget] = useState<string | null>(null);
  const [targetInput, setTargetInput] = useState("");

  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const [sellingSymbol, setSellingSymbol] = useState<string | null>(null);
  const [sellShares, setSellShares] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  const totalValue = rows.reduce((s, r) => s + r.marketValue, 0);

  function getAlert(symbol: string) { return alerts.find((a) => a.symbol === symbol); }
  function isTriggered(symbol: string, current: number) {
    const a = getAlert(symbol);
    if (!a || !current) return false;
    return a.direction === "above" ? current >= a.targetPrice : current <= a.targetPrice;
  }

  function startSell(r: EnrichedHolding) {
    setSellShares(""); setSellPrice(r.current.toFixed(2)); setSellingSymbol(r.symbol);
    setEditingAlert(null); setEditingNote(null); setEditingTarget(null);
  }
  function commitSell(r: EnrichedHolding) {
    const sh = parseFloat(sellShares);
    const pr = parseFloat(sellPrice);
    if (!isNaN(sh) && sh > 0 && sh <= r.shares && !isNaN(pr) && pr > 0) {
      onSell(r.symbol, sh, pr);
    }
    setSellingSymbol(null);
  }

  function startNote(r: EnrichedHolding) {
    setNoteInput(notes[r.symbol] ?? ""); setEditingNote(r.symbol);
    setEditingAlert(null); setSellingSymbol(null); setEditingTarget(null);
  }
  function commitNote(symbol: string) {
    onSetNote(symbol, noteInput); setEditingNote(null);
  }

  function startTarget(r: EnrichedHolding) {
    setTargetInput(targets[r.symbol]?.toFixed(1) ?? ""); setEditingTarget(r.symbol);
    setEditingAlert(null); setSellingSymbol(null); setEditingNote(null);
  }
  function commitTarget(symbol: string) {
    const pct = parseFloat(targetInput);
    if (!isNaN(pct) && pct >= 0 && pct <= 100) onSetTarget(symbol, pct);
    else if (targetInput === "") onRemoveTarget(symbol);
    setEditingTarget(null);
  }

  function startAlert(r: EnrichedHolding) {
    const ex = getAlert(r.symbol);
    setAlertInput(ex ? ex.targetPrice.toString() : r.current.toFixed(2));
    setAlertDir(ex?.direction ?? "above"); setEditingAlert(r.symbol);
    setSellingSymbol(null); setEditingNote(null); setEditingTarget(null);
  }
  function commitAlert(symbol: string) {
    const price = parseFloat(alertInput);
    if (!isNaN(price) && price > 0) onSetAlert(symbol, price, alertDir);
    setEditingAlert(null);
  }

  const inputCls = "rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs px-1.5 py-0.5 dark:text-gray-200 outline-none focus:border-indigo-400";

  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800">
      {/* Toolbar */}
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

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map((r) => {
          const triggered = isTriggered(r.symbol, r.current);
          const actualPct = totalValue ? (r.marketValue / totalValue) * 100 : 0;
          const target = targets[r.symbol];
          const hasNote = !!notes[r.symbol];
          return (
            <div
              key={r.symbol}
              className={`p-4 space-y-2 ${triggered ? "bg-yellow-50 dark:bg-yellow-950/30" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold dark:text-white">{r.symbol}</span>
                  {triggered && (
                    <span className="rounded-full bg-yellow-100 dark:bg-yellow-900 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-300">
                      🔔
                    </span>
                  )}
                  {hasNote && (
                    <span className="text-indigo-400 text-xs">📝</span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold dark:text-white">{fmt(r.current)}</p>
                  <p className={`text-xs font-medium ${tone(r.dayChange)}`}>{r.dayChangePct.toFixed(2)}% today</p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{r.shares} shares × {fmt(r.costBasis)}</span>
                <span className="dark:text-gray-300">{fmt(r.marketValue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 text-xs">
                  {actualPct.toFixed(1)}% of portfolio
                  {target != null && (
                    <span className={`ml-1 ${driftColor(actualPct - target)}`}>
                      (target {target.toFixed(1)}%)
                    </span>
                  )}
                </span>
                <span className={`text-sm font-medium ${tone(r.totalGain)}`}>
                  {fmtPct(r.totalGainPct)}
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => startSell(r)} className="text-xs px-2 py-1 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950">Sell</button>
                <button onClick={() => startNote(r)} className={`text-xs px-2 py-1 rounded-lg border transition-colors ${hasNote ? "border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400" : "border-gray-200 dark:border-gray-700 text-gray-400"}`}>Note</button>
                <button onClick={() => onRemove(r.symbol)} className="ml-auto text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-300">Remove</button>
              </div>
              {sellingSymbol === r.symbol && (
                <div className="flex items-center gap-2 pt-1 bg-red-50 dark:bg-red-950/40 rounded-lg p-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Shares</span>
                  <input className={inputCls + " w-20"} placeholder={`max ${r.shares}`} value={sellShares} onChange={(e) => setSellShares(e.target.value)} autoFocus />
                  <span className="text-xs text-gray-500 dark:text-gray-400">@ $</span>
                  <input className={inputCls + " w-24"} value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
                  <button onClick={() => commitSell(r)} className="text-xs font-medium text-red-600 dark:text-red-400">Sell</button>
                  <button onClick={() => setSellingSymbol(null)} className="text-xs text-gray-400">Cancel</button>
                </div>
              )}
              {editingNote === r.symbol && (
                <div className="space-y-1 pt-1">
                  <textarea
                    autoFocus
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs p-2 dark:text-gray-200 outline-none focus:border-indigo-400 resize-none"
                    rows={2}
                    placeholder="Add a note about this position…"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => commitNote(r.symbol)} className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Save</button>
                    <button onClick={() => setEditingNote(null)} className="text-xs text-gray-400">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-500 dark:text-gray-400">
            <tr>
              {["Symbol", "Shares", "Price", "Day", "Mkt Value", "Total G/L", "Alloc", "Alert", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const triggered = isTriggered(r.symbol, r.current);
              const alert = getAlert(r.symbol);
              const actualPct = totalValue ? (r.marketValue / totalValue) * 100 : 0;
              const target = targets[r.symbol];
              const drift = target != null ? actualPct - target : null;
              const hasNote = !!notes[r.symbol];

              return (
                <>
                  <tr
                    key={r.symbol}
                    className={`border-t border-gray-100 dark:border-gray-800 ${triggered ? "bg-yellow-50 dark:bg-yellow-950/30" : ""}`}
                  >
                    {/* Symbol + note icon */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold dark:text-white">{r.symbol}</span>
                        <button
                          onClick={() => editingNote === r.symbol ? setEditingNote(null) : startNote(r)}
                          className={`text-xs transition-colors ${hasNote ? "text-indigo-400 hover:text-indigo-600" : "text-gray-200 dark:text-gray-700 hover:text-gray-400"}`}
                          title={hasNote ? notes[r.symbol] : "Add note"}
                        >
                          📝
                        </button>
                        {triggered && (
                          <span className="rounded-full bg-yellow-100 dark:bg-yellow-900 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-300">🔔</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 dark:text-gray-300">{r.shares}</td>
                    <td className="px-4 py-3 dark:text-gray-300">{fmt(r.current)}</td>
                    <td className={`px-4 py-3 ${tone(r.dayChange)}`}>{r.dayChangePct.toFixed(2)}%</td>
                    <td className="px-4 py-3 dark:text-gray-300">{fmt(r.marketValue)}</td>
                    <td className={`px-4 py-3 ${tone(r.totalGain)}`}>
                      {fmt(r.totalGain)} ({r.totalGainPct.toFixed(1)}%)
                    </td>

                    {/* Alloc / Target */}
                    <td className="px-4 py-3">
                      {editingTarget === r.symbol ? (
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            className={inputCls + " w-16"}
                            placeholder="0–100"
                            value={targetInput}
                            onChange={(e) => setTargetInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") commitTarget(r.symbol); if (e.key === "Escape") setEditingTarget(null); }}
                          />
                          <span className="text-xs text-gray-400">%</span>
                          <button onClick={() => commitTarget(r.symbol)} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">✓</button>
                          {target != null && <button onClick={() => { onRemoveTarget(r.symbol); setEditingTarget(null); }} className="text-xs text-red-400">✕</button>}
                        </div>
                      ) : (
                        <button onClick={() => startTarget(r)} className="text-left group">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {actualPct.toFixed(1)}%
                            {target != null && <span className="text-gray-300 dark:text-gray-600"> / {target.toFixed(1)}%</span>}
                          </p>
                          {drift != null && (
                            <p className={`text-xs font-medium ${driftColor(drift)}`}>
                              {drift >= 0 ? "+" : ""}{drift.toFixed(1)}% drift
                            </p>
                          )}
                          {target == null && (
                            <p className="text-xs text-gray-200 dark:text-gray-700 group-hover:text-gray-400 transition-colors">+ target</p>
                          )}
                        </button>
                      )}
                    </td>

                    {/* Alert */}
                    <td className="px-4 py-3">
                      {editingAlert === r.symbol ? (
                        <div className="flex items-center gap-1">
                          <select value={alertDir} onChange={(e) => setAlertDir(e.target.value as "above" | "below")} className={inputCls}>
                            <option value="above">≥</option>
                            <option value="below">≤</option>
                          </select>
                          <input autoFocus className={inputCls + " w-20"} value={alertInput} onChange={(e) => setAlertInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commitAlert(r.symbol); if (e.key === "Escape") setEditingAlert(null); }} />
                          <button onClick={() => commitAlert(r.symbol)} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">✓</button>
                          {alert && <button onClick={() => { onRemoveAlert(r.symbol); setEditingAlert(null); }} className="text-xs text-red-400">✕</button>}
                        </div>
                      ) : alert ? (
                        <button onClick={() => startAlert(r)} className={`text-xs ${triggered ? "text-yellow-600 dark:text-yellow-400 font-medium" : "text-gray-400 dark:text-gray-500"} hover:text-indigo-600`}>
                          {alert.direction === "above" ? "≥" : "≤"} {fmt(alert.targetPrice)}
                        </button>
                      ) : (
                        <button onClick={() => startAlert(r)} className="text-xs text-gray-200 dark:text-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400">+ Set</button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => sellingSymbol === r.symbol ? setSellingSymbol(null) : startSell(r)}
                          className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 font-medium"
                        >
                          Sell
                        </button>
                        <button onClick={() => onRemove(r.symbol)} className="text-gray-300 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400">✕</button>
                      </div>
                    </td>
                  </tr>

                  {/* Sell expanded row */}
                  {sellingSymbol === r.symbol && (
                    <tr key={`${r.symbol}-sell`} className="border-t border-red-100 dark:border-red-900">
                      <td colSpan={9} className="px-4 py-3 bg-red-50 dark:bg-red-950/40">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-red-700 dark:text-red-400">Sell {r.symbol}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Shares (max {r.shares})</span>
                            <input autoFocus className={inputCls + " w-24"} placeholder="0" value={sellShares} onChange={(e) => setSellShares(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commitSell(r); if (e.key === "Escape") setSellingSymbol(null); }} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Price</span>
                            <input className={inputCls + " w-24"} value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commitSell(r); if (e.key === "Escape") setSellingSymbol(null); }} />
                          </div>
                          {sellShares && sellPrice && (
                            <span className={`text-xs font-medium ${tone((parseFloat(sellPrice) - r.costBasis) * parseFloat(sellShares))}`}>
                              {fmt((parseFloat(sellPrice) - r.costBasis) * parseFloat(sellShares))} realized
                            </span>
                          )}
                          <button onClick={() => commitSell(r)} className="text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg">Confirm Sell</button>
                          <button onClick={() => setSellingSymbol(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Note expanded row */}
                  {editingNote === r.symbol && (
                    <tr key={`${r.symbol}-note`} className="border-t border-indigo-100 dark:border-indigo-900">
                      <td colSpan={9} className="px-4 py-3 bg-indigo-50 dark:bg-indigo-950/30">
                        <div className="flex items-start gap-3">
                          <textarea
                            autoFocus
                            className="flex-1 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-xs p-2 dark:text-gray-200 outline-none focus:border-indigo-400 resize-none"
                            rows={2}
                            placeholder="Add your thesis or notes for this position…"
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                          />
                          <div className="flex flex-col gap-1 pt-1">
                            <button onClick={() => commitNote(r.symbol)} className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Save</button>
                            <button onClick={() => setEditingNote(null)} className="text-xs text-gray-400">Cancel</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
