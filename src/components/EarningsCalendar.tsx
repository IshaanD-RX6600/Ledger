"use client";
import { useEffect, useState } from "react";

interface Earning {
  symbol: string;
  date: string;
  hour: string;
  epsEstimate: number | null;
  quarter: number;
  year: number;
}

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export default function EarningsCalendar({ symbols }: { symbols: string[] }) {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(false);

  const symbolsKey = symbols.join(",");

  useEffect(() => {
    if (!symbolsKey) { setEarnings([]); return; }
    setLoading(true);
    fetch(`/api/earnings?symbols=${encodeURIComponent(symbolsKey)}`)
      .then((r) => r.json())
      .then((data) => setEarnings(data.earnings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [symbolsKey]);

  if (!symbols.length || (!loading && !earnings.length)) return null;

  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <h2 className="mb-4 font-semibold dark:text-white">Upcoming Earnings</h2>
      {loading ? (
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-36 h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {earnings.map((e, i) => {
            const days = daysUntil(e.date);
            const urgent = days <= 7;
            return (
              <div
                key={i}
                className={`flex-shrink-0 rounded-xl border p-3 w-36 ${
                  urgent
                    ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950"
                    : "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                }`}
              >
                <p className="font-bold text-sm dark:text-white">{e.symbol}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Q{e.quarter} {e.year}
                </p>
                <p
                  className={`text-xs font-medium mt-2 ${
                    urgent ? "text-amber-700 dark:text-amber-400" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days}d`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {e.hour === "bmo" ? "Before open" : e.hour === "amc" ? "After close" : ""}
                </p>
                {e.epsEstimate != null && (
                  <p className="text-xs text-gray-400 mt-0.5">EPS est. ${e.epsEstimate.toFixed(2)}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
